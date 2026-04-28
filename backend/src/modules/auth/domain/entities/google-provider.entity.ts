import { randomUUID } from 'crypto';
import { BaseEntity } from '@/shared/domain/base.entity';
import { ValidationException } from '@/shared/domain/exceptions';

interface GoogleProviderProps {
  id?: string;
  userId: string;
  googleUserId: string;
  googleEmail: string;
  googleAvatarUrl?: string;
  createdAt?: Date;
}

export class GoogleProvider extends BaseEntity {
  private readonly _userId: string;
  private readonly _googleUserId: string;
  private readonly _googleEmail: string;
  private readonly _googleAvatarUrl: string | null;

  constructor(props: GoogleProviderProps) {
    super(props.id ?? randomUUID(), props.createdAt);
    if (!props.googleUserId || props.googleUserId.trim().length === 0) {
      throw new ValidationException('Google user ID must not be empty');
    }
    if (!props.googleEmail || props.googleEmail.trim().length === 0) {
      throw new ValidationException('Google email must not be empty');
    }
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
