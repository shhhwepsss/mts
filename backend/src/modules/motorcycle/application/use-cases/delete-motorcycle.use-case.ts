import { Injectable, Inject } from '@nestjs/common';
import {
  MOTORCYCLE_REPOSITORY,
  type MotorcycleRepositoryPort,
} from '../../domain/ports/motorcycle-repository.port';
import {
  NotFoundException,
  ForbiddenException,
} from '../../../../shared/domain/exceptions';

@Injectable()
export class DeleteMotorcycleUseCase {
  constructor(
    @Inject(MOTORCYCLE_REPOSITORY)
    private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(userId: string, motorcycleId: string): Promise<void> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.getUserId() !== userId)
      throw new ForbiddenException('Not your motorcycle');
    await this.motoRepo.delete(motorcycleId);
  }
}
