import type { CardProps } from './type/card.type';
import styles from './Card.module.css';

export function Card({ children, borderColor, className, onClick }: CardProps) {
  return (
    <div
      className={`${styles.card} ${onClick ? styles.clickable : ''} ${className || ''}`}
      style={borderColor ? { borderLeftColor: borderColor } : undefined}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
