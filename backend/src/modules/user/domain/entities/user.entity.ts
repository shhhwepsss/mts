import { randomUUID } from 'crypto';
import { BaseEntity } from '@/shared/domain/base.entity';
import { StringValidator } from '@/shared/domain/string-validator';
import { ValidationException } from '@/shared/domain/exceptions';
import {
  DEFAULT_USER_LANGUAGE,
  UserLanguageEnum,
  isUserLanguage,
} from '@/modules/user/domain/enums/user-language.enum';

interface UserProps {
  id: string | null;
  name: string;
  email: string;
  avatarUrl: string | null;
  language: UserLanguageEnum;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class User extends BaseEntity {
  private _name: string;
  private _email: string;
  private _avatarUrl: string | null;
  private _language: UserLanguageEnum;

  constructor(props: UserProps) {
    User.validateName(props.name);
    User.validateEmail(props.email);
    User.validateAvatarUrl(props.avatarUrl);
    const language = props.language ?? DEFAULT_USER_LANGUAGE;
    User.validateLanguage(language);
    super(props.id ?? randomUUID(), props.createdAt, props.updatedAt);
    this._name = props.name;
    this._email = props.email;
    this._avatarUrl = props.avatarUrl ?? null;
    this._language = language;
  }

  getName(): string {
    return this._name;
  }

  getEmail(): string {
    return this._email;
  }

  getAvatarUrl(): string | null {
    return this._avatarUrl;
  }

  getLanguage(): UserLanguageEnum {
    return this._language;
  }

  updateName(name: string): void {
    User.validateName(name);
    this._name = name;
    this.setUpdatedAt(new Date());
  }

  updateLanguage(language: UserLanguageEnum): void {
    User.validateLanguage(language);
    this._language = language;
    this.setUpdatedAt(new Date());
  }

  private static validateName(name: string): void {
    StringValidator.nonEmpty(name, 'Name');
    StringValidator.maxLength(name, 'Name', 100);
  }

  private static validateEmail(email: string): void {
    StringValidator.email(email, 'Email');
    StringValidator.maxLength(email, 'Email', 100);
  }

  private static validateAvatarUrl(avatarUrl: string | null): void {
    if (avatarUrl === null) return;
    StringValidator.nonEmpty(avatarUrl, 'Avatar URL');
    StringValidator.url(avatarUrl, 'Avatar URL');
  }

  private static validateLanguage(language: UserLanguageEnum): void {
    if (!isUserLanguage(language)) {
      throw new ValidationException('Language is not supported');
    }
  }
}
