import { Injectable, Inject } from '@nestjs/common';
import {
  MAINTENANCE_TASK_REPOSITORY,
  type MaintenanceTaskRepositoryPort,
} from '@/modules/maintenance/domain/ports/maintenance-task-repository.port';
import {
  MOTORCYCLE_REPOSITORY,
  type MotorcycleRepositoryPort,
} from '@/modules/motorcycle/domain/ports/motorcycle-repository.port';
import {
  MaintenanceCalculator,
  TaskWithStatus,
} from '@/modules/maintenance/domain/services/maintenance-calculator.service';
import {
  NotFoundException,
  ForbiddenException,
} from '@/shared/domain/exceptions';

@Injectable()
export class GetTaskDashboardUseCase {
  constructor(
    @Inject(MAINTENANCE_TASK_REPOSITORY)
    private readonly taskRepo: MaintenanceTaskRepositoryPort,
    @Inject(MOTORCYCLE_REPOSITORY)
    private readonly motoRepo: MotorcycleRepositoryPort,
    private readonly calculator: MaintenanceCalculator,
  ) {}

  async execute(
    userId: string,
    motorcycleId: string,
  ): Promise<TaskWithStatus[]> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.getUserId() !== userId)
      throw new ForbiddenException('Not your motorcycle');
    const tasks = await this.taskRepo.findByMotorcycleId(motorcycleId);
    return this.calculator.calculateStatuses(tasks, moto.getCurrentHours());
  }
}
