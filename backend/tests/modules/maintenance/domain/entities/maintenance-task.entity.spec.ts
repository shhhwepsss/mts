import { MaintenanceTask } from '@/modules/maintenance/domain/entities/maintenance-task.entity';
import { ValidationException } from '@/shared/domain/exceptions';

describe('MaintenanceTask Entity', () => {
  const validProps = {
    motorcycleId: '123',
    name: 'Oil Change',
    intervalHours: 15,
    lastServicedAtHours: 0,
    isDefault: true,
    isActive: true,
  };

  it('should create a valid task', () => {
    const task = new MaintenanceTask(validProps);
    expect(task.getName()).toBe('Oil Change');
    expect(task.getIntervalHours()).toBe(15);
    expect(task.getLastServicedAtHours()).toBe(0);
  });

  it('should reject empty name', () => {
    expect(() => new MaintenanceTask({ ...validProps, name: '' })).toThrow(
      ValidationException,
    );
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
    task.markServiced(100);
    expect(task.getLastServicedAtHours()).toBe(100);
  });
});
