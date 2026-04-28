import { randomUUID } from 'crypto';
import { BaseEntity } from '@/shared/domain/base.entity';
import { StringValidator } from '@/shared/domain/string-validator';

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
    User.validateName(props.name);
    User.validateEmail(props.email);
    super(props.id ?? randomUUID(), props.createdAt, props.updatedAt);
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
    User.validateName(name);
    this._name = name;
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
}
