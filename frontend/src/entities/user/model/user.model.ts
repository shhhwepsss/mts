import type { z } from 'zod';
import type { UserSchema, UserLanguageSchema } from '../schema/user.schema';

export type User = z.infer<typeof UserSchema>;
export type UserLanguage = z.infer<typeof UserLanguageSchema>;
