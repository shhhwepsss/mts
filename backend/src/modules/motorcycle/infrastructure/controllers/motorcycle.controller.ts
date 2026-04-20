import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CreateMotorcycleUseCase } from '../../application/use-cases/create-motorcycle.use-case';
import { UpdateMotorcycleUseCase } from '../../application/use-cases/update-motorcycle.use-case';
import { UpdateHoursUseCase } from '../../application/use-cases/update-hours.use-case';
import { GetMotorcyclesUseCase } from '../../application/use-cases/get-motorcycles.use-case';
import { GetMotorcycleDetailUseCase } from '../../application/use-cases/get-motorcycle-detail.use-case';
import { DeleteMotorcycleUseCase } from '../../application/use-cases/delete-motorcycle.use-case';
import { MotorcycleTypeEnum } from '../../domain/enums/motorcycle-type.enum';

export class CreateMotorcycleDto {
  @IsString() @IsNotEmpty() @MaxLength(255) name: string;
  @IsString() @IsNotEmpty() @MaxLength(255) brand: string;
  @IsString() @IsNotEmpty() @MaxLength(255) model: string;
  @IsNumber() year: number;
  @IsEnum(MotorcycleTypeEnum) type: MotorcycleTypeEnum;
  @IsNumber() @Min(0) currentHours: number;
  @IsOptional() @IsString() imageUrl?: string;
}

export class UpdateMotorcycleDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) name?: string;
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) brand?: string;
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) model?: string;
  @IsOptional() @IsNumber() year?: number;
  @IsOptional() @IsEnum(MotorcycleTypeEnum) type?: MotorcycleTypeEnum;
  @IsOptional() @IsString() imageUrl?: string;
}

export class UpdateHoursDto {
  @IsNumber() @Min(0) currentHours: number;
}

@Controller('motorcycles')
@UseGuards(JwtAuthGuard)
export class MotorcycleController {
  constructor(
    private readonly createMotorcycle: CreateMotorcycleUseCase,
    private readonly updateMotorcycle: UpdateMotorcycleUseCase,
    private readonly updateHours: UpdateHoursUseCase,
    private readonly getMotorcycles: GetMotorcyclesUseCase,
    private readonly getMotorcycleDetail: GetMotorcycleDetailUseCase,
    private readonly deleteMotorcycle: DeleteMotorcycleUseCase,
  ) {}

  @Get()
  async list(@Req() req: any) {
    const motos = await this.getMotorcycles.execute(req.user.id);
    return motos.map((m) => ({
      id: m.getId(),
      name: m.getName(),
      brand: m.getBrand(),
      model: m.getModel(),
      year: m.getYear(),
      type: m.getType(),
      currentHours: m.getCurrentHours(),
      imageUrl: m.getImageUrl(),
    }));
  }

  @Get(':id')
  async detail(@Req() req: any, @Param('id') id: string) {
    const m = await this.getMotorcycleDetail.execute(req.user.id, id);
    return {
      id: m.getId(),
      name: m.getName(),
      brand: m.getBrand(),
      model: m.getModel(),
      year: m.getYear(),
      type: m.getType(),
      currentHours: m.getCurrentHours(),
      imageUrl: m.getImageUrl(),
    };
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateMotorcycleDto) {
    const m = await this.createMotorcycle.execute({
      userId: req.user.id,
      ...dto,
    });
    return {
      id: m.getId(),
      name: m.getName(),
      brand: m.getBrand(),
      model: m.getModel(),
      year: m.getYear(),
      type: m.getType(),
      currentHours: m.getCurrentHours(),
    };
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateMotorcycleDto,
  ) {
    const m = await this.updateMotorcycle.execute(req.user.id, id, dto);
    return {
      id: m.getId(),
      name: m.getName(),
      brand: m.getBrand(),
      model: m.getModel(),
      year: m.getYear(),
      type: m.getType(),
      currentHours: m.getCurrentHours(),
    };
  }

  @Patch(':id/hours')
  async logHours(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateHoursDto,
  ) {
    const m = await this.updateHours.execute(req.user.id, id, dto.currentHours);
    return { id: m.getId(), currentHours: m.getCurrentHours() };
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    await this.deleteMotorcycle.execute(req.user.id, id);
    return { deleted: true };
  }
}
