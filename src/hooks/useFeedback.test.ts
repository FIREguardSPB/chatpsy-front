import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useFeedback } from './useFeedback';

describe('useFeedback', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with feedback not used', () => {
    const { result } = renderHook(() => useFeedback());
    expect(result.current.shouldShowFeedback(true)).toBe(true);
  });

  it('should not show feedback when no rate limit', () => {
    const { result } = renderHook(() => useFeedback());
    expect(result.current.shouldShowFeedback(false)).toBe(false);
  });

  it('should mark feedback as used', () => {
    const { result } = renderHook(() => useFeedback());

    act(() => {
      result.current.markFeedbackUsed(3);
    });

    expect(result.current.shouldShowFeedback(true)).toBe(false);
  });

  it('should persist feedback state in localStorage', () => {
    const { result } = renderHook(() => useFeedback());

    act(() => {
      result.current.markFeedbackUsed(5);
    });

    // Unmount and remount
    const { result: newResult } = renderHook(() => useFeedback());
    expect(newResult.current.shouldShowFeedback(true)).toBe(false);
  });

  it('should handle zero granted analyses', () => {
    const { result } = renderHook(() => useFeedback());

    act(() => {
      result.current.markFeedbackUsed(0);
    });

    expect(result.current.shouldShowFeedback(true)).toBe(false);
  });
});
