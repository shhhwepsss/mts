import type { Dictionary } from '../type/dictionary.type';
import { en } from './en';
import { ru } from './ru';

type LocaleEntry = {
  label: string;
  dictionary: Dictionary;
};

function defineLocales<T extends Record<string, LocaleEntry>>(locales: T): T {
  return locales;
}

export const LOCALES = defineLocales({
  en: { label: 'English', dictionary: en },
  ru: { label: 'Русский', dictionary: ru },
});

export const DEFAULT_LOCALE = 'en';
