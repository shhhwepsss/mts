import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from '@/modules/user/infrastructure/persistence/user.orm-entity';
import { UserRepository } from '@/modules/user/infrastructure/persistence/user.repository';
import { USER_REPOSITORY } from '@/modules/user/domain/ports/user-repository.port';
import { GetUserProfileUseCase } from '@/modules/user/application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '@/modules/user/application/use-cases/update-user-profile.use-case';
import { UserController } from '@/modules/user/infrastructure/controllers/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UserController],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepository },
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
