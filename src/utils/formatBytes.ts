import { FILE_SIZE_UNITS } from '../constants';

/**
 * Formats bytes into human-readable format (Б, КБ, МБ, ГБ)
 */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 Б";

  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < FILE_SIZE_UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(1)} ${FILE_SIZE_UNITS[unitIndex]}`;
}
