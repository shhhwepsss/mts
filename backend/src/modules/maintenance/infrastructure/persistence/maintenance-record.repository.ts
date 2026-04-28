import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceRecordRepositoryPort } from '@/modules/maintenance/domain/ports/maintenance-record-repository.port';
import { MaintenanceRecord } from '@/modules/maintenance/domain/entities/maintenance-record.entity';
import { MaintenanceRecordOrmEntity } from '@/modules/maintenance/infrastructure/persistence/maintenance-record.orm-entity';
import { MaintenanceRecordMapper } from '@/modules/maintenance/infrastructure/persistence/maintenance-record.mapper';

@Injectable()
export class MaintenanceRecordRepository implements MaintenanceRecordRepositoryPort {
  constructor(
    @InjectRepository(MaintenanceRecordOrmEntity)
    private readonly repo: Repository<MaintenanceRecordOrmEntity>,
  ) {}

  async findById(id: string): Promise<MaintenanceRecord | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? MaintenanceRecordMapper.toDomain(orm) : null;
  }

  async findByMotorcycleId(
    motorcycleId: string,
    taskId?: string,
    page = 1,
    limit = 20,
  ): Promise<{ records: MaintenanceRecord[]; total: number }> {
    const where: { motorcycleId: string; taskId?: string } = { motorcycleId };
    if (taskId) where.taskId = taskId;
    const [orms, total] = await this.repo.findAndCount({
      where,
      order: { performedAtDate: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      records: orms.map((o) => MaintenanceRecordMapper.toDomain(o)),
      total,
    };
  }

  async findLatestByTaskId(taskId: string): Promise<MaintenanceRecord | null> {
    const orm = await this.repo.findOne({
      where: { taskId },
      order: { performedAtHours: 'DESC' },
    });
    return orm ? MaintenanceRecordMapper.toDomain(orm) : null;
  }

  async findPreviousByTaskId(
    taskId: string,
    excludeRecordId: string,
  ): Promise<MaintenanceRecord | null> {
    const orm = await this.repo
      .createQueryBuilder('r')
      .where('r.task_id = :taskId', { taskId })
      .andWhere('r.id != :excludeRecordId', { excludeRecordId })
      .orderBy('r.performed_at_hours', 'DESC')
      .getOne();
    return orm ? MaintenanceRecordMapper.toDomain(orm) : null;
  }

  async save(record: MaintenanceRecord): Promise<MaintenanceRecord> {
    const orm = MaintenanceRecordMapper.toOrm(record);
    const saved = await this.repo.save(orm);
    return MaintenanceRecordMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async deleteByMotorcycleId(motorcycleId: string): Promise<void> {
    await this.repo.delete({ motorcycleId });
  }
}
