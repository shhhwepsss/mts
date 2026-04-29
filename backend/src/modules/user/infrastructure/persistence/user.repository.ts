import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepositoryPort } from '@/modules/user/domain/ports/user-repository.port';
import { User } from '@/modules/user/domain/entities/user.entity';
import { UserOrmEntity } from '@/modules/user/infrastructure/persistence/user.orm-entity';
import { UserMapper } from '@/modules/user/infrastructure/persistence/user.mapper';

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { email } });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async save(user: User): Promise<User> {
    const orm = UserMapper.toOrm(user);
    const saved = await this.repo.save(orm);
    return UserMapper.toDomain(saved);
  }
}
