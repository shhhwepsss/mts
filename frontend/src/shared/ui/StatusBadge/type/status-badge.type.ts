export type Status = 'OK' | 'DUE_SOON' | 'OVERDUE' | 'NEED_TO_COMPLETE';

export interface StatusBadgeProps {
  status: Status;
}
