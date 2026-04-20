import { randomUUID } from 'crypto';
import { BaseEntity } from '../../../../shared/domain/base.entity';
import { ValidationException } from '../../../../shared/domain/exceptions';

interface MaintenanceTaskProps {
  id?: string;
  motorcycleId: string;
  name: string;
  description?: string;
  intervalHours: number;
  lastServicedAtHours?: number | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class MaintenanceTask extends BaseEntity {
  private readonly _motorcycleId: string;
  private _name: string;
  private _description: string | null;
  private _intervalHours: number;
  private _lastServicedAtHours: number | null;
  private _isDefault: boolean;
  private _isActive: boolean;

  constructor(props: MaintenanceTaskProps) {
    super(props.id ?? randomUUID(), props.createdAt, props.updatedAt);
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationException('Task name must not be empty');
    }
    if (props.intervalHours <= 0) {
      throw new ValidationException('Interval hours must be greater than 0');
    }
    this._motorcycleId = props.motorcycleId;
    this._name = props.name;
    this._description = props.description ?? null;
    this._intervalHours = props.intervalHours;
    this._lastServicedAtHours = props.lastServicedAtHours ?? null;
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
  getLastServicedAtHours(): number | null {
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

  rollbackLastServiced(previousHours: number | null): void {
    this._lastServicedAtHours = previousHours;
    this.setUpdatedAt(new Date());
  }

  updateDetails(props: {
    name?: string;
    description?: string;
    intervalHours?: number;
    isActive?: boolean;
  }): void {
    if (props.name !== undefined) {
      if (!props.name || props.name.trim().length === 0)
        throw new ValidationException('Task name must not be empty');
      this._name = props.name;
    }
    if (props.description !== undefined) this._description = props.description;
    if (props.intervalHours !== undefined) {
      if (props.intervalHours <= 0)
        throw new ValidationException('Interval hours must be greater than 0');
      this._intervalHours = props.intervalHours;
    }
    if (props.isActive !== undefined) this._isActive = props.isActive;
    this.setUpdatedAt(new Date());
  }
}
