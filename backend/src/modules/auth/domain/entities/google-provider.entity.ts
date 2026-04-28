import { randomUUID } from 'crypto';
import { BaseEntity } from '@/shared/domain/base.entity';
import { StringValidator } from '@/shared/domain/string-validator';

interface GoogleProviderProps {
  id: string | null;
  userId: string;
  googleUserId: string;
  googleEmail: string;
  googleAvatarUrl: string | null;
  createdAt: Date | null;
}

export class GoogleProvider extends BaseEntity {
  private readonly _userId: string;
  private readonly _googleUserId: string;
  private readonly _googleEmail: string;
  private readonly _googleAvatarUrl: string | null;

  constructor(props: GoogleProviderProps) {
    StringValidator.nonEmpty(props.userId, 'User ID');
    StringValidator.nonEmpty(props.googleUserId, 'Google user ID');
    StringValidator.email(props.googleEmail, 'Google email');
    StringValidator.nullableNonEmpty(
      props.googleAvatarUrl,
      'Google avatar URL',
    );
    super(props.id ?? randomUUID(), props.createdAt, null);
    this._userId = props.userId;
    this._googleUserId = props.googleUserId;
    this._googleEmail = props.googleEmail;
    this._googleAvatarUrl = props.googleAvatarUrl ?? null;
  }

  getUserId(): string {
    return this._userId;
  }

  getGoogleUserId(): string {
    return this._googleUserId;
  }

  getGoogleEmail(): string {
    return this._googleEmail;
  }

  getGoogleAvatarUrl(): string | null {
    return this._googleAvatarUrl;
  }
}
