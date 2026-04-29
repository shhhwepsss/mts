import { formatHours } from '@/shared/lib';
import type { Task } from '@/entities/task';

export function formatRemaining(task: Task): string {
  if (task.status === 'NEED_TO_COMPLETE') return 'Service required now';
  if (task.hoursRemaining >= 0) return `${formatHours(task.hoursRemaining)} remaining`;
  return `${formatHours(-task.hoursRemaining)} overdue`;
}
