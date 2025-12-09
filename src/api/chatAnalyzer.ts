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
 * Fetches lightweight metadata about the chat without AI analysis
 */
export async function fetchChatMeta(
  chatText: string,
): Promise<ChatMetaResponse> {
  const response = await httpClient.post<ChatMetaResponse>('/chat_meta', {
    chat_text: chatText,
  });

  return response.data;
}

