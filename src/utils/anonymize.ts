import type { AnonymizationResult } from "../types/chat";

let userCounter = 1;

type AliasKind = "person";

/**
 * Map только для людей (участники чата).
 * Телефоны / email сюда не попадают.
 */
const personMap = new Map<string, { alias: string; kind: AliasKind }>();

function resetState() {
  userCounter = 1;
  personMap.clear();
}

function getPersonAlias(original: string): string {
  const key = original.trim();
  if (!key) return original;

  const existing = personMap.get(key);
  if (existing) return existing.alias;

  const alias = `USER_${userCounter++}`;
  personMap.set(key, { alias, kind: "person" });
  return alias;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Примитивная эвристика: похоже ли это на имя человека.
 * - Начинается с заглавной буквы
 * - Не слишком длинное
 * - Без цифр
 */
function isProbablePersonName(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  if (s.length > 60) return false;
  if (/\d/.test(s)) return false;

  const firstChar = s[0];
  if (!/[A-ZА-ЯЁ]/.test(firstChar)) return false;

  return true;
}

/**
 * Анонимизация текста переписки:
 * - Telegram HTML: <div class="from_name">Имя</div>
 * - WhatsApp txt: "ДД.ММ.ГГГГ, ЧЧ:ММ - Имя: Сообщение"
 * - Телефоны и e-mail: в [PHONE] и [EMAIL]
 */
export function anonymizeChat(text: string): AnonymizationResult {
  resetState();

  let processed = text;

  // 1) Telegram HTML: <div class="from_name">Имя</div>
  const telegramNameRegex =
    /(<div\s+class="from_name">)([^<]+)(<\/div>)/g;

  processed = processed.replace(
    telegramNameRegex,
    (match, openTag, name, closeTag) => {
      const rawName = String(name).trim();
      if (!isProbablePersonName(rawName)) {
        // не похоже на имя (например "вы ушли с маршрута") — не трогаем
        return match;
      }
      const alias = getPersonAlias(rawName);
      return `${openTag}${alias}${closeTag}`;
    }
  );

  // 2) Телефоны — более строгий паттерн, без точек/двоеточий и с >=10 цифр
  const phoneRegex = /\+?\d[\d\s\-()]{8,}\d/g;
  processed = processed.replace(phoneRegex, "[PHONE]");

  // 3) E-mail
  const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
  processed = processed.replace(emailRegex, "[EMAIL]");

  // 4) WhatsApp txt: "12.03.2025, 21:15 - Имя: Сообщение"
  const whatsappLineRegex =
    /^(\d{2}\.\d{2}\.\d{4}),\s(\d{2}:\d{2})\s-\s([^:]+):\s(.*)$/gm;

  processed = processed.replace(
    whatsappLineRegex,
    (_match, date, time, name, msg) => {
      const rawName = String(name).trim();
      const alias = isProbablePersonName(rawName)
        ? getPersonAlias(rawName)
        : rawName;
      return `${date}, ${time} - ${alias}: ${msg}`;
    }
  );

  // 5) Доп. проход: заменяем все найденные имена в остальных местах
  // (например, в шапке <div class="text bold">Серго Билайн</div>)
  for (const [orig, info] of personMap.entries()) {
    if (info.kind !== "person") continue;
    const escaped = escapeRegExp(orig);
    const re = new RegExp(escaped, "g");
    processed = processed.replace(re, info.alias);
  }

  // 6) Готовим mapping только по людям
  const mapping: Record<string, string> = {};
  for (const [orig, { alias }] of personMap.entries()) {
    mapping[orig] = alias;
  }

  return {
    anonymized: processed,
    mapping,
  };
}
