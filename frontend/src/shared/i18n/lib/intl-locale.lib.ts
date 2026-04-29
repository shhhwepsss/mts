import type { LocaleCode } from '../type/locale.type';

const INTL_LOCALES: Record<LocaleCode, string> = {
  en: 'en-US',
  ru: 'ru-RU',
};

export function toIntlLocale(locale: LocaleCode): string {
  return INTL_LOCALES[locale];
}
