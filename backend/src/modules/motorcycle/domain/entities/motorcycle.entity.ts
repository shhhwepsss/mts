import { randomUUID } from 'crypto';
import { BaseEntity } from '@/shared/domain/base.entity';
import { ValidationException } from '@/shared/domain/exceptions';
import { MotorcycleTypeEnum } from '@/modules/motorcycle/domain/enums/motorcycle-type.enum';

interface MotorcycleProps {
  id?: string;
  userId: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: MotorcycleTypeEnum;
  currentHours: number;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Motorcycle extends BaseEntity {
  private readonly _userId: string;
  private _name: string;
  private _brand: string;
  private _model: string;
  private _year: number;
  private _type: MotorcycleTypeEnum;
  private _currentHours: number;
  private _imageUrl: string | null;

  constructor(props: MotorcycleProps) {
    super(props.id ?? randomUUID(), props.createdAt, props.updatedAt);
    this._userId = props.userId;
    this.validateString(props.name, 'Name', 255);
    this.validateString(props.brand, 'Brand', 255);
    this.validateString(props.model, 'Model', 255);
    this.validateYear(props.year);
    this.validateType(props.type);
    this.validateHours(props.currentHours);
    this._name = props.name;
    this._brand = props.brand;
    this._model = props.model;
    this._year = props.year;
    this._type = props.type;
    this._currentHours = props.currentHours;
    this._imageUrl = props.imageUrl ?? null;
  }

  getUserId(): string {
    return this._userId;
  }
  getName(): string {
    return this._name;
  }
  getBrand(): string {
    return this._brand;
  }
  getModel(): string {
    return this._model;
  }
  getYear(): number {
    return this._year;
  }
  getType(): MotorcycleTypeEnum {
    return this._type;
  }
  getCurrentHours(): number {
    return this._currentHours;
  }
  getImageUrl(): string | null {
    return this._imageUrl;
  }

  updateHours(hours: number): void {
    if (hours < this._currentHours) {
      throw new ValidationException('Hours can only increase');
    }
    this._currentHours = hours;
    this.setUpdatedAt(new Date());
  }

  updateDetails(props: {
    name?: string;
    brand?: string;
    model?: string;
    year?: number;
    type?: MotorcycleTypeEnum;
    imageUrl?: string;
  }): void {
    if (props.name !== undefined) {
      this.validateString(props.name, 'Name', 255);
      this._name = props.name;
    }
    if (props.brand !== undefined) {
      this.validateString(props.brand, 'Brand', 255);
      this._brand = props.brand;
    }
    if (props.model !== undefined) {
      this.validateString(props.model, 'Model', 255);
      this._model = props.model;
    }
    if (props.year !== undefined) {
      this.validateYear(props.year);
      this._year = props.year;
    }
    if (props.type !== undefined) {
      this.validateType(props.type);
      this._type = props.type;
    }
    if (props.imageUrl !== undefined) {
      this._imageUrl = props.imageUrl;
    }
    this.setUpdatedAt(new Date());
  }

  private validateString(
    value: string,
    field: string,
    maxLength: number,
  ): void {
    if (!value || value.trim().length === 0) {
      throw new ValidationException(`${field} must not be empty`);
    }
    if (value.length > maxLength) {
      throw new ValidationException(
        `${field} must not exceed ${maxLength} characters`,
      );
    }
  }

  private validateYear(year: number): void {
    if (year > new Date().getFullYear()) {
      throw new ValidationException('Year cannot be in the future');
    }
  }

  private validateType(type: MotorcycleTypeEnum): void {
    if (!Object.values(MotorcycleTypeEnum).includes(type)) {
      throw new ValidationException('Invalid motorcycle type');
    }
  }

  private validateHours(hours: number): void {
    if (hours < 0) {
      throw new ValidationException('Current hours must be >= 0');
    }
  }
}
