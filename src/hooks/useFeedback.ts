import { useState, useCallback } from 'react';

import { FEEDBACK_FLAG_KEY } from '../constants';

interface UseFeedbackReturn {
  feedbackUsed: boolean;
  markFeedbackUsed: (granted: number) => void;
  shouldShowFeedback: (hasRateLimit: boolean) => boolean;
}

export function useFeedback(): UseFeedbackReturn {
  const [feedbackUsed, setFeedbackUsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(FEEDBACK_FLAG_KEY) === '1';
    } catch {
      return false;
    }
  });

  const markFeedbackUsed = useCallback((_granted: number) => {
    setFeedbackUsed(true);
    try {
      window.localStorage.setItem(FEEDBACK_FLAG_KEY, '1');
    } catch {
      // Ignore storage errors
    }
  }, []);

  const shouldShowFeedback = useCallback(
    (hasRateLimit: boolean) => {
      return hasRateLimit && !feedbackUsed;
    },
    [feedbackUsed],
  );

  return {
    feedbackUsed,
    markFeedbackUsed,
    shouldShowFeedback,
  };
}
