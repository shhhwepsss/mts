import type { Status } from '@/shared/ui/StatusBadge/type/status-badge.type';

export function formatHours(hours: number, unit: string = 'h'): string {
  return `${hours}${unit}`;
}

export function formatDate(date: Date, locale: string = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function getStatusColor(status: Status): string {
  const colors: Record<Status, string> = {
    OK: 'var(--status-ok)',
    DUE_SOON: 'var(--status-due-soon)',
    OVERDUE: 'var(--status-overdue)',
    NEED_TO_COMPLETE: 'var(--status-need-to-complete)',
  };
  return colors[status];
}
