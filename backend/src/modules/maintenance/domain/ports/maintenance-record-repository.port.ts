import { MaintenanceRecord } from '@/modules/maintenance/domain/entities/maintenance-record.entity';

export const MAINTENANCE_RECORD_REPOSITORY = Symbol(
  'MAINTENANCE_RECORD_REPOSITORY',
);

export interface MaintenanceRecordRepositoryPort {
  findById(id: string): Promise<MaintenanceRecord | null>;
  findByMotorcycleId(
    motorcycleId: string,
    taskId: string | null,
    page: number | null,
    limit: number | null,
  ): Promise<{ records: MaintenanceRecord[]; total: number }>;
  findLatestByTaskId(taskId: string): Promise<MaintenanceRecord | null>;
  findPreviousByTaskId(
    taskId: string,
    excludeRecordId: string,
  ): Promise<MaintenanceRecord | null>;
  save(record: MaintenanceRecord): Promise<MaintenanceRecord>;
  delete(id: string): Promise<void>;
  deleteByMotorcycleId(motorcycleId: string): Promise<void>;
}
