import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleProviderRepositoryPort } from '../../domain/ports/google-provider-repository.port';
import { GoogleProvider } from '../../domain/entities/google-provider.entity';
import { GoogleProviderOrmEntity } from './google-provider.orm-entity';
import { GoogleProviderMapper } from './google-provider.mapper';

@Injectable()
export class GoogleProviderRepository implements GoogleProviderRepositoryPort {
  constructor(
    @InjectRepository(GoogleProviderOrmEntity)
    private readonly repo: Repository<GoogleProviderOrmEntity>,
  ) {}

  async findByGoogleUserId(
    googleUserId: string,
  ): Promise<GoogleProvider | null> {
    const orm = await this.repo.findOne({ where: { googleUserId } });
    return orm ? GoogleProviderMapper.toDomain(orm) : null;
  }

  async findByUserId(userId: string): Promise<GoogleProvider | null> {
    const orm = await this.repo.findOne({ where: { userId } });
    return orm ? GoogleProviderMapper.toDomain(orm) : null;
  }

  async save(provider: GoogleProvider): Promise<GoogleProvider> {
    const orm = GoogleProviderMapper.toOrm(provider);
    const saved = await this.repo.save(orm);
    return GoogleProviderMapper.toDomain(saved);
  }
}
