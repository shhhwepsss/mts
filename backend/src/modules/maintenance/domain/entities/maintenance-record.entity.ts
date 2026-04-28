import { randomUUID } from 'crypto';
import { BaseEntity } from '@/shared/domain/base.entity';
import { ValidationException } from '@/shared/domain/exceptions';

interface MaintenanceRecordProps {
  id?: string;
  taskId: string;
  motorcycleId: string;
  performedAtHours: number;
  performedAtDate: Date;
  currentMotorcycleHours: number;
  notes?: string;
  photos?: string[];
  createdAt?: Date;
}

export class MaintenanceRecord extends BaseEntity {
  private readonly _taskId: string;
  private readonly _motorcycleId: string;
  private _performedAtHours: number;
  private _performedAtDate: Date;
  private _notes: string | null;
  private _photos: string[];

  constructor(props: MaintenanceRecordProps) {
    super(props.id ?? randomUUID(), props.createdAt);
    if (props.performedAtHours > props.currentMotorcycleHours) {
      throw new ValidationException(
        'Performed at hours cannot exceed current motorcycle hours',
      );
    }
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    if (props.performedAtDate > now) {
      throw new ValidationException('Performed date must not be in the future');
    }
    this._taskId = props.taskId;
    this._motorcycleId = props.motorcycleId;
    this._performedAtHours = props.performedAtHours;
    this._performedAtDate = props.performedAtDate;
    this._notes = props.notes ?? null;
    this._photos = props.photos ?? [];
  }

  getTaskId(): string {
    return this._taskId;
  }
  getMotorcycleId(): string {
    return this._motorcycleId;
  }
  getPerformedAtHours(): number {
    return this._performedAtHours;
  }
  getPerformedAtDate(): Date {
    return this._performedAtDate;
  }
  getNotes(): string | null {
    return this._notes;
  }
  getPhotos(): string[] {
    return this._photos;
  }

  updateDetails(props: {
    performedAtHours?: number;
    performedAtDate?: Date;
    currentMotorcycleHours: number;
    notes?: string;
    photos?: string[];
  }): void {
    if (props.performedAtHours !== undefined) {
      if (props.performedAtHours > props.currentMotorcycleHours) {
        throw new ValidationException(
          'Performed at hours cannot exceed current motorcycle hours',
        );
      }
      this._performedAtHours = props.performedAtHours;
    }
    if (props.performedAtDate !== undefined) {
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      if (props.performedAtDate > now) {
        throw new ValidationException(
          'Performed date must not be in the future',
        );
      }
      this._performedAtDate = props.performedAtDate;
    }
    if (props.notes !== undefined) this._notes = props.notes;
    if (props.photos !== undefined) this._photos = props.photos;
  }
}
