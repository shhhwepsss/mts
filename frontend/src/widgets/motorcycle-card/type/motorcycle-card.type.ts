import type { Motorcycle } from '@/entities/motorcycle';

export interface MotorcycleCardProps {
  motorcycle: Motorcycle;
  overdueCount?: number;
  dueSoonCount?: number;
}
