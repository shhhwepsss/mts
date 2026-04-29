import { Injectable, Inject } from '@nestjs/common';
import {
  MAINTENANCE_TASK_REPOSITORY,
  type MaintenanceTaskRepositoryPort,
} from '@/modules/maintenance/domain/ports/maintenance-task-repository.port';
import { MaintenanceTask } from '@/modules/maintenance/domain/entities/maintenance-task.entity';
import { DEFAULT_TASKS } from '@/modules/maintenance/domain/constants/default-tasks.constants';
import { MotorcycleTypeEnum } from '@/modules/motorcycle/domain/enums/motorcycle-type.enum';

@Injectable()
export class DefaultTaskFactory {
  constructor(
    @Inject(MAINTENANCE_TASK_REPOSITORY)
    private readonly taskRepo: MaintenanceTaskRepositoryPort,
  ) {}

  async createDefaultTasks(
    motorcycleId: string,
    type: MotorcycleTypeEnum,
  ): Promise<MaintenanceTask[]> {
    const templates = DEFAULT_TASKS[type] || [];
    const tasks = templates.map(
      (t) =>
        new MaintenanceTask({
          id: null,
          motorcycleId,
          name: t.name,
          description: t.description,
          intervalHours: t.intervalHours,
          lastServicedAtHours: 0,
          isDefault: true,
          isActive: true,
          createdAt: null,
          updatedAt: null,
        }),
    );
    return this.taskRepo.saveMany(tasks);
  }
}
