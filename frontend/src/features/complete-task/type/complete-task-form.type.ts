import type { Task } from '@/entities/task';

export interface CompleteTaskFormProps {
  motorcycleId: string;
  task: Task;
  defaultHours: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}
