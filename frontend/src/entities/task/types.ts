export type TaskStatus = 'OK' | 'DUE_SOON' | 'OVERDUE';

export interface Task {
  id: string;
  name: string;
  description: string | null;
  intervalHours: number;
  lastServicedAtHours: number | null;
  isDefault: boolean;
  isActive: boolean;
  status: TaskStatus;
  hoursRemaining: number;
}

export interface CreateTaskParams {
  name: string;
  description?: string;
  intervalHours: number;
}

export interface UpdateTaskParams {
  name?: string;
  description?: string;
  intervalHours?: number;
  isActive?: boolean;
}

export interface CompleteTaskParams {
  performedAtHours: number;
  performedAtDate: string;
  notes?: string;
  photos?: string[];
}
