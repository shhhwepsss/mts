import { GoogleProvider } from '@/modules/auth/domain/entities/google-provider.entity';
import { GoogleProviderOrmEntity } from '@/modules/auth/infrastructure/persistence/google-provider.orm-entity';

export class GoogleProviderMapper {
  static toDomain(orm: GoogleProviderOrmEntity): GoogleProvider {
    return new GoogleProvider({
      id: orm.id,
      userId: orm.userId,
      googleUserId: orm.googleUserId,
      googleEmail: orm.googleEmail,
      googleAvatarUrl: orm.googleAvatarUrl ?? undefined,
      createdAt: orm.createdAt,
    });
  }

  static toOrm(domain: GoogleProvider): GoogleProviderOrmEntity {
    const orm = new GoogleProviderOrmEntity();
    orm.id = domain.getId();
    orm.userId = domain.getUserId();
    orm.googleUserId = domain.getGoogleUserId();
    orm.googleEmail = domain.getGoogleEmail();
    orm.googleAvatarUrl = domain.getGoogleAvatarUrl();
    return orm;
  }
}
