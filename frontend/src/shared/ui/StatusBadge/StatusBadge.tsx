import type { StatusBadgeProps } from './type/status-badge.type';
import styles from './StatusBadge.module.css';

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`${styles.badge} ${styles[status]}`}>●</span>;
}
