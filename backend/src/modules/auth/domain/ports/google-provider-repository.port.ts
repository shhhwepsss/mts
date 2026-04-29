import { GoogleProvider } from '@/modules/auth/domain/entities/google-provider.entity';

export const GOOGLE_PROVIDER_REPOSITORY = Symbol('GOOGLE_PROVIDER_REPOSITORY');

export interface GoogleProviderRepositoryPort {
  findByGoogleUserId(googleUserId: string): Promise<GoogleProvider | null>;
  findByUserId(userId: string): Promise<GoogleProvider | null>;
  save(provider: GoogleProvider): Promise<GoogleProvider>;
}
