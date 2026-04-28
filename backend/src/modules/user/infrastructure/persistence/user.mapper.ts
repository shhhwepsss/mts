import { User } from '@/modules/user/domain/entities/user.entity';
import { UserOrmEntity } from '@/modules/user/infrastructure/persistence/user.orm-entity';

export class UserMapper {
  static toDomain(orm: UserOrmEntity): User {
    return new User({
      id: orm.id,
      name: orm.name,
      email: orm.email,
      avatarUrl: orm.avatarUrl ?? undefined,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(domain: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = domain.getId();
    orm.name = domain.getName();
    orm.email = domain.getEmail();
    orm.avatarUrl = domain.getAvatarUrl();
    return orm;
  }
}
