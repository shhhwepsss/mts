import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceTaskOrmEntity } from '@/modules/maintenance/infrastructure/persistence/maintenance-task.orm-entity';
import { MaintenanceRecordOrmEntity } from '@/modules/maintenance/infrastructure/persistence/maintenance-record.orm-entity';
import { MaintenanceTaskRepository } from '@/modules/maintenance/infrastructure/persistence/maintenance-task.repository';
import { MaintenanceRecordRepository } from '@/modules/maintenance/infrastructure/persistence/maintenance-record.repository';
import { MAINTENANCE_TASK_REPOSITORY } from '@/modules/maintenance/domain/ports/maintenance-task-repository.port';
import { MAINTENANCE_RECORD_REPOSITORY } from '@/modules/maintenance/domain/ports/maintenance-record-repository.port';
import { MaintenanceCalculator } from '@/modules/maintenance/domain/services/maintenance-calculator.service';
import { DefaultTaskFactory } from '@/modules/maintenance/domain/services/default-task-factory.service';
import { GetTaskDashboardUseCase } from '@/modules/maintenance/application/use-cases/get-task-dashboard.use-case';
import { CompleteTaskUseCase } from '@/modules/maintenance/application/use-cases/complete-task.use-case';
import { CreateCustomTaskUseCase } from '@/modules/maintenance/application/use-cases/create-custom-task.use-case';
import { UpdateTaskUseCase } from '@/modules/maintenance/application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '@/modules/maintenance/application/use-cases/delete-task.use-case';
import { GetRecordsUseCase } from '@/modules/maintenance/application/use-cases/get-records.use-case';
import { GetRecordDetailUseCase } from '@/modules/maintenance/application/use-cases/get-record-detail.use-case';
import { EditRecordUseCase } from '@/modules/maintenance/application/use-cases/edit-record.use-case';
import { DeleteRecordUseCase } from '@/modules/maintenance/application/use-cases/delete-record.use-case';
import { MaintenanceTaskController } from '@/modules/maintenance/infrastructure/controllers/maintenance-task.controller';
import { MaintenanceRecordController } from '@/modules/maintenance/infrastructure/controllers/maintenance-record.controller';
import { MotorcycleModule } from '@/modules/motorcycle/motorcycle.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaintenanceTaskOrmEntity,
      MaintenanceRecordOrmEntity,
    ]),
    forwardRef(() => MotorcycleModule),
  ],
  controllers: [MaintenanceTaskController, MaintenanceRecordController],
  providers: [
    {
      provide: MAINTENANCE_TASK_REPOSITORY,
      useClass: MaintenanceTaskRepository,
    },
    {
      provide: MAINTENANCE_RECORD_REPOSITORY,
      useClass: MaintenanceRecordRepository,
    },
    MaintenanceCalculator,
    DefaultTaskFactory,
    GetTaskDashboardUseCase,
    CompleteTaskUseCase,
    CreateCustomTaskUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    GetRecordsUseCase,
    GetRecordDetailUseCase,
    EditRecordUseCase,
    DeleteRecordUseCase,
  ],
  exports: [
    MAINTENANCE_TASK_REPOSITORY,
    MAINTENANCE_RECORD_REPOSITORY,
    DefaultTaskFactory,
  ],
})
export class MaintenanceModule {}
