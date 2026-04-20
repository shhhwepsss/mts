import type { z } from 'zod';
import type {
  MotorcycleSchema,
  MotorcycleTypeSchema,
  CreateMotorcycleParamsSchema,
  UpdateMotorcycleParamsSchema,
} from '../schema/motorcycle.schema';

export type Motorcycle = z.infer<typeof MotorcycleSchema>;
export type MotorcycleType = z.infer<typeof MotorcycleTypeSchema>;
export type CreateMotorcycleParams = z.infer<typeof CreateMotorcycleParamsSchema>;
export type UpdateMotorcycleParams = z.infer<typeof UpdateMotorcycleParamsSchema>;
