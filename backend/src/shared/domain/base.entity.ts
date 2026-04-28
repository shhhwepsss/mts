import { ValidationException } from '@/shared/domain/exceptions';
import { StringValidator } from '@/shared/domain/string-validator';

export abstract class BaseEntity {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(id: string, createdAt: Date | null, updatedAt: Date | null) {
    StringValidator.nonEmpty(id, 'Entity id');
    const created = createdAt ?? new Date();
    const updated = updatedAt ?? new Date();
    if (created.getTime() > updated.getTime()) {
      throw new ValidationException('createdAt must not be after updatedAt');
    }
    this._id = id;
    this._createdAt = created;
    this._updatedAt = updated;
  }

  getId(): string {
    return this._id;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  protected setUpdatedAt(date: Date): void {
    this._updatedAt = date;
  }
}
