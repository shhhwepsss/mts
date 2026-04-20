import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.use-case';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';

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
  async getProfile(@Req() req: any) {
    const user = await this.getUserProfile.execute(req.user.id);
    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      avatarUrl: user.getAvatarUrl(),
    };
  }

  @Patch('me')
  async updateProfile(@Req() req: any, @Body() dto: UpdateUserDto) {
    const user = await this.updateUserProfile.execute(req.user.id, dto.name);
    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      avatarUrl: user.getAvatarUrl(),
    };
  }
}
