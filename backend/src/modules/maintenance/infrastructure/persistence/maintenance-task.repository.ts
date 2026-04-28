import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceTaskRepositoryPort } from '@/modules/maintenance/domain/ports/maintenance-task-repository.port';
import { MaintenanceTask } from '@/modules/maintenance/domain/entities/maintenance-task.entity';
import { MaintenanceTaskOrmEntity } from '@/modules/maintenance/infrastructure/persistence/maintenance-task.orm-entity';
import { MaintenanceTaskMapper } from '@/modules/maintenance/infrastructure/persistence/maintenance-task.mapper';

@Injectable()
export class MaintenanceTaskRepository implements MaintenanceTaskRepositoryPort {
  constructor(
    @InjectRepository(MaintenanceTaskOrmEntity)
    private readonly repo: Repository<MaintenanceTaskOrmEntity>,
  ) {}

  async findById(id: string): Promise<MaintenanceTask | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? MaintenanceTaskMapper.toDomain(orm) : null;
  }

  async findByMotorcycleId(motorcycleId: string): Promise<MaintenanceTask[]> {
    const orms = await this.repo.find({
      where: { motorcycleId },
      order: { createdAt: 'ASC' },
    });
    return orms.map(MaintenanceTaskMapper.toDomain);
  }

  async save(task: MaintenanceTask): Promise<MaintenanceTask> {
    const orm = MaintenanceTaskMapper.toOrm(task);
    const saved = await this.repo.save(orm);
    return MaintenanceTaskMapper.toDomain(saved);
  }

  async saveMany(tasks: MaintenanceTask[]): Promise<MaintenanceTask[]> {
    const orms = tasks.map(MaintenanceTaskMapper.toOrm);
    const saved = await this.repo.save(orms);
    return saved.map(MaintenanceTaskMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async deleteByMotorcycleId(motorcycleId: string): Promise<void> {
    await this.repo.delete({ motorcycleId });
  }
}
