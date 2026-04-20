import { z } from 'zod';

export const MaintenanceRecordSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  performedAtHours: z.number(),
  performedAtDate: z.string(),
  notes: z.string().nullable(),
  photos: z.array(z.string()),
});

export const RecordListResponseSchema = z.object({
  records: z.array(MaintenanceRecordSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const EditRecordParamsSchema = z.object({
  performedAtHours: z.number().optional(),
  performedAtDate: z.string().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});
