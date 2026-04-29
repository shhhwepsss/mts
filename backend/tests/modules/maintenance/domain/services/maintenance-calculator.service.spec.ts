import { MaintenanceCalculator } from '@/modules/maintenance/domain/services/maintenance-calculator.service';
import { MaintenanceTask } from '@/modules/maintenance/domain/entities/maintenance-task.entity';
import { TaskStatusEnum } from '@/modules/maintenance/domain/value-objects/task-status.vo';

describe('MaintenanceCalculator', () => {
  const calculator = new MaintenanceCalculator();

  it('should compute status for active tasks', () => {
    const task = new MaintenanceTask({
      id: null,
      motorcycleId: 'moto-1',
      name: 'Oil Change',
      description: null,
      intervalHours: 15,
      lastServicedAtHours: 130,
      isDefault: true,
      isActive: true,
      createdAt: null,
      updatedAt: null,
    });

    const results = calculator.calculateStatuses([task], 142);
    expect(results).toHaveLength(1);
    expect(results[0].status.status).toBe(TaskStatusEnum.OK);
    expect(results[0].status.hoursRemaining).toBe(3);
  });

  it('should skip inactive tasks', () => {
    const task = new MaintenanceTask({
      id: null,
      motorcycleId: 'moto-1',
      name: 'Oil Change',
      description: null,
      intervalHours: 15,
      lastServicedAtHours: 0,
      isDefault: true,
      isActive: false,
      createdAt: null,
      updatedAt: null,
    });

    const results = calculator.calculateStatuses([task], 100);
    expect(results).toHaveLength(0);
  });

  it('should flag OVERDUE when never serviced', () => {
    const task = new MaintenanceTask({
      id: null,
      motorcycleId: 'moto-1',
      name: 'Oil Change',
      description: null,
      intervalHours: 15,
      lastServicedAtHours: 0,
      isDefault: true,
      isActive: true,
      createdAt: null,
      updatedAt: null,
    });

    const results = calculator.calculateStatuses([task], 100);
    expect(results[0].status.status).toBe(TaskStatusEnum.OVERDUE);
  });

  it('should flag NEED_TO_COMPLETE when interval hours equals to current hours', () => {
    const task = new MaintenanceTask({
      id: null,
      motorcycleId: 'moto-1',
      name: 'Oil Change',
      description: null,
      intervalHours: 15,
      lastServicedAtHours: 0,
      isDefault: true,
      isActive: true,
      createdAt: null,
      updatedAt: null,
    });

    const results = calculator.calculateStatuses([task], 15);
    expect(results[0].status.status).toBe(TaskStatusEnum.NEED_TO_COMPLETE);
  });
});
