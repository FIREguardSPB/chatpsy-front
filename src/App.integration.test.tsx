import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as chatAnalyzerApi from './api/chatAnalyzer';
import type { AnalyzeResponse } from './types/api';

vi.mock('./api/chatAnalyzer');

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should complete full chat upload and analysis flow', async () => {
    const user = userEvent.setup();
    
    // Mock API responses
    const mockMetaResponse = {
      stats: {
        total_messages: 50,
        participants: [
          { id: 'USER_1', messages_count: 30, avg_message_length: 45 },
          { id: 'USER_2', messages_count: 20, avg_message_length: 60 },
        ],
        first_message_at: '2024-01-01T00:00:00Z',
        last_message_at: '2024-01-31T23:59:59Z',
      },
      upload_bytes: 50000,
      recommended_bytes: 100000,
    };

    const mockAnalysisResponse: AnalyzeResponse = {
      participants: [
        {
          id: 'USER_1',
          display_name: 'USER_1',
          traits: { friendly: 'дружелюбный', active: 'активный' },
          summary: 'Позитивный и активный участник диалога',
        },
        {
          id: 'USER_2',
          display_name: 'USER_2',
          traits: { calm: 'спокойный', thoughtful: 'вдумчивый' },
          summary: 'Рассудительный собеседник',
        },
      ],
      relationship: {
        description: 'Здоровые дружеские отношения с взаимным уважением',
        red_flags: [],
        green_flags: ['активное слушание', 'эмпатия', 'открытость'],
      },
      recommendations: [
        {
          title: 'Продолжайте общение',
          text: 'Ваше общение построено на доверии и уважении',
        },
      ],
      stats: mockMetaResponse.stats,
    };

    vi.mocked(chatAnalyzerApi.fetchChatMeta).mockResolvedValue(mockMetaResponse);
    vi.mocked(chatAnalyzerApi.analyzeChat).mockResolvedValue(mockAnalysisResponse);

    render(<App />);

    // Step 1: Upload chat file
    const fileContent = `
      <div class="from_name">Иван</div>Привет!
      <div class="from_name">Мария</div>Привет, как дела?
    `;
    const file = new File([fileContent], 'chat.html', { type: 'text/html' });
    const fileInput = screen.getByLabelText(/выбрать файлы/i);

    await user.upload(fileInput, file);

    // Wait for file processing and preview
    await waitFor(() => {
      expect(screen.getByText(/оригинал \(фрагмент/i)).toBeInTheDocument();
    });

    // Step 2: Click analyze button
    const analyzeButton = screen.getByRole('button', { name: /проанализировать переписку/i });
    await user.click(analyzeButton);

    // Step 3: Verify analysis results appear
    await waitFor(() => {
      expect(screen.getByText(/участники:/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify participant profiles
    expect(screen.getByText(/USER_1/)).toBeInTheDocument();
    expect(screen.getByText(/USER_2/)).toBeInTheDocument();

    // Verify relationship section
    expect(screen.getByText(/здоровые дружеские отношения/i)).toBeInTheDocument();

    // Verify recommendations
    expect(screen.getByText(/продолжайте общение/i)).toBeInTheDocument();
  });

  it('should handle rate limit error and show feedback form', async () => {
    const user = userEvent.setup();

    const error = new Error('Rate limit exceeded');
    (error as any).status = 429;
    (error as any).response = { data: { detail: 'Исчерпан лимит' } };

    vi.mocked(chatAnalyzerApi.analyzeChat).mockRejectedValue(error);
    vi.mocked(chatAnalyzerApi.fetchChatMeta).mockResolvedValue({
      stats: {
        total_messages: 10,
        participants: [],
        first_message_at: '2024-01-01T00:00:00Z',
        last_message_at: '2024-01-31T00:00:00Z',
      },
      upload_bytes: 5000,
      recommended_bytes: 100000,
    });

    render(<App />);

    // Upload file
    const file = new File(['test content'], 'chat.txt');
    const fileInput = screen.getByLabelText(/выбрать файлы/i);
    await user.upload(fileInput, file);

    // Wait for meta
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /проанализировать/i })).toBeInTheDocument();
    });

    // Click analyze
    const analyzeButton = screen.getByRole('button', { name: /проанализировать/i });
    await user.click(analyzeButton);

    // Verify rate limit message appears
    await waitFor(() => {
      expect(screen.getByText(/исчерпан лимит/i)).toBeInTheDocument();
    });

    // Verify feedback form appears
    expect(screen.getByRole('button', { name: /оставить отзыв/i })).toBeInTheDocument();
  });

  it('should handle file upload with anonymization preview', async () => {
    const user = userEvent.setup();

    vi.mocked(chatAnalyzerApi.fetchChatMeta).mockResolvedValue({
      stats: {
        total_messages: 5,
        participants: [],
        first_message_at: '2024-01-01T00:00:00Z',
        last_message_at: '2024-01-05T00:00:00Z',
      },
      upload_bytes: 2000,
      recommended_bytes: 100000,
    });

    render(<App />);

    const fileContent = '<div class="from_name">Александр</div>Тестовое сообщение';
    const file = new File([fileContent], 'chat.html', { type: 'text/html' });
    const fileInput = screen.getByLabelText(/выбрать файлы/i);

    await user.upload(fileInput, file);

    // Verify original preview contains real name
    await waitFor(() => {
      const originalPreview = screen.getByText(/оригинал \(фрагмент/i).parentElement;
      expect(originalPreview?.textContent).toContain('Александр');
    });

    // Verify anonymized preview contains USER_X
    const anonPreview = screen.getByText(/анонимизированный текст/i).parentElement;
    expect(anonPreview?.textContent).toContain('USER_');
    expect(anonPreview?.textContent).not.toContain('Александр');
  });
});
