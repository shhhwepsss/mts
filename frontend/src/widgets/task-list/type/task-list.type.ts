import type { Task } from '@/entities/task';

export interface TaskListProps {
  motorcycleId: string;
  tasks: Task[];
}
