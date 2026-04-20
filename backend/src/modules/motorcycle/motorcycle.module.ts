import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MotorcycleOrmEntity } from './infrastructure/persistence/motorcycle.orm-entity';
import { MotorcycleRepository } from './infrastructure/persistence/motorcycle.repository';
import { MOTORCYCLE_REPOSITORY } from './domain/ports/motorcycle-repository.port';
import { CreateMotorcycleUseCase } from './application/use-cases/create-motorcycle.use-case';
import { UpdateMotorcycleUseCase } from './application/use-cases/update-motorcycle.use-case';
import { UpdateHoursUseCase } from './application/use-cases/update-hours.use-case';
import { GetMotorcyclesUseCase } from './application/use-cases/get-motorcycles.use-case';
import { GetMotorcycleDetailUseCase } from './application/use-cases/get-motorcycle-detail.use-case';
import { DeleteMotorcycleUseCase } from './application/use-cases/delete-motorcycle.use-case';
import { MotorcycleController } from './infrastructure/controllers/motorcycle.controller';
import { MaintenanceModule } from '../maintenance/maintenance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MotorcycleOrmEntity]),
    forwardRef(() => MaintenanceModule),
  ],
  controllers: [MotorcycleController],
  providers: [
    { provide: MOTORCYCLE_REPOSITORY, useClass: MotorcycleRepository },
    CreateMotorcycleUseCase,
    UpdateMotorcycleUseCase,
    UpdateHoursUseCase,
    GetMotorcyclesUseCase,
    GetMotorcycleDetailUseCase,
    DeleteMotorcycleUseCase,
  ],
  exports: [MOTORCYCLE_REPOSITORY],
})
export class MotorcycleModule {}
