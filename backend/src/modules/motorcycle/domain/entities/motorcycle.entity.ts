import { randomUUID } from 'crypto';
import { BaseEntity } from '@/shared/domain/base.entity';
import { ValidationException } from '@/shared/domain/exceptions';
import { StringValidator } from '@/shared/domain/string-validator';
import { MotorcycleTypeEnum } from '@/modules/motorcycle/domain/enums/motorcycle-type.enum';

interface MotorcycleProps {
  id: string | null;
  userId: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: MotorcycleTypeEnum;
  currentHours: number;
  imageUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
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
    Motorcycle.validateName(props.name);
    Motorcycle.validateBrand(props.brand);
    Motorcycle.validateModel(props.model);
    Motorcycle.validateYear(props.year);
    Motorcycle.validateType(props.type);
    Motorcycle.validateHours(props.currentHours);
    super(props.id ?? randomUUID(), props.createdAt, props.updatedAt);
    this._userId = props.userId;
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
    name: string | null;
    brand: string | null;
    model: string | null;
    year: number | null;
    type: MotorcycleTypeEnum | null;
    imageUrl: string | null;
  }): void {
    if (props.name !== null) {
      Motorcycle.validateName(props.name);
      this._name = props.name;
    }
    if (props.brand !== null) {
      Motorcycle.validateBrand(props.brand);
      this._brand = props.brand;
    }
    if (props.model !== null) {
      Motorcycle.validateModel(props.model);
      this._model = props.model;
    }
    if (props.year !== null) {
      Motorcycle.validateYear(props.year);
      this._year = props.year;
    }
    if (props.type !== null) {
      Motorcycle.validateType(props.type);
      this._type = props.type;
    }
    if (props.imageUrl !== null) {
      this._imageUrl = props.imageUrl;
    }
    this.setUpdatedAt(new Date());
  }

  private static validateName(name: string): void {
    StringValidator.nonEmpty(name, 'Name');
    StringValidator.maxLength(name, 'Name', 255);
  }

  private static validateBrand(brand: string): void {
    StringValidator.nonEmpty(brand, 'Brand');
    StringValidator.maxLength(brand, 'Brand', 255);
  }

  private static validateModel(model: string): void {
    StringValidator.nonEmpty(model, 'Model');
    StringValidator.maxLength(model, 'Model', 255);
  }

  private static validateYear(year: number): void {
    if (year > new Date().getFullYear()) {
      throw new ValidationException('Year cannot be in the future');
    }
  }

  private static validateType(type: MotorcycleTypeEnum): void {
    if (!Object.values(MotorcycleTypeEnum).includes(type)) {
      throw new ValidationException('Invalid motorcycle type');
    }
  }

  private static validateHours(hours: number): void {
    if (hours < 0) {
      throw new ValidationException('Current hours must be >= 0');
    }
  }
}
