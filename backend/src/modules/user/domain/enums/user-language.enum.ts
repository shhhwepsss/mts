export enum UserLanguageEnum {
  EN = 'en',
  RU = 'ru',
}

export const DEFAULT_USER_LANGUAGE = UserLanguageEnum.EN;

export function isUserLanguage(value: unknown): value is UserLanguageEnum {
  return (
    typeof value === 'string' &&
    (Object.values(UserLanguageEnum) as string[]).includes(value)
  );
}
