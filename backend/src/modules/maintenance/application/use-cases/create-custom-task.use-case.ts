import { Injectable, Inject } from '@nestjs/common';
import {
  MAINTENANCE_TASK_REPOSITORY,
  type MaintenanceTaskRepositoryPort,
} from '@/modules/maintenance/domain/ports/maintenance-task-repository.port';
import {
  MOTORCYCLE_REPOSITORY,
  type MotorcycleRepositoryPort,
} from '@/modules/motorcycle/domain/ports/motorcycle-repository.port';
import { MaintenanceTask } from '@/modules/maintenance/domain/entities/maintenance-task.entity';
import {
  NotFoundException,
  ForbiddenException,
} from '@/shared/domain/exceptions';

@Injectable()
export class CreateCustomTaskUseCase {
  constructor(
    @Inject(MAINTENANCE_TASK_REPOSITORY)
    private readonly taskRepo: MaintenanceTaskRepositoryPort,
    @Inject(MOTORCYCLE_REPOSITORY)
    private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(
    userId: string,
    motorcycleId: string,
    params: {
      name: string;
      description?: string;
      intervalHours: number;
    },
  ): Promise<MaintenanceTask> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.getUserId() !== userId)
      throw new ForbiddenException('Not your motorcycle');

    const task = new MaintenanceTask({
      motorcycleId,
      name: params.name,
      description: params.description,
      intervalHours: params.intervalHours,
      isDefault: false,
      isActive: true,
      lastServicedAtHours: 0,
    });
    return this.taskRepo.save(task);
  }
}
