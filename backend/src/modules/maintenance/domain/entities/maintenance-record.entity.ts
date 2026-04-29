import { randomUUID } from 'crypto';
import { BaseEntity } from '@/shared/domain/base.entity';
import { ValidationException } from '@/shared/domain/exceptions';
import { NumberValidator } from '@/shared/domain/number-validator';
import { StringValidator } from '@/shared/domain/string-validator';

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
    MaintenanceRecord.validateTaskId(props.taskId);
    MaintenanceRecord.validateMotorcycleId(props.motorcycleId);
    MaintenanceRecord.validateCurrentMotorcycleHours(props.currentMotorcycleHours);
    MaintenanceRecord.validatePerformedAtHours(
      props.performedAtHours,
      props.currentMotorcycleHours,
    );
    MaintenanceRecord.validatePerformedAtDate(props.performedAtDate);
    MaintenanceRecord.validatePhotos(props.photos);
    super(props.id ?? randomUUID(), props.createdAt, null);
    this._taskId = props.taskId;
    this._motorcycleId = props.motorcycleId;
    this._performedAtHours = props.performedAtHours;
    this._performedAtDate = props.performedAtDate;
    this._notes = MaintenanceRecord.normalizeNotes(props.notes);
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
    if (props.notes !== null) {
      this._notes = MaintenanceRecord.normalizeNotes(props.notes);
    }
    if (props.photos !== null) {
      MaintenanceRecord.validatePhotos(props.photos);
      this._photos = props.photos;
    }
  }

  private static validateTaskId(taskId: string): void {
    StringValidator.nonEmpty(taskId, 'Task id');
  }

  private static validateMotorcycleId(motorcycleId: string): void {
    StringValidator.nonEmpty(motorcycleId, 'Motorcycle id');
  }

  private static validateCurrentMotorcycleHours(currentMotorcycleHours: number): void {
    NumberValidator.integer(currentMotorcycleHours, 'Current motorcycle hours');
    NumberValidator.nonNegative(
      currentMotorcycleHours,
      'Current motorcycle hours',
    );
  }

  private static validatePerformedAtHours(
    performedAtHours: number,
    currentMotorcycleHours: number,
  ): void {
    NumberValidator.integer(performedAtHours, 'Performed at hours');
    NumberValidator.nonNegative(performedAtHours, 'Performed at hours');
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

  private static validatePhotos(photos: string[] | null): void {
    if (photos === null) return;
    photos.forEach((photo, index) => {
      const field = `Photo URL [${index}]`;
      StringValidator.nonEmpty(photo, field);
      StringValidator.url(photo, field);
    });
  }

  private static normalizeNotes(notes: string | null | undefined): string | null {
    if (notes === null || notes === undefined) return null;
    return notes.trim().length === 0 ? null : notes;
  }
}
