import { describe, it, expect } from 'vitest';
import { estimateRangeBytes, formatDateLabel } from './dateRange';
import type { ChatMetaResponse } from '../types/api';

describe('estimateRangeBytes', () => {
  const createMockMeta = (
    firstMessage: string,
    lastMessage: string,
    uploadBytes: number
  ): ChatMetaResponse => ({
    stats: {
      total_messages: 100,
      participants: [],
      first_message_at: firstMessage,
      last_message_at: lastMessage,
    },
    upload_bytes: uploadBytes,
    recommended_bytes: uploadBytes,
  });

  it('should return null if no message dates', () => {
    const meta = createMockMeta('', '', 1000);
    expect(estimateRangeBytes(meta, null, null)).toBeNull();
  });

  it('should return full size for full range', () => {
    const meta = createMockMeta('2024-01-01T00:00:00Z', '2024-01-31T23:59:59Z', 10000);
    const result = estimateRangeBytes(meta, null, null);
    expect(result).toBe(10000);
  });

  it('should return half size for half range', () => {
    const meta = createMockMeta('2024-01-01T00:00:00Z', '2024-01-31T00:00:00Z', 10000);
    // From Jan 1 to Jan 16 (approximately half month)
    const result = estimateRangeBytes(meta, '2024-01-01', '2024-01-16');
    expect(result).toBeGreaterThan(4000);
    expect(result).toBeLessThan(6000);
  });

  it('should clamp dates to valid range', () => {
    const meta = createMockMeta('2024-01-01T00:00:00Z', '2024-01-31T00:00:00Z', 10000);
    // Dates outside the valid range should be clamped
    const result = estimateRangeBytes(meta, '2023-12-01', '2024-02-28');
    expect(result).toBe(10000);
  });

  it('should handle invalid date strings', () => {
    const meta = createMockMeta('2024-01-01T00:00:00Z', '2024-01-31T00:00:00Z', 10000);
    const result = estimateRangeBytes(meta, 'invalid-date', 'also-invalid');
    expect(result).toBe(10000); // Falls back to full range
  });

  it('should return null if range is invalid', () => {
    const meta = createMockMeta('2024-01-31T00:00:00Z', '2024-01-01T00:00:00Z', 10000);
    expect(estimateRangeBytes(meta, null, null)).toBeNull();
  });
});

describe('formatDateLabel', () => {
  it('should format valid date', () => {
    const result = formatDateLabel('2024-01-15T10:30:00Z');
    expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/); // DD.MM.YYYY format
  });

  it('should return dash for null', () => {
    expect(formatDateLabel(null)).toBe('—');
  });

  it('should return dash for invalid date', () => {
    expect(formatDateLabel('invalid-date')).toBe('—');
  });

  it('should return dash for empty string', () => {
    expect(formatDateLabel('')).toBe('—');
  });
});
