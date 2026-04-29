import { NumberValidator } from '@/shared/domain/number-validator';

export enum TaskStatusEnum {
  OK = 'OK',
  DUE_SOON = 'DUE_SOON',
  OVERDUE = 'OVERDUE',
  NEED_TO_COMPLETE = 'NEED_TO_COMPLETE',
}

const DUE_SOON_THRESHOLD = 2;

export class TaskStatus {
  constructor(
    public readonly status: TaskStatusEnum,
    public readonly hoursRemaining: number,
  ) {}

  static calculate(params: {
    intervalHours: number;
    currentHours: number;
    lastServicedAtHours: number | null;
  }): TaskStatus {
    const { intervalHours, currentHours, lastServicedAtHours } = params;
    NumberValidator.integer(intervalHours, 'Interval hours');
    NumberValidator.nonNegative(intervalHours, 'Interval hours');
    NumberValidator.integer(currentHours, 'Current hours');
    NumberValidator.nonNegative(currentHours, 'Current hours');
    if (lastServicedAtHours !== null) {
      NumberValidator.integer(lastServicedAtHours, 'Last serviced at hours');
      NumberValidator.nonNegative(
        lastServicedAtHours,
        'Last serviced at hours',
      );
    }
    if (lastServicedAtHours === null) {
      return new TaskStatus(TaskStatusEnum.NEED_TO_COMPLETE, 0);
    }
    const remaining = intervalHours - (currentHours - lastServicedAtHours);
    if (remaining === 0) {
      return new TaskStatus(TaskStatusEnum.NEED_TO_COMPLETE, 0);
    }
    if (remaining < 0) {
      return new TaskStatus(TaskStatusEnum.OVERDUE, remaining);
    }
    if (remaining <= DUE_SOON_THRESHOLD) {
      return new TaskStatus(TaskStatusEnum.DUE_SOON, remaining);
    }
    return new TaskStatus(TaskStatusEnum.OK, remaining);
  }
}
