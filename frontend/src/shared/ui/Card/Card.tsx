import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  borderColor?: string;
  className?: string;
  onClick?: () => void;
}

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
