import { Injectable } from '@nestjs/common';
import { MaintenanceTask } from '../entities/maintenance-task.entity';
import { TaskStatus } from '../value-objects/task-status.vo';

export interface TaskWithStatus {
  task: MaintenanceTask;
  status: TaskStatus;
}

@Injectable()
export class MaintenanceCalculator {
  calculateStatuses(
    tasks: MaintenanceTask[],
    currentHours: number,
  ): TaskWithStatus[] {
    return tasks
      .filter((t) => t.getIsActive())
      .map((task) => ({
        task,
        status: TaskStatus.calculate(
          task.getIntervalHours(),
          currentHours,
          task.getLastServicedAtHours(),
        ),
      }));
  }
}
