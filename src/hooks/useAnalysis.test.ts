import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAnalysis } from './useAnalysis';
import * as chatAnalyzerApi from '../api/chatAnalyzer';

vi.mock('../api/chatAnalyzer');

describe('useAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with no result and not loading', () => {
    const { result } = renderHook(() => useAnalysis({}));
    
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should analyze chat successfully', async () => {
    const mockResult = {
      participants: [
        {
          id: 'USER_1',
          display_name: 'USER_1',
          traits: { friendly: 'дружелюбный' },
          summary: 'Позитивный участник',
        },
      ],
      relationship: {
        description: 'Хорошие отношения',
        red_flags: [],
        green_flags: ['взаимоуважение'],
      },
      recommendations: [
        { title: 'Совет', text: 'Продолжайте общаться' },
      ],
      stats: {
        total_messages: 10,
        participants: [{ id: 'USER_1', messages_count: 10, avg_message_length: 50 }],
        first_message_at: '2024-01-01T00:00:00Z',
        last_message_at: '2024-01-31T00:00:00Z',
      },
    };

    vi.mocked(chatAnalyzerApi.analyzeChat).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useAnalysis({}));

    await act(async () => {
      await result.current.analyze('test chat content', null, null);
    });

    await waitFor(() => {
      expect(result.current.result).toEqual(mockResult);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should set loading state during analysis', async () => {
    vi.mocked(chatAnalyzerApi.analyzeChat).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        participants: [],
        relationship: { description: '', red_flags: [], green_flags: [] },
        recommendations: [],
        stats: {
          total_messages: 0,
          participants: [],
          first_message_at: null,
          last_message_at: null,
        },
      }), 100))
    );

    const { result } = renderHook(() => useAnalysis({}));

    act(() => {
      result.current.analyze('test', null, null);
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle rate limit error', async () => {
    const onRateLimitError = vi.fn();
    const error = new Error('Rate limit exceeded');
    (error as any).status = 429;

    vi.mocked(chatAnalyzerApi.analyzeChat).mockRejectedValue(error);

    const { result } = renderHook(() => useAnalysis({ onRateLimitError }));

    await act(async () => {
      await result.current.analyze('test', null, null);
    });

    await waitFor(() => {
      expect(onRateLimitError).toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
    });
  });

  it('should reset result', () => {
    const { result } = renderHook(() => useAnalysis({}));

    act(() => {
      (result.current as any).setResult({ participants: [] });
    });

    act(() => {
      result.current.resetResult();
    });

    expect(result.current.result).toBeNull();
  });

  it('should handle generic errors', async () => {
    vi.mocked(chatAnalyzerApi.analyzeChat).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAnalysis({}));

    await act(async () => {
      await result.current.analyze('test', null, null);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.result).toBeNull();
    });
  });
});
