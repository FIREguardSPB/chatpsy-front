import { useState, useCallback } from 'react';
import axios from 'axios';

import { analyzeChat } from '../api/chatAnalyzer';
import type { AnalyzeResponse } from '../types/api';
import { APP_TEXT } from '../constants';

interface UseAnalysisProps {
  onRateLimitError?: (message: string) => void;
  onError?: (error: Error) => void;
}

interface UseAnalysisReturn {
  result: AnalyzeResponse | null;
  loading: boolean;
  error: Error | null;
  analyze: (
    chatText: string,
    fromDate?: string | null,
    toDate?: string | null,
  ) => Promise<void>;
  resetResult: () => void;
}

type ErrorResponse = {
  detail?: string;
};

export const useAnalysis = ({
  onRateLimitError,
  onError,
}: UseAnalysisProps = {}): UseAnalysisReturn => {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyze = useCallback(
    async (
      chatText: string,
      fromDate?: string | null,
      toDate?: string | null,
    ) => {
      setLoading(true);
      setError(null);

      try {
        const resp = await analyzeChat(chatText, fromDate, toDate);
        setResult(resp);
      } catch (err: unknown) {
        console.error(err);

        if (axios.isAxiosError(err)) {
          // Проверяем, является ли ошибка таймаутом
          if (err.code === 'ECONNABORTED' ||
              err.message.includes('timeout') ||
              err.message.includes('Timeout') ||
              (err.response && err.response.status === 408)) {
            const timeoutError = new Error(APP_TEXT.TIMEOUT_ERROR_MESSAGE);
            timeoutError.name = 'TimeoutError';
            setError(timeoutError);
            if (onError) {
              onError(timeoutError);
            }
            return;
          }

          if (err.response?.status === 429) {
            const detail = (err.response.data as ErrorResponse)?.detail;
            const message =
              detail ??
              'Тестовый лимит анализов исчерпан. Оставьте отзыв — и мы начислим ещё несколько запусков.';

            if (onRateLimitError) {
              onRateLimitError(message);
            }
          } else {
            const errorObj = err instanceof Error ? err : new Error('Unknown error');
            setError(errorObj);
            if (onError) {
              onError(errorObj);
            } else {
              alert('Ошибка при анализе. Проверь подключение или API.');
            }
          }
        } else {
          const errorObj = err instanceof Error ? err : new Error('Unknown error');
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
};
