import { MaintenanceRecord } from '@/modules/maintenance/domain/entities/maintenance-record.entity';
import { ValidationException } from '@/shared/domain/exceptions';

describe('MaintenanceRecord Entity', () => {
  const date = new Date();
  const validProps = {
    id: null,
    taskId: '123',
    motorcycleId: '456',
    performedAtHours: 100,
    performedAtDate: date,
    currentMotorcycleHours: 142,
    notes: null,
    photos: null,
    createdAt: null,
  };

  it('should create a valid record', () => {
    const record = new MaintenanceRecord(validProps);
    expect(record.getPerformedAtHours()).toBe(100);
  });

  it('performed at hours must not be a decimal ', () => {
    expect(
      () =>
        new MaintenanceRecord({
          ...validProps,
          performedAtHours: 100.1,
        }),
    ).toThrow(ValidationException);
  });

  it('currentMotorcycleHours must not be a decimal ', () => {
    expect(
      () =>
        new MaintenanceRecord({
          ...validProps,
          currentMotorcycleHours: 142.5,
        }),
    ).toThrow(ValidationException);
  });
  it('should reject empty motorcycleId', () => {
    expect(
      () => new MaintenanceRecord({ ...validProps, motorcycleId: ' ' }),
    ).toThrow(ValidationException);
    expect(
      () => new MaintenanceRecord({ ...validProps, motorcycleId: '' }),
    ).toThrow(ValidationException);
  });

  it('should reject empty taskId', () => {
    expect(() => new MaintenanceRecord({ ...validProps, taskId: ' ' })).toThrow(
      ValidationException,
    );
    expect(() => new MaintenanceRecord({ ...validProps, taskId: '' })).toThrow(
      ValidationException,
    );
  });

  it('should reject negative currentMotorcycleHours', () => {
    expect(
      () =>
        new MaintenanceRecord({ ...validProps, currentMotorcycleHours: -1 }),
    ).toThrow(ValidationException);
  });

  it('should reject performedAtHours > currentMotorcycleHours', () => {
    expect(
      () => new MaintenanceRecord({ ...validProps, performedAtHours: 200 }),
    ).toThrow(ValidationException);
  });

  it('should reject future performedAtDate', () => {
    const performedAtDate = new Date();
    performedAtDate.setFullYear(date.getFullYear() + 10);
    expect(
      () =>
        new MaintenanceRecord({
          ...validProps,
          performedAtDate: performedAtDate,
        }),
    ).toThrow(ValidationException);
  });

  it('should allow performedAtHours equal to currentMotorcycleHours', () => {
    const record = new MaintenanceRecord({
      ...validProps,
      performedAtHours: 142.5,
    });
    expect(record.getPerformedAtHours()).toBe(142.5);
  });

  it('should set null if notes is empty', () => {
    const record = new MaintenanceRecord({
      ...validProps,
      notes: '',
    });
    expect(record.getNotes()).toBe(null);
    const record2 = new MaintenanceRecord({
      ...validProps,
      notes: ' ',
    });
    expect(record2.getNotes()).toBe(null);
  });

  it('should reject empty or invalid photo urls', () => {
    expect(
      () =>
        new MaintenanceRecord({
          ...validProps,
          photos: ['', ' ', 'not-a-url-string'],
        }),
    ).toThrow(ValidationException);
  });
});
