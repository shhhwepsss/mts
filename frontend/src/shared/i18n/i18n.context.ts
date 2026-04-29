import { createContext } from 'react';
import type { TranslationKey } from './type/dictionary.type';
import type { LocaleCode } from './type/locale.type';
import type { TranslateParams } from './lib/translate.lib';

export type I18nContextValue = {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  t: (key: TranslationKey, params?: TranslateParams) => string;
  formatHours: (hours: number) => string;
  formatDate: (date: Date) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);
