import { useState, useCallback } from 'react';
import axios from 'axios';

import { httpClient } from '../api';
import type { AnalyzeResponse } from '../types';

interface UseAnalysisParams {
  onRateLimitError?: (message: string) => void;
  onError?: (error: Error) => void;
}

interface UseAnalysisReturn {
  result: AnalyzeResponse | null;
  loading: boolean;
  error: Error | null;
  analyze: (
    chatText: string,
    rangeFrom?: string | null,
    rangeTo?: string | null,
  ) => Promise<void>;
  resetResult: () => void;
}

interface ErrorResponse {
  detail?: string;
}

export function useAnalysis({
  onRateLimitError,
  onError,
}: UseAnalysisParams = {}): UseAnalysisReturn {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyze = useCallback(
    async (
      chatText: string,
      rangeFrom?: string | null,
      rangeTo?: string | null,
    ) => {
      setLoading(true);
      setError(null);

      try {
        const resp = await httpClient.post<AnalyzeResponse>('/analyze_chat', {
          chat_text: chatText,
          range_from: rangeFrom,
          range_to: rangeTo,
        });
        setResult(resp.data);
      } catch (err: unknown) {
        console.error(err);

        if (axios.isAxiosError(err) && err.response?.status === 429) {
          const detail = (err.response.data as ErrorResponse)?.detail;
          const message =
            detail ??
            'Тестовый лимит анализов исчерпан. Оставьте отзыв — и мы начислим ещё несколько запусков.';

          if (onRateLimitError) {
            onRateLimitError(message);
          }
        } else {
          const errorObj =
            err instanceof Error ? err : new Error('Unknown error');
          setError(errorObj);
          if (onError) {
            onError(errorObj);
          } else {
            alert('Ошибка при анализе. Проверь подключение или API.');
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [onRateLimitError, onError],
  );

  const resetResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    loading,
    error,
    analyze,
    resetResult,
  };
}
