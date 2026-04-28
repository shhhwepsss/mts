import { Injectable, Inject } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '@/modules/user/domain/ports/user-repository.port';
import { NotFoundException } from '@/shared/domain/exceptions';
import { User } from '@/modules/user/domain/entities/user.entity';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(userId: string, name: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.updateName(name);
    return this.userRepo.save(user);
  }
}
