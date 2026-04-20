import { z } from 'zod';

export const MotorcycleTypeSchema = z.enum(['ENDURO']);

export const MotorcycleSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  model: z.string(),
  year: z.number(),
  type: MotorcycleTypeSchema,
  currentHours: z.number(),
  imageUrl: z.string().nullable(),
});

export const MotorcycleListSchema = z.array(MotorcycleSchema);

export const CreateMotorcycleParamsSchema = z.object({
  name: z.string(),
  brand: z.string(),
  model: z.string(),
  year: z.number(),
  type: MotorcycleTypeSchema,
  currentHours: z.number(),
  imageUrl: z.string().optional(),
});

export const UpdateMotorcycleParamsSchema = z.object({
  name: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  type: MotorcycleTypeSchema.optional(),
  imageUrl: z.string().optional(),
});
