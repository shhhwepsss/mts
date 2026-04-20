import type { MaintenanceRecord } from '@/entities/record';

export interface RecordListProps {
  motorcycleId: string;
  records: MaintenanceRecord[];
}
