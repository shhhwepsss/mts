import { Injectable, Inject } from '@nestjs/common';
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
export class EditRecordUseCase {
  constructor(
    @Inject(MAINTENANCE_RECORD_REPOSITORY)
    private readonly recordRepo: MaintenanceRecordRepositoryPort,
    @Inject(MOTORCYCLE_REPOSITORY)
    private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(
    userId: string,
    motorcycleId: string,
    recordId: string,
    params: {
      performedAtHours?: number;
      performedAtDate?: Date;
      notes?: string;
      photos?: string[];
    },
  ): Promise<MaintenanceRecord> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.getUserId() !== userId)
      throw new ForbiddenException('Not your motorcycle');

    const record = await this.recordRepo.findById(recordId);
    if (!record || record.getMotorcycleId() !== motorcycleId)
      throw new NotFoundException('Record not found');

    record.updateDetails({
      ...params,
      currentMotorcycleHours: moto.getCurrentHours(),
    });
    return this.recordRepo.save(record);
  }
}
