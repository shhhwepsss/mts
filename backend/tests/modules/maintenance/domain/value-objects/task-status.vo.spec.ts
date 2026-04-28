import { TaskStatus, TaskStatusEnum } from '../../../../../src/modules/maintenance/domain/value-objects/task-status.vo';

describe('TaskStatus', () => {
  it('should be OK when hours remaining > 2', () => {
    const status = TaskStatus.calculate(15, 142.5, 130);
    expect(status.status).toBe(TaskStatusEnum.OK);
    expect(status.hoursRemaining).toBe(2.5);
  });

  it('should be OVERDUE when remaining is negative', () => {
    const status = TaskStatus.calculate(15, 150, 130);
    expect(status.status).toBe(TaskStatusEnum.OVERDUE);
    expect(status.hoursRemaining).toBe(-5);
  });

  it('should be DUE_SOON when remaining <= 2', () => {
    const status = TaskStatus.calculate(15, 143.5, 130);
    expect(status.status).toBe(TaskStatusEnum.DUE_SOON);
    expect(status.hoursRemaining).toBe(1.5);
  });

  it('should be OVERDUE when lastServicedAtHours is null', () => {
    const status = TaskStatus.calculate(15, 100, null);
    expect(status.status).toBe(TaskStatusEnum.OVERDUE);
    expect(status.hoursRemaining).toBe(0);
  });

  it('should be exactly OVERDUE when remaining is 0', () => {
    const status = TaskStatus.calculate(15, 145, 130);
    expect(status.status).toBe(TaskStatusEnum.OVERDUE);
    expect(status.hoursRemaining).toBe(0);
  });
});
