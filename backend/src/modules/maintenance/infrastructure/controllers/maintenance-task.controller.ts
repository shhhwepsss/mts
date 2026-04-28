import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  Min,
  IsArray,
} from 'class-validator';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/infrastructure/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/modules/auth/infrastructure/decorators/authenticated-user.type';
import { GetTaskDashboardUseCase } from '@/modules/maintenance/application/use-cases/get-task-dashboard.use-case';
import { CompleteTaskUseCase } from '@/modules/maintenance/application/use-cases/complete-task.use-case';
import { CreateCustomTaskUseCase } from '@/modules/maintenance/application/use-cases/create-custom-task.use-case';
import { UpdateTaskUseCase } from '@/modules/maintenance/application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '@/modules/maintenance/application/use-cases/delete-task.use-case';

export class CreateTaskDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() description?: string;
  @IsNumber() @Min(0.1) intervalHours: number;
}

export class UpdateTaskDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() @Min(0.1) intervalHours?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class CompleteTaskDto {
  @IsNumber() @Min(0) performedAtHours: number;
  @IsDateString() performedAtDate: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) photos?: string[];
}

@Controller('motorcycles/:motorcycleId/tasks')
@UseGuards(JwtAuthGuard)
export class MaintenanceTaskController {
  constructor(
    private readonly getTaskDashboard: GetTaskDashboardUseCase,
    private readonly completeTask: CompleteTaskUseCase,
    private readonly createCustomTask: CreateCustomTaskUseCase,
    private readonly updateTask: UpdateTaskUseCase,
    private readonly deleteTask: DeleteTaskUseCase,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('motorcycleId') motorcycleId: string,
  ) {
    const results = await this.getTaskDashboard.execute(user.id, motorcycleId);
    return results.map((r) => ({
      id: r.task.getId(),
      name: r.task.getName(),
      description: r.task.getDescription(),
      intervalHours: r.task.getIntervalHours(),
      lastServicedAtHours: r.task.getLastServicedAtHours(),
      isDefault: r.task.getIsDefault(),
      isActive: r.task.getIsActive(),
      status: r.status.status,
      hoursRemaining: r.status.hoursRemaining,
    }));
  }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('motorcycleId') motorcycleId: string,
    @Body() dto: CreateTaskDto,
  ) {
    const task = await this.createCustomTask.execute(
      user.id,
      motorcycleId,
      dto,
    );
    return {
      id: task.getId(),
      name: task.getName(),
      intervalHours: task.getIntervalHours(),
      isDefault: task.getIsDefault(),
    };
  }

  @Patch(':taskId')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('motorcycleId') motorcycleId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const task = await this.updateTask.execute(
      user.id,
      motorcycleId,
      taskId,
      dto,
    );
    return {
      id: task.getId(),
      name: task.getName(),
      intervalHours: task.getIntervalHours(),
      isActive: task.getIsActive(),
    };
  }

  @Post(':taskId/complete')
  async complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('motorcycleId') motorcycleId: string,
    @Param('taskId') taskId: string,
    @Body() dto: CompleteTaskDto,
  ) {
    const record = await this.completeTask.execute(
      user.id,
      motorcycleId,
      taskId,
      {
        performedAtHours: dto.performedAtHours,
        performedAtDate: new Date(dto.performedAtDate),
        notes: dto.notes,
        photos: dto.photos,
      },
    );
    return {
      id: record.getId(),
      performedAtHours: record.getPerformedAtHours(),
      performedAtDate: record.getPerformedAtDate(),
    };
  }

  @Delete(':taskId')
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('motorcycleId') motorcycleId: string,
    @Param('taskId') taskId: string,
  ) {
    await this.deleteTask.execute(user.id, motorcycleId, taskId);
    return { deleted: true };
  }
}
