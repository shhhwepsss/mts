import { Injectable, Inject } from '@nestjs/common';
import {
  MAINTENANCE_RECORD_REPOSITORY,
  type MaintenanceRecordRepositoryPort,
} from '../../domain/ports/maintenance-record-repository.port';
import {
  MAINTENANCE_TASK_REPOSITORY,
  type MaintenanceTaskRepositoryPort,
} from '../../domain/ports/maintenance-task-repository.port';
import {
  MOTORCYCLE_REPOSITORY,
  type MotorcycleRepositoryPort,
} from '../../../motorcycle/domain/ports/motorcycle-repository.port';
import {
  NotFoundException,
  ForbiddenException,
} from '../../../../shared/domain/exceptions';

@Injectable()
export class DeleteRecordUseCase {
  constructor(
    @Inject(MAINTENANCE_RECORD_REPOSITORY)
    private readonly recordRepo: MaintenanceRecordRepositoryPort,
    @Inject(MAINTENANCE_TASK_REPOSITORY)
    private readonly taskRepo: MaintenanceTaskRepositoryPort,
    @Inject(MOTORCYCLE_REPOSITORY)
    private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(
    userId: string,
    motorcycleId: string,
    recordId: string,
  ): Promise<void> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.getUserId() !== userId)
      throw new ForbiddenException('Not your motorcycle');

    const record = await this.recordRepo.findById(recordId);
    if (!record || record.getMotorcycleId() !== motorcycleId)
      throw new NotFoundException('Record not found');

    const latest = await this.recordRepo.findLatestByTaskId(record.getTaskId());
    const isLatest = latest && latest.getId() === recordId;

    await this.recordRepo.delete(recordId);

    if (isLatest) {
      const task = await this.taskRepo.findById(record.getTaskId());
      if (task) {
        const previous = await this.recordRepo.findPreviousByTaskId(
          record.getTaskId(),
          recordId,
        );
        task.rollbackLastServiced(
          previous ? previous.getPerformedAtHours() : 0,
        );
        await this.taskRepo.save(task);
      }
    }
  }
}
