import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleProviderOrmEntity } from './infrastructure/persistence/google-provider.orm-entity';
import { GoogleProviderRepository } from './infrastructure/persistence/google-provider.repository';
import { GOOGLE_PROVIDER_REPOSITORY } from './domain/ports/google-provider-repository.port';
import { JwtTokenService } from './application/services/jwt-token.service';
import { GoogleLoginUseCase } from './application/use-cases/google-login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GoogleProviderOrmEntity]),
    JwtModule.register({}),
    PassportModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    { provide: GOOGLE_PROVIDER_REPOSITORY, useClass: GoogleProviderRepository },
    JwtTokenService,
    GoogleLoginUseCase,
    RefreshTokenUseCase,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
