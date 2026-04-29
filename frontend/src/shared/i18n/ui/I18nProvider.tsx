import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, type User } from '@/entities/user';
import { useAuth } from '@/shared/auth';
import { CURRENT_USER_QUERY_KEY } from '@/shared/auth/const/query-keys';
import { formatDate as baseFormatDate, formatHours as baseFormatHours } from '@/shared/lib';
import { LOCALE_STORAGE_KEY } from '../const/storage-keys';
import { LOCALES } from '../locales';
import { detectInitialLocale } from '../lib/detect-locale.lib';
import { toIntlLocale } from '../lib/intl-locale.lib';
import { translate, type TranslateParams } from '../lib/translate.lib';
import { I18nContext, type I18nContextValue } from '../i18n.context';
import type { TranslationKey } from '../type/dictionary.type';
import type { LocaleCode } from '../type/locale.type';

export function I18nProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [fallbackLocale, setFallbackLocale] = useState<LocaleCode>(() =>
    detectInitialLocale(),
  );

  const locale: LocaleCode = (user?.language as LocaleCode | undefined) ?? fallbackLocale;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const mutation = useMutation({
    mutationFn: (language: LocaleCode) => userApi.updateProfile({ language }),
    onSuccess: (updated) => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, updated);
    },
  });

  const setLocale = useCallback(
    (next: LocaleCode) => {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
      setFallbackLocale(next);

      if (user) {
        queryClient.setQueryData<User | null>(CURRENT_USER_QUERY_KEY, (prev) =>
          prev ? { ...prev, language: next } : prev,
        );
        mutation.mutate(next);
      }
    },
    [user, mutation, queryClient],
  );

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = LOCALES[locale].dictionary;
    const t = (key: TranslationKey, params?: TranslateParams) =>
      translate(dictionary, key, params);
    return {
      locale,
      setLocale,
      t,
      formatHours: (hours: number) => baseFormatHours(hours, t('units.hour')),
      formatDate: (date: Date) => baseFormatDate(date, toIntlLocale(locale)),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
