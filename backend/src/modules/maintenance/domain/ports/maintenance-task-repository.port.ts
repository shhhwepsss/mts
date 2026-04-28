import { MaintenanceTask } from '@/modules/maintenance/domain/entities/maintenance-task.entity';

export const MAINTENANCE_TASK_REPOSITORY = Symbol(
  'MAINTENANCE_TASK_REPOSITORY',
);

export interface MaintenanceTaskRepositoryPort {
  findById(id: string): Promise<MaintenanceTask | null>;
  findByMotorcycleId(motorcycleId: string): Promise<MaintenanceTask[]>;
  save(task: MaintenanceTask): Promise<MaintenanceTask>;
  saveMany(tasks: MaintenanceTask[]): Promise<MaintenanceTask[]>;
  delete(id: string): Promise<void>;
  deleteByMotorcycleId(motorcycleId: string): Promise<void>;
}
