import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
} from 'class-validator';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/infrastructure/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/modules/auth/infrastructure/decorators/authenticated-user.type';
import { GetRecordsUseCase } from '@/modules/maintenance/application/use-cases/get-records.use-case';
import { GetRecordDetailUseCase } from '@/modules/maintenance/application/use-cases/get-record-detail.use-case';
import { EditRecordUseCase } from '@/modules/maintenance/application/use-cases/edit-record.use-case';
import { DeleteRecordUseCase } from '@/modules/maintenance/application/use-cases/delete-record.use-case';

export class EditRecordDto {
  @IsOptional() @IsNumber() performedAtHours?: number;
  @IsOptional() @IsDateString() performedAtDate?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) photos?: string[];
}

@Controller('motorcycles/:motorcycleId/records')
@UseGuards(JwtAuthGuard)
export class MaintenanceRecordController {
  constructor(
    private readonly getRecords: GetRecordsUseCase,
    private readonly getRecordDetail: GetRecordDetailUseCase,
    private readonly editRecord: EditRecordUseCase,
    private readonly deleteRecord: DeleteRecordUseCase,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('motorcycleId') motorcycleId: string,
    @Query('taskId') taskId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const { records, total } = await this.getRecords.execute(
      user.id,
      motorcycleId,
      taskId,
      pageNum,
      limitNum,
    );
    return {
      records: records.map((r) => ({
        id: r.getId(),
        taskId: r.getTaskId(),
        performedAtHours: r.getPerformedAtHours(),
        performedAtDate: r.getPerformedAtDate(),
        notes: r.getNotes(),
        photos: r.getPhotos(),
      })),
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  @Get(':recordId')
  async detail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('motorcycleId') motorcycleId: string,
    @Param('recordId') recordId: string,
  ) {
    const r = await this.getRecordDetail.execute(
      user.id,
      motorcycleId,
      recordId,
    );
    return {
      id: r.getId(),
      taskId: r.getTaskId(),
      performedAtHours: r.getPerformedAtHours(),
      performedAtDate: r.getPerformedAtDate(),
      notes: r.getNotes(),
      photos: r.getPhotos(),
    };
  }

  @Patch(':recordId')
  async edit(
    @CurrentUser() user: AuthenticatedUser,
    @Param('motorcycleId') motorcycleId: string,
    @Param('recordId') recordId: string,
    @Body() dto: EditRecordDto,
  ) {
    const r = await this.editRecord.execute(user.id, motorcycleId, recordId, {
      performedAtHours: dto.performedAtHours,
      performedAtDate: dto.performedAtDate
        ? new Date(dto.performedAtDate)
        : undefined,
      notes: dto.notes,
      photos: dto.photos,
    });
    return {
      id: r.getId(),
      performedAtHours: r.getPerformedAtHours(),
      performedAtDate: r.getPerformedAtDate(),
      notes: r.getNotes(),
      photos: r.getPhotos(),
    };
  }

  @Delete(':recordId')
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('motorcycleId') motorcycleId: string,
    @Param('recordId') recordId: string,
  ) {
    await this.deleteRecord.execute(user.id, motorcycleId, recordId);
    return { deleted: true };
  }
}
