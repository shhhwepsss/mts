import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleProviderOrmEntity } from '@/modules/auth/infrastructure/persistence/google-provider.orm-entity';
import { GoogleProviderRepository } from '@/modules/auth/infrastructure/persistence/google-provider.repository';
import { GOOGLE_PROVIDER_REPOSITORY } from '@/modules/auth/domain/ports/google-provider-repository.port';
import { JwtTokenService } from '@/modules/auth/application/services/jwt-token.service';
import { GoogleLoginUseCase } from '@/modules/auth/application/use-cases/google-login.use-case';
import { RefreshTokenUseCase } from '@/modules/auth/application/use-cases/refresh-token.use-case';
import { AuthController } from '@/modules/auth/infrastructure/controllers/auth.controller';
import { JwtStrategy } from '@/modules/auth/infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guards/jwt-auth.guard';
import { UserModule } from '@/modules/user/user.module';

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
