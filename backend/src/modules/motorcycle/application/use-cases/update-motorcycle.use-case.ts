import { Injectable, Inject } from '@nestjs/common';
import {
  MOTORCYCLE_REPOSITORY,
  type MotorcycleRepositoryPort,
} from '../../domain/ports/motorcycle-repository.port';
import {
  NotFoundException,
  ForbiddenException,
} from '../../../../shared/domain/exceptions';
import { Motorcycle } from '../../domain/entities/motorcycle.entity';
import { MotorcycleTypeEnum } from '../../domain/enums/motorcycle-type.enum';

@Injectable()
export class UpdateMotorcycleUseCase {
  constructor(
    @Inject(MOTORCYCLE_REPOSITORY)
    private readonly motoRepo: MotorcycleRepositoryPort,
  ) {}

  async execute(
    userId: string,
    motorcycleId: string,
    params: {
      name?: string;
      brand?: string;
      model?: string;
      year?: number;
      type?: MotorcycleTypeEnum;
      imageUrl?: string;
    },
  ): Promise<Motorcycle> {
    const moto = await this.motoRepo.findById(motorcycleId);
    if (!moto) throw new NotFoundException('Motorcycle not found');
    if (moto.getUserId() !== userId)
      throw new ForbiddenException('Not your motorcycle');
    moto.updateDetails(params);
    return this.motoRepo.save(moto);
  }
}
