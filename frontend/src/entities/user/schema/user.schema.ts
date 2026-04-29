import { z } from 'zod';

export const UserLanguageSchema = z.enum(['en', 'ru']);

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
  language: UserLanguageSchema,
});
