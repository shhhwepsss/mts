import { Injectable, Inject } from '@nestjs/common';
import {
  MOTORCYCLE_REPOSITORY,
  type MotorcycleRepositoryPort,
} from '../../domain/ports/motorcycle-repository.port';
import { Motorcycle } from '../../domain/entities/motorcycle.entity';
import { MotorcycleTypeEnum } from '../../domain/enums/motorcycle-type.enum';
import { DefaultTaskFactory } from '../../../maintenance/domain/services/default-task-factory.service';

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
    imageUrl?: string;
  }): Promise<Motorcycle> {
    const motorcycle = new Motorcycle(params);
    const saved = await this.motoRepo.save(motorcycle);
    await this.defaultTaskFactory.createDefaultTasks(
      saved.getId(),
      saved.getType(),
    );
    return saved;
  }
}
