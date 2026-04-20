export type Status = 'OK' | 'DUE_SOON' | 'OVERDUE';

export interface StatusBadgeProps {
  status: Status;
}
