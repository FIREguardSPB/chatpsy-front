import { httpClient } from './httpClient';
import type { AnalyzeResponse, ChatMetaResponse } from '../types/api';

/**
 * Analyzes chat text using AI model with optional date range filtering
 */
export async function analyzeChat(
  chatText: string,
  fromDate?: string | null,
  toDate?: string | null,
): Promise<AnalyzeResponse> {
  const payload: Record<string, unknown> = {
    chat_text: chatText,
  };

  if (fromDate) {
    payload.range_from = fromDate; // "YYYY-MM-DD"
  }
  if (toDate) {
    payload.range_to = toDate;
  }

  const response = await httpClient.post<AnalyzeResponse>(
    '/analyze_chat',
    payload,
  );
  return response.data;
}

/**
 * Processes ZIP file containing chat files and returns combined chat text
 */
export async function processZipFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await httpClient.post<{ chat_text: string }>('/analyze_zip', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.chat_text;
  } catch (error) {
    // Перебрасываем ошибку таймаута выше
    throw error;
  }
}

/**
 * Fetches lightweight metadata about the chat without AI analysis
 */
export async function fetchChatMeta(
  chatText: string,
): Promise<ChatMetaResponse> {
  // Для тестирования таймаута можно раскомментировать следующую строку:
  // await new Promise(resolve => setTimeout(resolve, 220001)); // Искусственный таймаут
  
  const response = await httpClient.post<ChatMetaResponse>('/chat_meta', {
    chat_text: chatText,
  });

  return response.data;
}