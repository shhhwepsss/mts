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
    if (lastServicedAtHours === null) {
      return new TaskStatus(TaskStatusEnum.OVERDUE, 0);
    }
    const remaining = intervalHours - (currentHours - lastServicedAtHours);
    if (remaining <= 0) {
      return new TaskStatus(TaskStatusEnum.OVERDUE, remaining);
    }
    if (remaining <= DUE_SOON_THRESHOLD) {
      return new TaskStatus(TaskStatusEnum.DUE_SOON, remaining);
    }
    return new TaskStatus(TaskStatusEnum.OK, remaining);
  }
}
