import type { Task } from '@/entities/task';
import type { I18nContextValue } from '@/shared/i18n';

export function formatRemaining(
  task: Task,
  t: I18nContextValue['t'],
  formatHours: I18nContextValue['formatHours'],
): string {
  if (task.status === 'NEED_TO_COMPLETE') return t('taskList.serviceRequiredNow');
  if (task.hoursRemaining >= 0)
    return t('taskList.remainingShort', { hours: formatHours(task.hoursRemaining) });
  return t('taskList.overdueShort', { hours: formatHours(-task.hoursRemaining) });
}
