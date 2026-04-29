import type { Task } from '@/entities/task';

const STATUS_PRIORITY: Record<Task['status'], number> = {
  OVERDUE: 0,
  NEED_TO_COMPLETE: 1,
  DUE_SOON: 2,
  OK: 3,
};

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const byStatus = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (byStatus !== 0) return byStatus;
    return a.hoursRemaining - b.hoursRemaining;
  });
}
