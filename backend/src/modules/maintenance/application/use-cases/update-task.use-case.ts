import { Injectable, Inject } from '@nestjs/common';
import {
  MAINTENANCE_TASK_REPOSITORY,
  type MaintenanceTaskRepositoryPort,
} from '../../domain/ports/maintenance-task-repository.port';
import {
  MOTORCYCLE_REPOSITORY,
  type MotorcycleRepositoryPort,
} from '../../../motorcycle/domain/ports/motorcycle-repository.port';
import { MaintenanceTask } from '../../domain/entities/maintenance-task.entity';
import {
  NotFoundException,
  ForbiddenException,
} from '../../../../shared/domain/exceptions';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject(MAINTENANCE_TASK_REPOSITORY)
    private readonly taskRepo: MaintenanceTaskRepositoryPort,
    @Inject(MOTORCYCLE_REPOSITORY)
    private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(
    userId: string,
    motorcycleId: string,
    taskId: string,
    params: {
      name?: string;
      description?: string;
      intervalHours?: number;
      isActive?: boolean;
    },
  ): Promise<MaintenanceTask> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.getUserId() !== userId)
      throw new ForbiddenException('Not your motorcycle');

    const task = await this.taskRepo.findById(taskId);
    if (!task || task.getMotorcycleId() !== motorcycleId)
      throw new NotFoundException('Task not found');

    task.updateDetails(params);
    return this.taskRepo.save(task);
  }
}
