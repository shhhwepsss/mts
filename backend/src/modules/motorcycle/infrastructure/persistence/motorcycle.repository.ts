import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MotorcycleRepositoryPort } from '@/modules/motorcycle/domain/ports/motorcycle-repository.port';
import { Motorcycle } from '@/modules/motorcycle/domain/entities/motorcycle.entity';
import { MotorcycleOrmEntity } from '@/modules/motorcycle/infrastructure/persistence/motorcycle.orm-entity';
import { MotorcycleMapper } from '@/modules/motorcycle/infrastructure/persistence/motorcycle.mapper';

@Injectable()
export class MotorcycleRepository implements MotorcycleRepositoryPort {
  constructor(
    @InjectRepository(MotorcycleOrmEntity)
    private readonly repo: Repository<MotorcycleOrmEntity>,
  ) {}

  async findById(id: string): Promise<Motorcycle | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? MotorcycleMapper.toDomain(orm) : null;
  }

  async findByUserId(userId: string): Promise<Motorcycle[]> {
    const orms = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return orms.map(MotorcycleMapper.toDomain);
  }

  async save(motorcycle: Motorcycle): Promise<Motorcycle> {
    const orm = MotorcycleMapper.toOrm(motorcycle);
    const saved = await this.repo.save(orm);
    return MotorcycleMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
