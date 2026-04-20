export function formatHours(hours: number): string {
  return `${hours}h`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function getStatusColor(status: 'OK' | 'DUE_SOON' | 'OVERDUE'): string {
  const colors = {
    OK: 'var(--status-ok)',
    DUE_SOON: 'var(--status-due-soon)',
    OVERDUE: 'var(--status-overdue)',
  };
  return colors[status];
}
