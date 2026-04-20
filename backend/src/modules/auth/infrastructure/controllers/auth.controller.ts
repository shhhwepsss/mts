import { Controller, Post, Body } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { GoogleLoginUseCase } from '../../application/use-cases/google-login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly googleLogin: GoogleLoginUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
  ) {}

  @Post('google')
  async loginWithGoogle(@Body() dto: GoogleLoginDto) {
    return this.googleLogin.execute(dto.token);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshToken.execute(dto.refreshToken);
  }
}
