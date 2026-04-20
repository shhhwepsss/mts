import type { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  borderColor?: string;
  className?: string;
  onClick?: () => void;
}
