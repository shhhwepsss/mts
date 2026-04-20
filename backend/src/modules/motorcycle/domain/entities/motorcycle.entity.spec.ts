import { Motorcycle } from './motorcycle.entity';
import { MotorcycleTypeEnum } from '../enums/motorcycle-type.enum';
import { ValidationException } from '../../../../shared/domain/exceptions';

describe('Motorcycle Entity', () => {
  const validProps = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    name: 'My KTM',
    brand: 'KTM',
    model: 'EXC-F 350',
    year: 2023,
    type: MotorcycleTypeEnum.ENDURO,
    currentHours: 142.5,
  };

  it('should create a valid motorcycle', () => {
    const moto = new Motorcycle(validProps);
    expect(moto.getName()).toBe('My KTM');
    expect(moto.getCurrentHours()).toBe(142.5);
    expect(moto.getType()).toBe(MotorcycleTypeEnum.ENDURO);
  });

  it('should reject empty name', () => {
    expect(() => new Motorcycle({ ...validProps, name: '' })).toThrow(
      ValidationException,
    );
  });

  it('should reject name longer than 255', () => {
    expect(
      () => new Motorcycle({ ...validProps, name: 'a'.repeat(256) }),
    ).toThrow(ValidationException);
  });

  it('should reject empty brand', () => {
    expect(() => new Motorcycle({ ...validProps, brand: '' })).toThrow(
      ValidationException,
    );
  });

  it('should reject empty model', () => {
    expect(() => new Motorcycle({ ...validProps, model: '' })).toThrow(
      ValidationException,
    );
  });

  it('should reject year in the future', () => {
    expect(() => new Motorcycle({ ...validProps, year: 2099 })).toThrow(
      ValidationException,
    );
  });

  it('should reject negative currentHours', () => {
    expect(() => new Motorcycle({ ...validProps, currentHours: -1 })).toThrow(
      ValidationException,
    );
  });

  it('should reject invalid type', () => {
    expect(
      () => new Motorcycle({ ...validProps, type: 'INVALID' as any }),
    ).toThrow(ValidationException);
  });

  it('should update hours (increase only)', () => {
    const moto = new Motorcycle(validProps);
    moto.updateHours(150);
    expect(moto.getCurrentHours()).toBe(150);
  });

  it('should reject decreasing hours', () => {
    const moto = new Motorcycle(validProps);
    expect(() => moto.updateHours(100)).toThrow(ValidationException);
  });

  it('should allow same hours (no change)', () => {
    const moto = new Motorcycle(validProps);
    moto.updateHours(142.5);
    expect(moto.getCurrentHours()).toBe(142.5);
  });
});
