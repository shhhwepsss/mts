import { registerAs } from '@nestjs/config';
import { z } from 'zod/v4';

const databaseSchema = z.object({
  host: z.string().default('localhost'),
  port: z.coerce.number().default(5432),
  username: z.string().default('postgres'),
  password: z.string().default('postgres'),
  database: z.string().default('mts'),
});

export const databaseConfig = registerAs('database', () => {
  return databaseSchema.parse({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });
});
