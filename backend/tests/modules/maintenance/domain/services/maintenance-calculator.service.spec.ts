import { MaintenanceCalculator } from '../../../../../src/modules/maintenance/domain/services/maintenance-calculator.service';
import { MaintenanceTask } from '../../../../../src/modules/maintenance/domain/entities/maintenance-task.entity';
import { TaskStatusEnum } from '../../../../../src/modules/maintenance/domain/value-objects/task-status.vo';

describe('MaintenanceCalculator', () => {
  const calculator = new MaintenanceCalculator();

  it('should compute status for active tasks', () => {
    const task = new MaintenanceTask({
      motorcycleId: 'moto-1',
      name: 'Oil Change',
      intervalHours: 15,
      lastServicedAtHours: 130,
      isDefault: true,
      isActive: true,
    });

    const results = calculator.calculateStatuses([task], 142.5);
    expect(results).toHaveLength(1);
    expect(results[0].status.status).toBe(TaskStatusEnum.OK);
    expect(results[0].status.hoursRemaining).toBe(2.5);
  });

  it('should skip inactive tasks', () => {
    const task = new MaintenanceTask({
      motorcycleId: 'moto-1',
      name: 'Oil Change',
      intervalHours: 15,
      isDefault: true,
      isActive: false,
    });

    const results = calculator.calculateStatuses([task], 100);
    expect(results).toHaveLength(0);
  });

  it('should flag OVERDUE when never serviced', () => {
    const task = new MaintenanceTask({
      motorcycleId: 'moto-1',
      name: 'Oil Change',
      intervalHours: 15,
      isDefault: true,
      isActive: true,
    });

    const results = calculator.calculateStatuses([task], 100);
    expect(results[0].status.status).toBe(TaskStatusEnum.OVERDUE);
  });
});
