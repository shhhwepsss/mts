import type { z } from 'zod';
import type { UserSchema } from '../schema/user.schema';

export type User = z.infer<typeof UserSchema>;
