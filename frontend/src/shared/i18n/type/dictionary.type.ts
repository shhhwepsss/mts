import type { en } from '../locales/en';

export type Dictionary = {
  -readonly [K in keyof typeof en]: { -readonly [P in keyof (typeof en)[K]]: DeepWritable<(typeof en)[K][P]> };
};

type DeepWritable<T> = T extends string
  ? string
  : { -readonly [K in keyof T]: DeepWritable<T[K]> };

type Path<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...Path<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[]> = T extends [infer F extends string, ...infer R extends string[]]
  ? R extends []
    ? F
    : `${F}.${Join<R>}`
  : never;

export type TranslationKey = Join<Path<typeof en>>;
