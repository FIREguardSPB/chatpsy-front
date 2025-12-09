import { describe, it, expect } from 'vitest';
import { formatBytes } from './formatBytes';

describe('formatBytes', () => {
  it('should format 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 Б');
  });

  it('should format negative bytes as 0', () => {
    expect(formatBytes(-100)).toBe('0 Б');
  });

  it('should format bytes correctly', () => {
    expect(formatBytes(500)).toBe('500.0 Б');
    expect(formatBytes(1023)).toBe('1023.0 Б');
  });

  it('should format kilobytes correctly', () => {
    expect(formatBytes(1024)).toBe('1.0 КБ');
    expect(formatBytes(5120)).toBe('5.0 КБ');
    expect(formatBytes(10240)).toBe('10.0 КБ');
  });

  it('should format megabytes correctly', () => {
    expect(formatBytes(1048576)).toBe('1.0 МБ');
    expect(formatBytes(5242880)).toBe('5.0 МБ');
    expect(formatBytes(10485760)).toBe('10.0 МБ');
  });

  it('should format gigabytes correctly', () => {
    expect(formatBytes(1073741824)).toBe('1.0 ГБ');
    expect(formatBytes(5368709120)).toBe('5.0 ГБ');
  });

  it('should format with one decimal place', () => {
    expect(formatBytes(1536)).toBe('1.5 КБ');
    expect(formatBytes(2621440)).toBe('2.5 МБ');
  });
});
