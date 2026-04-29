import { registerAs } from '@nestjs/config';
import { z } from 'zod/v4';

const jwtSchema = z.object({
  accessSecret: z.string(),
  refreshSecret: z.string(),
  accessExpiration: z.string().default('15m'),
  refreshExpiration: z.string().default('7d'),
});

export const jwtConfig = registerAs('jwt', () => {
  return jwtSchema.parse({
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION,
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION,
  });
});
