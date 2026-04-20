import { Injectable, Inject } from '@nestjs/common';
import {
  MOTORCYCLE_REPOSITORY,
  type MotorcycleRepositoryPort,
} from '../../domain/ports/motorcycle-repository.port';
import { Motorcycle } from '../../domain/entities/motorcycle.entity';

@Injectable()
export class GetMotorcyclesUseCase {
  constructor(
    @Inject(MOTORCYCLE_REPOSITORY)
    private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(userId: string): Promise<Motorcycle[]> {
    return this.motoRepo.findByUserId(userId);
  }
}
