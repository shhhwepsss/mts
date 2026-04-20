import type { ZodType } from 'zod';

export function safeParseApi<T>(schema: ZodType<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[${label}] response validation failed`, result.error.issues);
    throw result.error;
  }
  return result.data;
}
