import { randomUUID } from 'crypto';
import { BaseEntity } from '@/shared/domain/base.entity';
import { ValidationException } from '@/shared/domain/exceptions';

interface MaintenanceRecordProps {
  id: string | null;
  taskId: string;
  motorcycleId: string;
  performedAtHours: number;
  performedAtDate: Date;
  currentMotorcycleHours: number;
  notes: string | null;
  photos: string[] | null;
  createdAt: Date | null;
}

export class MaintenanceRecord extends BaseEntity {
  private readonly _taskId: string;
  private readonly _motorcycleId: string;
  private _performedAtHours: number;
  private _performedAtDate: Date;
  private _notes: string | null;
  private _photos: string[];

  constructor(props: MaintenanceRecordProps) {
    MaintenanceRecord.validatePerformedAtHours(
      props.performedAtHours,
      props.currentMotorcycleHours,
    );
    MaintenanceRecord.validatePerformedAtDate(props.performedAtDate);
    super(props.id ?? randomUUID(), props.createdAt, null);
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
    performedAtHours: number | null;
    performedAtDate: Date | null;
    currentMotorcycleHours: number;
    notes: string | null;
    photos: string[] | null;
  }): void {
    if (props.performedAtHours !== null) {
      MaintenanceRecord.validatePerformedAtHours(
        props.performedAtHours,
        props.currentMotorcycleHours,
      );
      this._performedAtHours = props.performedAtHours;
    }
    if (props.performedAtDate !== null) {
      MaintenanceRecord.validatePerformedAtDate(props.performedAtDate);
      this._performedAtDate = props.performedAtDate;
    }
    if (props.notes !== null) this._notes = props.notes;
    if (props.photos !== null) this._photos = props.photos;
  }

  private static validatePerformedAtHours(
    performedAtHours: number,
    currentMotorcycleHours: number,
  ): void {
    if (performedAtHours > currentMotorcycleHours) {
      throw new ValidationException(
        'Performed at hours cannot exceed current motorcycle hours',
      );
    }
  }

  private static validatePerformedAtDate(performedAtDate: Date): void {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    if (performedAtDate > now) {
      throw new ValidationException('Performed date must not be in the future');
    }
  }
}
