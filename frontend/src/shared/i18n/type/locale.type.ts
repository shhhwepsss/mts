import type { LOCALES } from '../locales';

export type LocaleCode = keyof typeof LOCALES;

export type LocaleDescriptor = {
  code: LocaleCode;
  label: string;
};
