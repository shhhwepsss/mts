import {
  TaskStatus,
  TaskStatusEnum,
} from '@/modules/maintenance/domain/value-objects/task-status.vo';
import { ValidationException } from '@/shared/domain/exceptions';

describe('TaskStatus', () => {
  it('should reject invalid values', () => {
    expect(() =>
      TaskStatus.calculate({
        intervalHours: 5.5,
        currentHours: 12,
        lastServicedAtHours: 10,
      }),
    ).toThrow(ValidationException);
    expect(() =>
      TaskStatus.calculate({
        intervalHours: 5,
        currentHours: 12.5,
        lastServicedAtHours: 10,
      }),
    ).toThrow(ValidationException);
    expect(() =>
      TaskStatus.calculate({
        intervalHours: 5,
        currentHours: 12,
        lastServicedAtHours: 10.5,
      }),
    ).toThrow(ValidationException);

    expect(() =>
      TaskStatus.calculate({
        intervalHours: -1,
        currentHours: 12,
        lastServicedAtHours: 10,
      }),
    ).toThrow(ValidationException);
    expect(() =>
      TaskStatus.calculate({
        intervalHours: 5,
        currentHours: -1,
        lastServicedAtHours: 0,
      }),
    ).toThrow(ValidationException);
    expect(() =>
      TaskStatus.calculate({
        intervalHours: 5,
        currentHours: 12,
        lastServicedAtHours: -1,
      }),
    ).toThrow(ValidationException);
  });

  it('should be OK when hours remaining > 2', () => {
    const status = TaskStatus.calculate({
      intervalHours: 5,
      currentHours: 12,
      lastServicedAtHours: 10,
    });
    expect(status.status).toBe(TaskStatusEnum.OK);
    expect(status.hoursRemaining).toBe(3);
  });

  it('should be DUE_SOON when remaining <= 2', () => {
    const status = TaskStatus.calculate({
      intervalHours: 5,
      currentHours: 13,
      lastServicedAtHours: 10,
    });
    expect(status.status).toBe(TaskStatusEnum.DUE_SOON);
    expect(status.hoursRemaining).toBe(2);
  });

  it('should be OVERDUE when remaining is negative', () => {
    const status = TaskStatus.calculate({
      intervalHours: 5,
      currentHours: 20,
      lastServicedAtHours: 10,
    });
    expect(status.status).toBe(TaskStatusEnum.OVERDUE);
    expect(status.hoursRemaining).toBe(-5);
  });

  it('should be NEED_TO_COMPLETE when lastServicedAtHours is null', () => {
    const status = TaskStatus.calculate({
      intervalHours: 5,
      currentHours: 10,
      lastServicedAtHours: null,
    });
    expect(status.status).toBe(TaskStatusEnum.NEED_TO_COMPLETE);
    expect(status.hoursRemaining).toBe(0);
  });

  it('should be exactly NEED_TO_COMPLETE when remaining is 0', () => {
    const status = TaskStatus.calculate({
      intervalHours: 5,
      currentHours: 15,
      lastServicedAtHours: 10,
    });
    expect(status.status).toBe(TaskStatusEnum.NEED_TO_COMPLETE);
    expect(status.hoursRemaining).toBe(0);
  });
});
