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
  MaxLength,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/infrastructure/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/modules/auth/infrastructure/decorators/authenticated-user.type';
import { CreateMotorcycleUseCase } from '@/modules/motorcycle/application/use-cases/create-motorcycle.use-case';
import { UpdateMotorcycleUseCase } from '@/modules/motorcycle/application/use-cases/update-motorcycle.use-case';
import { UpdateHoursUseCase } from '@/modules/motorcycle/application/use-cases/update-hours.use-case';
import { GetMotorcyclesUseCase } from '@/modules/motorcycle/application/use-cases/get-motorcycles.use-case';
import { GetMotorcycleDetailUseCase } from '@/modules/motorcycle/application/use-cases/get-motorcycle-detail.use-case';
import { DeleteMotorcycleUseCase } from '@/modules/motorcycle/application/use-cases/delete-motorcycle.use-case';
import { MotorcycleTypeEnum } from '@/modules/motorcycle/domain/enums/motorcycle-type.enum';

export class CreateMotorcycleDto {
  @IsString() @IsNotEmpty() @MaxLength(255) name: string;
  @IsString() @IsNotEmpty() @MaxLength(255) brand: string;
  @IsString() @IsNotEmpty() @MaxLength(255) model: string;
  @IsNumber() year: number;
  @IsEnum(MotorcycleTypeEnum) type: MotorcycleTypeEnum;
  @IsNumber() @Min(0) currentHours: number;
  @IsOptional() @IsString() imageUrl: string | null = null;
}

export class UpdateMotorcycleDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) name: string | null =
    null;
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) brand: string | null =
    null;
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) model: string | null =
    null;
  @IsOptional() @IsNumber() year: number | null = null;
  @IsOptional() @IsEnum(MotorcycleTypeEnum) type: MotorcycleTypeEnum | null =
    null;
  @IsOptional() @IsString() imageUrl: string | null = null;
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
  async list(@CurrentUser() user: AuthenticatedUser) {
    const motos = await this.getMotorcycles.execute(user.id);
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
  async detail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const m = await this.getMotorcycleDetail.execute(user.id, id);
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
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMotorcycleDto,
  ) {
    const m = await this.createMotorcycle.execute({
      userId: user.id,
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
      imageUrl: m.getImageUrl(),
    };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateMotorcycleDto,
  ) {
    const m = await this.updateMotorcycle.execute(user.id, id, dto);
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

  @Patch(':id/hours')
  async logHours(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateHoursDto,
  ) {
    const m = await this.updateHours.execute(user.id, id, dto.currentHours);
    return { id: m.getId(), currentHours: m.getCurrentHours() };
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.deleteMotorcycle.execute(user.id, id);
    return { deleted: true };
  }
}
