import { describe, it, expect } from 'vitest';
import { anonymizeChat } from './anonymize';

describe('anonymizeChat', () => {
  describe('Telegram HTML format', () => {
    it('should anonymize Telegram user names', () => {
      const input = '<div class="from_name">Иван Петров</div>Привет!';
      const result = anonymizeChat(input);
      
      expect(result.anonymized).toContain('USER_1');
      expect(result.anonymized).not.toContain('Иван Петров');
      expect(result.mapping['Иван Петров']).toBe('USER_1');
    });

    it('should use same alias for repeated names', () => {
      const input = `
        <div class="from_name">Мария</div>Привет!
        <div class="from_name">Иван</div>Привет!
        <div class="from_name">Мария</div>Как дела?
      `;
      const result = anonymizeChat(input);
      
      expect(result.mapping['Мария']).toBe('USER_1');
      expect(result.mapping['Иван']).toBe('USER_2');
      // Мария should appear twice with same alias
      const mariaMatches = result.anonymized.match(/USER_1/g);
      expect(mariaMatches?.length).toBeGreaterThanOrEqual(2);
    });

    it('should not anonymize non-person names', () => {
      const input = '<div class="from_name">вы ушли с маршрута</div>';
      const result = anonymizeChat(input);
      
      expect(result.anonymized).toContain('вы ушли с маршрута');
    });
  });

  describe('WhatsApp format', () => {
    it('should anonymize WhatsApp message senders', () => {
      const input = '12.03.2024, 21:15 - Александр: Привет всем!';
      const result = anonymizeChat(input);
      
      expect(result.anonymized).toContain('USER_1');
      expect(result.anonymized).not.toContain('Александр');
      expect(result.mapping['Александр']).toBe('USER_1');
    });

    it('should preserve message content', () => {
      const input = '12.03.2024, 21:15 - Мария: Как дела?';
      const result = anonymizeChat(input);
      
      expect(result.anonymized).toContain('Как дела?');
      expect(result.anonymized).toContain('12.03.2024, 21:15');
    });
  });

  describe('Phone numbers', () => {
    it('should anonymize phone numbers', () => {
      const input = 'Мой номер: +7 (999) 123-45-67';
      const result = anonymizeChat(input);
      
      expect(result.anonymized).toContain('[PHONE]');
      expect(result.anonymized).not.toContain('+7 (999) 123-45-67');
    });

    it('should anonymize various phone formats', () => {
      const inputs = [
        '+1234567890',
        '8 (800) 555-35-35',
        '+7-999-123-4567',
      ];
      
      inputs.forEach(phone => {
        const result = anonymizeChat(phone);
        expect(result.anonymized).toContain('[PHONE]');
        expect(result.anonymized).not.toContain(phone);
      });
    });
  });

  describe('Email addresses', () => {
    it('should anonymize email addresses', () => {
      const input = 'Напиши мне: user@example.com';
      const result = anonymizeChat(input);
      
      expect(result.anonymized).toContain('[EMAIL]');
      expect(result.anonymized).not.toContain('user@example.com');
    });

    it('should anonymize various email formats', () => {
      const inputs = [
        'simple@example.com',
        'user.name+tag@example.co.uk',
        'test_user123@subdomain.example.org',
      ];
      
      inputs.forEach(email => {
        const result = anonymizeChat(email);
        expect(result.anonymized).toContain('[EMAIL]');
        expect(result.anonymized).not.toContain(email);
      });
    });
  });

  describe('Complex scenarios', () => {
    it('should handle mixed Telegram and personal data', () => {
      const input = `
        <div class="from_name">Сергей</div>
        Мой телефон: +79991234567
        Email: sergey@mail.ru
      `;
      const result = anonymizeChat(input);
      
      expect(result.anonymized).toContain('USER_1');
      expect(result.anonymized).toContain('[PHONE]');
      expect(result.anonymized).toContain('[EMAIL]');
      expect(result.anonymized).not.toContain('Сергей');
      expect(result.anonymized).not.toContain('+79991234567');
      expect(result.anonymized).not.toContain('sergey@mail.ru');
    });

    it('should replace names in all occurrences', () => {
      const input = `
        <div class="from_name">Анна</div>
        <div class="text bold">Анна Смирнова</div>
        Анна написала сообщение
      `;
      const result = anonymizeChat(input);
      
      // All occurrences of "Анна" should be replaced
      expect(result.anonymized).not.toContain('Анна');
      const userMatches = result.anonymized.match(/USER_1/g);
      expect(userMatches?.length).toBeGreaterThanOrEqual(2);
    });

    it('should create mapping for all anonymized persons', () => {
      const input = `
        <div class="from_name">Иван</div>
        <div class="from_name">Мария</div>
        <div class="from_name">Петр</div>
      `;
      const result = anonymizeChat(input);
      
      expect(Object.keys(result.mapping)).toHaveLength(3);
      expect(result.mapping['Иван']).toBe('USER_1');
      expect(result.mapping['Мария']).toBe('USER_2');
      expect(result.mapping['Петр']).toBe('USER_3');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      const result = anonymizeChat('');
      expect(result.anonymized).toBe('');
      expect(Object.keys(result.mapping)).toHaveLength(0);
    });

    it('should not crash on malformed HTML', () => {
      const input = '<div class="from_name">Unclosed';
      expect(() => anonymizeChat(input)).not.toThrow();
    });

    it('should handle names with numbers (not persons)', () => {
      const input = '<div class="from_name">User123</div>';
      const result = anonymizeChat(input);
      // Names with numbers are not considered person names
      expect(result.anonymized).toContain('User123');
    });

    it('should handle very long strings (not names)', () => {
      const longString = 'A'.repeat(100);
      const input = `<div class="from_name">${longString}</div>`;
      const result = anonymizeChat(input);
      // Very long strings are not considered person names
      expect(result.anonymized).toContain(longString);
    });
  });
});
