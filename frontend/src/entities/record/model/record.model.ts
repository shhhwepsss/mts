import type { z } from 'zod';
import type {
  MaintenanceRecordSchema,
  RecordListResponseSchema,
  EditRecordParamsSchema,
} from '../schema/record.schema';

export type MaintenanceRecord = z.infer<typeof MaintenanceRecordSchema>;
export type RecordListResponse = z.infer<typeof RecordListResponseSchema>;
export type EditRecordParams = z.infer<typeof EditRecordParamsSchema>;
