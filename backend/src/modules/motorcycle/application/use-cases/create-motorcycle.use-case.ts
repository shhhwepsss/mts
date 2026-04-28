import { Injectable, Inject } from '@nestjs/common';
import {
  MOTORCYCLE_REPOSITORY,
  type MotorcycleRepositoryPort,
} from '@/modules/motorcycle/domain/ports/motorcycle-repository.port';
import { Motorcycle } from '@/modules/motorcycle/domain/entities/motorcycle.entity';
import { MotorcycleTypeEnum } from '@/modules/motorcycle/domain/enums/motorcycle-type.enum';
import { DefaultTaskFactory } from '@/modules/maintenance/domain/services/default-task-factory.service';

@Injectable()
export class CreateMotorcycleUseCase {
  constructor(
    @Inject(MOTORCYCLE_REPOSITORY)
    private readonly motoRepo: MotorcycleRepositoryPort,
    private readonly defaultTaskFactory: DefaultTaskFactory,
  ) {}

  async execute(params: {
    userId: string;
    name: string;
    brand: string;
    model: string;
    year: number;
    type: MotorcycleTypeEnum;
    currentHours: number;
    imageUrl: string | null;
  }): Promise<Motorcycle> {
    const motorcycle = new Motorcycle({
      id: null,
      userId: params.userId,
      name: params.name,
      brand: params.brand,
      model: params.model,
      year: params.year,
      type: params.type,
      currentHours: params.currentHours,
      imageUrl: params.imageUrl,
      createdAt: null,
      updatedAt: null,
    });
    const saved = await this.motoRepo.save(motorcycle);
    await this.defaultTaskFactory.createDefaultTasks(
      saved.getId(),
      saved.getType(),
    );
    return saved;
  }
}
