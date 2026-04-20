import styles from './StatusBadge.module.css';

type Status = 'OK' | 'DUE_SOON' | 'OVERDUE';

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`${styles.badge} ${styles[status]}`}>●</span>;
}
