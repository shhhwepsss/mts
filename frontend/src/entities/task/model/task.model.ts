import type { z } from 'zod';
import type {
  TaskSchema,
  TaskStatusSchema,
  CreateTaskParamsSchema,
  UpdateTaskParamsSchema,
  CompleteTaskParamsSchema,
} from '../schema/task.schema';

export type Task = z.infer<typeof TaskSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type CreateTaskParams = z.infer<typeof CreateTaskParamsSchema>;
export type UpdateTaskParams = z.infer<typeof UpdateTaskParamsSchema>;
export type CompleteTaskParams = z.infer<typeof CompleteTaskParamsSchema>;
