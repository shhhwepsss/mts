import { MaintenanceRecord } from './maintenance-record.entity';
import { ValidationException } from '../../../../shared/domain/exceptions';

describe('MaintenanceRecord Entity', () => {
  const validProps = {
    taskId: '123',
    motorcycleId: '456',
    performedAtHours: 100,
    performedAtDate: new Date('2026-04-13'),
    currentMotorcycleHours: 142.5,
  };

  it('should create a valid record', () => {
    const record = new MaintenanceRecord(validProps);
    expect(record.getPerformedAtHours()).toBe(100);
  });

  it('should reject performedAtHours > currentMotorcycleHours', () => {
    expect(
      () => new MaintenanceRecord({ ...validProps, performedAtHours: 200 }),
    ).toThrow(ValidationException);
  });

  it('should reject future performedAtDate', () => {
    expect(
      () =>
        new MaintenanceRecord({
          ...validProps,
          performedAtDate: new Date('2099-01-01'),
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
});
