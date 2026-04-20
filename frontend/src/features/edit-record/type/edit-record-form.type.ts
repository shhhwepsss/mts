import type { MaintenanceRecord } from '@/entities/record';

export interface EditRecordFormProps {
  motorcycleId: string;
  record: MaintenanceRecord;
  onSuccess?: () => void;
  onCancel?: () => void;
}
