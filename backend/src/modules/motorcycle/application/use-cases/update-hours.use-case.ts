import { Injectable, Inject } from '@nestjs/common';
import {
  MOTORCYCLE_REPOSITORY,
  type MotorcycleRepositoryPort,
} from '@/modules/motorcycle/domain/ports/motorcycle-repository.port';
import {
  NotFoundException,
  ForbiddenException,
} from '@/shared/domain/exceptions';
import { Motorcycle } from '@/modules/motorcycle/domain/entities/motorcycle.entity';

@Injectable()
export class UpdateHoursUseCase {
  constructor(
    @Inject(MOTORCYCLE_REPOSITORY)
    private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(
    userId: string,
    motorcycleId: string,
    hours: number,
  ): Promise<Motorcycle> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.getUserId() !== userId)
      throw new ForbiddenException('Not your motorcycle');
    moto.updateHours(hours);
    return this.motoRepo.save(moto);
  }
}
