import { useContext } from 'react';
import { I18nContext } from './i18n.context';
import { LOCALES } from './locales';
import type { LocaleCode, LocaleDescriptor } from './type/locale.type';

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider>');

  const locales: LocaleDescriptor[] = (Object.keys(LOCALES) as LocaleCode[]).map((code) => ({
    code,
    label: LOCALES[code].label,
  }));

  return { ...ctx, locales };
}
