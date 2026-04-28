import { IllegalStateException } from '@/shared/domain/exceptions';

export abstract class BaseEntity {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(id: string, createdAt: Date | null, updatedAt: Date | null) {
    if (!id || id.trim().length === 0) {
      throw new IllegalStateException('Entity id must not be empty');
    }
    const created = createdAt ?? new Date();
    const updated = updatedAt ?? new Date();
    if (created.getTime() > updated.getTime()) {
      throw new IllegalStateException('createdAt must not be after updatedAt');
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
