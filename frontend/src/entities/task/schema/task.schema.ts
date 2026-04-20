import { z } from 'zod';

export const TaskStatusSchema = z.enum(['OK', 'DUE_SOON', 'OVERDUE']);

export const TaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  intervalHours: z.number(),
  lastServicedAtHours: z.number().nullable(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  status: TaskStatusSchema,
  hoursRemaining: z.number(),
});

export const TaskListSchema = z.array(TaskSchema);

export const CreateTaskParamsSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  intervalHours: z.number(),
});

export const UpdateTaskParamsSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  intervalHours: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const CompleteTaskParamsSchema = z.object({
  performedAtHours: z.number(),
  performedAtDate: z.string(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});
