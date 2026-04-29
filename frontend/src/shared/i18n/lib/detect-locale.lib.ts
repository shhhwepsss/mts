import { LOCALE_STORAGE_KEY } from '../const/storage-keys';
import { DEFAULT_LOCALE, LOCALES } from '../locales';
import type { LocaleCode } from '../type/locale.type';

function isSupported(code: string): code is LocaleCode {
  return Object.prototype.hasOwnProperty.call(LOCALES, code);
}

export function detectInitialLocale(): LocaleCode {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && isSupported(stored)) return stored;

  const browserLang = window.navigator.language.split('-')[0]?.toLowerCase();
  if (browserLang && isSupported(browserLang)) return browserLang;

  return DEFAULT_LOCALE;
}
