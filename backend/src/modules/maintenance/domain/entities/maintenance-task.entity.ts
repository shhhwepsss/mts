import { randomUUID } from 'crypto';
import { BaseEntity } from '@/shared/domain/base.entity';
import { ValidationException } from '@/shared/domain/exceptions';
import { StringValidator } from '@/shared/domain/string-validator';

interface MaintenanceTaskProps {
  id: string | null;
  motorcycleId: string;
  name: string;
  description: string | null;
  intervalHours: number;
  lastServicedAtHours: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class MaintenanceTask extends BaseEntity {
  private readonly _motorcycleId: string;
  private _name: string;
  private _description: string | null;
  private _intervalHours: number;
  private _lastServicedAtHours: number;
  private _isDefault: boolean;
  private _isActive: boolean;

  constructor(props: MaintenanceTaskProps) {
    MaintenanceTask.validateName(props.name);
    MaintenanceTask.validateIntervalHours(props.intervalHours);
    super(props.id ?? randomUUID(), props.createdAt, props.updatedAt);
    this._motorcycleId = props.motorcycleId;
    this._name = props.name;
    this._description = props.description ?? null;
    this._intervalHours = props.intervalHours;
    this._lastServicedAtHours = props.lastServicedAtHours;
    this._isDefault = props.isDefault;
    this._isActive = props.isActive;
  }

  getMotorcycleId(): string {
    return this._motorcycleId;
  }
  getName(): string {
    return this._name;
  }
  getDescription(): string | null {
    return this._description;
  }
  getIntervalHours(): number {
    return this._intervalHours;
  }
  getLastServicedAtHours(): number {
    return this._lastServicedAtHours;
  }
  getIsDefault(): boolean {
    return this._isDefault;
  }
  getIsActive(): boolean {
    return this._isActive;
  }

  markServiced(atHours: number): void {
    this._lastServicedAtHours = atHours;
    this.setUpdatedAt(new Date());
  }

  rollbackLastServiced(previousHours: number): void {
    this._lastServicedAtHours = previousHours;
    this.setUpdatedAt(new Date());
  }

  updateDetails(props: {
    name: string | null;
    description: string | null;
    intervalHours: number | null;
    isActive: boolean | null;
  }): void {
    if (props.name !== null) {
      MaintenanceTask.validateName(props.name);
      this._name = props.name;
    }
    if (props.description !== null) this._description = props.description;
    if (props.intervalHours !== null) {
      MaintenanceTask.validateIntervalHours(props.intervalHours);
      this._intervalHours = props.intervalHours;
    }
    if (props.isActive !== null) this._isActive = props.isActive;
    this.setUpdatedAt(new Date());
  }

  private static validateName(name: string): void {
    StringValidator.nonEmpty(name, 'Task name');
  }

  private static validateIntervalHours(intervalHours: number): void {
    if (intervalHours <= 0) {
      throw new ValidationException('Interval hours must be greater than 0');
    }
  }
}
