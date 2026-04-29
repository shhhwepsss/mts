import { MaintenanceTask } from '@/modules/maintenance/domain/entities/maintenance-task.entity';
import { ValidationException } from '@/shared/domain/exceptions';

describe('MaintenanceTask Entity', () => {
  const validProps = {
    id: null,
    motorcycleId: '123',
    name: 'Oil Change',
    description: null,
    intervalHours: 15,
    lastServicedAtHours: 0,
    isDefault: true,
    isActive: true,
    createdAt: null,
    updatedAt: null,
  };

  it('should create a valid task', () => {
    const task = new MaintenanceTask(validProps);
    expect(task.getName()).toBe('Oil Change');
    expect(task.getIntervalHours()).toBe(15);
    expect(task.getLastServicedAtHours()).toBe(0);
  });

  it('number fields must not be decimal', () => {
    expect(
      () => new MaintenanceTask({ ...validProps, intervalHours: 100.5 }),
    ).toThrow(ValidationException);
    expect(
      () =>
        new MaintenanceTask({ ...validProps, lastServicedAtHours: 100.5123 }),
    ).toThrow(ValidationException);
  });

  it('should reject empty or invalid name', () => {
    expect(() => new MaintenanceTask({ ...validProps, name: '' })).toThrow(
      ValidationException,
    );
    expect(() => new MaintenanceTask({ ...validProps, name: ' ' })).toThrow(
      ValidationException,
    );
    expect(
      () => new MaintenanceTask({ ...validProps, name: 'a'.repeat(256) }),
    ).toThrow(ValidationException);
  });

  it('should reject empty motorcycle id', () => {
    expect(
      () => new MaintenanceTask({ ...validProps, motorcycleId: '' }),
    ).toThrow(ValidationException);
    expect(
      () => new MaintenanceTask({ ...validProps, motorcycleId: ' ' }),
    ).toThrow(ValidationException);
  });

  it('should reject intervalHours <= 0', () => {
    expect(
      () => new MaintenanceTask({ ...validProps, intervalHours: 0 }),
    ).toThrow(ValidationException);
    expect(
      () => new MaintenanceTask({ ...validProps, intervalHours: -5 }),
    ).toThrow(ValidationException);
  });

  it('should default lastServicedAtHours to 0 for fresh tasks', () => {
    const task = new MaintenanceTask(validProps);
    expect(task.getLastServicedAtHours()).toBe(0);
  });

  it('should update lastServicedAtHours', () => {
    const task = new MaintenanceTask(validProps);
    task.markServicedAt(100);
    expect(task.getLastServicedAtHours()).toBe(100);
  });

  it('should reject newServicedAt < lastServicedAtHours ', () => {
    const task = new MaintenanceTask(validProps);
    task.markServicedAt(100);
    expect(task.getLastServicedAtHours()).toBe(100);
  });

  it('should allow newServicedAt = lastServicedAtHours ', () => {
    const task = new MaintenanceTask(validProps);
    task.markServicedAt(100);
    expect(task.getLastServicedAtHours()).toBe(100);

    expect(() => task.markServicedAt(0)).toThrow(ValidationException);
  });
  it('should mark description to null if empty ', () => {
    const task = new MaintenanceTask({ ...validProps, description: '' });
    expect(task.getDescription()).toBe(null);

    const task2 = new MaintenanceTask({ ...validProps, description: ' ' });
    expect(task2.getDescription()).toBe(null);
  });
});
