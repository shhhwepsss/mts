import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { GetUserProfileUseCase } from '@/modules/user/application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '@/modules/user/application/use-cases/update-user-profile.use-case';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/infrastructure/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/modules/auth/infrastructure/decorators/authenticated-user.type';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly getUserProfile: GetUserProfileUseCase,
    private readonly updateUserProfile: UpdateUserProfileUseCase,
  ) {}

  @Get('me')
  async getProfile(@CurrentUser() current: AuthenticatedUser) {
    const user = await this.getUserProfile.execute(current.id);
    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      avatarUrl: user.getAvatarUrl(),
    };
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() current: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.updateUserProfile.execute(current.id, dto.name);
    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      avatarUrl: user.getAvatarUrl(),
    };
  }
}
