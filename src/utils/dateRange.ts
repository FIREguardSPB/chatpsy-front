import type { ChatMetaResponse } from '../types/api';

/**
 * Estimates the byte size of chat data within a specified date range
 * based on the proportion of time covered by the range.
 */
export function estimateRangeBytes(
  meta: ChatMetaResponse,
  rangeFrom: string | null,
  rangeTo: string | null,
): number | null {
  const { stats, upload_bytes } = meta;
  if (!stats.first_message_at || !stats.last_message_at) return null;

  const fullStart = new Date(stats.first_message_at);
  const fullEnd = new Date(stats.last_message_at);
  if (
    Number.isNaN(fullStart.getTime()) ||
    Number.isNaN(fullEnd.getTime()) ||
    fullEnd <= fullStart
  ) {
    return null;
  }

  let from = rangeFrom ? new Date(rangeFrom) : fullStart;
  let to = rangeTo ? new Date(rangeTo) : fullEnd;

  if (Number.isNaN(from.getTime())) from = fullStart;
  if (Number.isNaN(to.getTime())) to = fullEnd;

  if (from < fullStart) from = fullStart;
  if (to > fullEnd) to = fullEnd;

  const fullMs = fullEnd.getTime() - fullStart.getTime();
  const rangeMs = to.getTime() - from.getTime();

  if (rangeMs <= 0 || fullMs <= 0) return null;

  const fraction = Math.min(1, Math.max(0, rangeMs / fullMs));
  return Math.round(upload_bytes * fraction);
}

/**
 * Formats a date string to localized date label
 */
export function formatDateLabel(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ru-RU');
}
