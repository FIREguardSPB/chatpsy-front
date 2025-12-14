import { useState, useCallback } from 'react';
import axios from 'axios';

import { fetchChatMeta } from '../api/chatAnalyzer';
import type { ChatMetaResponse } from '../types/api';
import { APP_TEXT } from '../constants';

interface UseChatMetaReturn {
  meta: ChatMetaResponse | null;
  rangeFrom: string | null;
  rangeTo: string | null;
  loading: boolean;
  error: Error | null;
  fetchMeta: (chatText: string) => Promise<void>;
  setRangeFrom: (value: string | null) => void;
  setRangeTo: (value: string | null) => void;
  handleRangeChange: (from: string | null, to: string | null) => void;
  resetMeta: () => void;
}

export function useChatMeta(): UseChatMetaReturn {
  const [meta, setMeta] = useState<ChatMetaResponse | null>(null);
  const [rangeFrom, setRangeFrom] = useState<string | null>(null);
  const [rangeTo, setRangeTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMeta = useCallback(async (chatText: string) => {
    setLoading(true);
    setError(null);

    try {
      const resp = await fetchChatMeta(chatText);
      const m = resp;
      setMeta(m);

      const first = m.stats.first_message_at
        ? m.stats.first_message_at.slice(0, 10)
        : null;
      const last = m.stats.last_message_at
        ? m.stats.last_message_at.slice(0, 10)
        : null;

      setRangeFrom(first);
      setRangeTo(last);
    } catch (err: unknown) {
      console.error('Error fetching chat metadata:', err);
      
      if (axios.isAxiosError(err)) {
        // Проверяем, является ли ошибка таймаутом
        if (err.code === 'ECONNABORTED' || 
            err.message.includes('timeout') || 
            err.message.includes('Timeout') ||
            (err.response && err.response.status === 408)) {
          const timeoutError = new Error(APP_TEXT.TIMEOUT_ERROR_MESSAGE);
          timeoutError.name = 'TimeoutError';
          setError(timeoutError);
        } else {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } else {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
      
      setMeta(null);
      setRangeFrom(null);
      setRangeTo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRangeChange = useCallback(
    (from: string | null, to: string | null) => {
      setRangeFrom(from);
      setRangeTo(to);
    },
    [],
  );

  const resetMeta = useCallback(() => {
    setMeta(null);
    setRangeFrom(null);
    setRangeTo(null);
    setError(null);
  }, []);

  return {
    meta,
    rangeFrom,
    rangeTo,
    loading,
    error,
    fetchMeta,
    setRangeFrom,
    setRangeTo,
    handleRangeChange,
    resetMeta,
  };
}