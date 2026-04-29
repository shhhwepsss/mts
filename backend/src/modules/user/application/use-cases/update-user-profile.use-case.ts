import { Injectable, Inject } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '@/modules/user/domain/ports/user-repository.port';
import { NotFoundException } from '@/shared/domain/exceptions';
import { User } from '@/modules/user/domain/entities/user.entity';
import { UserLanguageEnum } from '@/modules/user/domain/enums/user-language.enum';

export interface UpdateUserProfileInput {
  name?: string;
  language?: UserLanguageEnum;
}

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(userId: string, input: UpdateUserProfileInput): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (input.name !== undefined) {
      user.updateName(input.name);
    }
    if (input.language !== undefined) {
      user.updateLanguage(input.language);
    }
    return this.userRepo.save(user);
  }
}
