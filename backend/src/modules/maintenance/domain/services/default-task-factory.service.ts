import { Injectable, Inject } from '@nestjs/common';
import {
  MAINTENANCE_TASK_REPOSITORY,
  type MaintenanceTaskRepositoryPort,
} from '../ports/maintenance-task-repository.port';
import { MaintenanceTask } from '../entities/maintenance-task.entity';
import { DEFAULT_TASKS } from '../constants/default-tasks.constants';
import { MotorcycleTypeEnum } from '../../../motorcycle/domain/enums/motorcycle-type.enum';

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
          motorcycleId,
          name: t.name,
          description: t.description,
          intervalHours: t.intervalHours,
          lastServicedAtHours: 0,
          isDefault: true,
          isActive: true,
        }),
    );
    return this.taskRepo.saveMany(tasks);
  }
}
