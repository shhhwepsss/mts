import { registerAs } from '@nestjs/config';
import { z } from 'zod/v4';

const googleSchema = z.object({
  clientId: z.string(),
});

export const googleConfig = registerAs('google', () => {
  return googleSchema.parse({
    clientId: process.env.GOOGLE_CLIENT_ID,
  });
});
