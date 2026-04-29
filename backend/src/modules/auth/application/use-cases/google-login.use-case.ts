import { Injectable, Inject } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import {
  GOOGLE_PROVIDER_REPOSITORY,
  type GoogleProviderRepositoryPort,
} from '@/modules/auth/domain/ports/google-provider-repository.port';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '@/modules/user/domain/ports/user-repository.port';
import { GoogleProvider } from '@/modules/auth/domain/entities/google-provider.entity';
import { User } from '@/modules/user/domain/entities/user.entity';
import {
  JwtTokenService,
  TokenPair,
} from '@/modules/auth/application/services/jwt-token.service';
import { ValidationException } from '@/shared/domain/exceptions';
import { UserLanguageEnum } from '@/modules/user/domain/enums/user-language.enum';

@Injectable()
export class GoogleLoginUseCase {
  private readonly oauthClient: OAuth2Client;
  private readonly clientId: string;

  constructor(
    @Inject(GOOGLE_PROVIDER_REPOSITORY)
    private readonly providerRepo: GoogleProviderRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
    private readonly jwtTokenService: JwtTokenService,
    configService: ConfigService,
  ) {
    this.clientId = configService.get<string>('google.clientId')!;
    this.oauthClient = new OAuth2Client(this.clientId);
  }

  async execute(googleToken: string): Promise<TokenPair> {
    const ticket = await this.oauthClient.verifyIdToken({
      idToken: googleToken,
      audience: this.clientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      throw new ValidationException('Invalid Google token');
    }

    const existing = await this.providerRepo.findByGoogleUserId(payload.sub);
    if (existing) {
      return this.jwtTokenService.generateTokenPair(existing.getUserId());
    }

    const user = new User({
      id: null,
      name: payload.name ?? payload.email.split('@')[0],
      email: payload.email,
      avatarUrl: payload.picture ?? null,
      createdAt: null,
      updatedAt: null,
      language: UserLanguageEnum.EN,
    });
    const savedUser = await this.userRepo.save(user);

    const provider = new GoogleProvider({
      id: null,
      userId: savedUser.getId(),
      googleUserId: payload.sub,
      googleEmail: payload.email,
      googleAvatarUrl: payload.picture ?? null,
      createdAt: null,
    });
    await this.providerRepo.save(provider);

    return this.jwtTokenService.generateTokenPair(savedUser.getId());
  }
}
