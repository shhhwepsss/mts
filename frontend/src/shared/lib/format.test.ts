import { formatHours, formatDate, getStatusColor } from './format';

describe('format utils', () => {
  it('formatHours formats with h suffix', () => {
    expect(formatHours(142.5)).toBe('142.5h');
    expect(formatHours(0)).toBe('0h');
  });

  it('formatDate formats to readable date', () => {
    expect(formatDate(new Date('2026-04-13'))).toBe('Apr 13, 2026');
  });

  it('getStatusColor returns correct color', () => {
    expect(getStatusColor('OK')).toBe('var(--status-ok)');
    expect(getStatusColor('DUE_SOON')).toBe('var(--status-due-soon)');
    expect(getStatusColor('OVERDUE')).toBe('var(--status-overdue)');
  });
});
