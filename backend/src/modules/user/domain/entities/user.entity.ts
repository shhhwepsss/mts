import { randomUUID } from 'crypto';
import { BaseEntity } from '@/shared/domain/base.entity';
import { ValidationException } from '@/shared/domain/exceptions';

interface UserProps {
  id: string | null;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class User extends BaseEntity {
  private _name: string;
  private _email: string;
  private _avatarUrl: string | null;

  constructor(props: UserProps) {
    super(props.id ?? randomUUID(), props.createdAt, props.updatedAt);
    this.validateName(props.name);
    this.validateEmail(props.email);
    this._name = props.name;
    this._email = props.email;
    this._avatarUrl = props.avatarUrl ?? null;
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

  updateName(name: string): void {
    this.validateName(name);
    this._name = name;
    this.setUpdatedAt(new Date());
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationException('Name must not be empty');
    }
    if (name.length > 100) {
      throw new ValidationException('Name must not exceed 100 characters');
    }
  }

  private validateEmail(email: string): void {
    if (!email || email.trim().length === 0) {
      throw new ValidationException('Email must not be empty');
    }
    if (email.length > 100) {
      throw new ValidationException('Email must not exceed 100 characters');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationException('Email format is invalid');
    }
  }
}
