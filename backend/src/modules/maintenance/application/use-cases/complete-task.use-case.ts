import { Injectable, Inject } from '@nestjs/common';
import {
  MAINTENANCE_TASK_REPOSITORY,
  type MaintenanceTaskRepositoryPort,
} from '../../domain/ports/maintenance-task-repository.port';
import {
  MAINTENANCE_RECORD_REPOSITORY,
  type MaintenanceRecordRepositoryPort,
} from '../../domain/ports/maintenance-record-repository.port';
import {
  MOTORCYCLE_REPOSITORY,
  type MotorcycleRepositoryPort,
} from '../../../motorcycle/domain/ports/motorcycle-repository.port';
import { MaintenanceRecord } from '../../domain/entities/maintenance-record.entity';
import {
  NotFoundException,
  ForbiddenException,
} from '../../../../shared/domain/exceptions';

@Injectable()
export class CompleteTaskUseCase {
  constructor(
    @Inject(MAINTENANCE_TASK_REPOSITORY)
    private readonly taskRepo: MaintenanceTaskRepositoryPort,
    @Inject(MAINTENANCE_RECORD_REPOSITORY)
    private readonly recordRepo: MaintenanceRecordRepositoryPort,
    @Inject(MOTORCYCLE_REPOSITORY)
    private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(
    userId: string,
    motorcycleId: string,
    taskId: string,
    params: {
      performedAtHours: number;
      performedAtDate: Date;
      notes?: string;
      photos?: string[];
    },
  ): Promise<MaintenanceRecord> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.getUserId() !== userId)
      throw new ForbiddenException('Not your motorcycle');

    const task = await this.taskRepo.findById(taskId);
    if (!task || task.getMotorcycleId() !== motorcycleId)
      throw new NotFoundException('Task not found');

    const record = new MaintenanceRecord({
      taskId,
      motorcycleId,
      performedAtHours: params.performedAtHours,
      performedAtDate: params.performedAtDate,
      currentMotorcycleHours: moto.getCurrentHours(),
      notes: params.notes,
      photos: params.photos,
    });
    const savedRecord = await this.recordRepo.save(record);

    task.markServiced(moto.getCurrentHours());
    await this.taskRepo.save(task);

    return savedRecord;
  }
}
