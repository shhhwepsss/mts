import type { Dictionary, TranslationKey } from '../type/dictionary.type';

export type TranslateParams = Record<string, string | number>;

export function translate(
  dictionary: Dictionary,
  key: TranslationKey,
  params?: TranslateParams,
): string {
  const segments = key.split('.');
  let node: unknown = dictionary;

  for (const segment of segments) {
    if (node && typeof node === 'object' && segment in node) {
      node = (node as Record<string, unknown>)[segment];
    } else {
      console.warn(`[i18n] Missing translation for key "${key}"`);
      return key;
    }
  }

  if (typeof node !== 'string') {
    console.warn(`[i18n] Translation key "${key}" did not resolve to a string`);
    return key;
  }

  if (!params) return node;

  return node.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in params ? String(params[name]) : `{${name}}`,
  );
}
