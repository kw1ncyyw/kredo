/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from './types';

const SAFE_PASSWORD_PATTERN = /^[A-Za-z0-9!@#$%^&*()_\-+=.,?/:;[\]{}]+$/;
const CYRILLIC_PATTERN = /[а-яА-ЯіІїЇєЄґҐёЁ]/;

export function normalizePasswordInput(password: string): string {
  return password.trim();
}

export function isSafePasswordCharset(password: string): boolean {
  const normalized = normalizePasswordInput(password);
  return normalized.length > 0
    && SAFE_PASSWORD_PATTERN.test(normalized)
    && !CYRILLIC_PATTERN.test(normalized);
}

export function passwordCharsetError(lang: Language): string {
  if (lang === 'ua') return 'Пароль має містити лише латинські літери, цифри та символи.';
  if (lang === 'ru') return 'Пароль должен содержать только латинские буквы, цифры и символы.';
  return 'Password must contain only Latin letters, numbers, and symbols.';
}

