import { Injectable } from '@nestjs/common';
import { JwtTokenService, TokenPair } from '../services/jwt-token.service';
import { ValidationException } from '../../../../shared/domain/exceptions';

@Injectable()
export class RefreshTokenUseCase {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  async execute(refreshToken: string): Promise<TokenPair> {
    try {
      const payload =
        await this.jwtTokenService.verifyRefreshToken(refreshToken);
      return this.jwtTokenService.generateTokenPair(payload.sub);
    } catch {
      throw new ValidationException('Invalid or expired refresh token');
    }
  }
}
