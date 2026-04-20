import { apiClient } from '@/shared/api';
import { API_ROUTES } from '@/shared/config/constants';
import type { Task, CreateTaskParams, UpdateTaskParams, CompleteTaskParams } from './types';

export const taskApi = {
  listByMotorcycle: (motorcycleId: string) =>
    apiClient.get<Task[]>(API_ROUTES.tasks(motorcycleId)).then((r) => r.data),
  create: (motorcycleId: string, params: CreateTaskParams) =>
    apiClient.post<Task>(API_ROUTES.tasks(motorcycleId), params).then((r) => r.data),
  update: (motorcycleId: string, taskId: string, params: UpdateTaskParams) =>
    apiClient.patch<Task>(API_ROUTES.task(motorcycleId, taskId), params).then((r) => r.data),
  complete: (motorcycleId: string, taskId: string, params: CompleteTaskParams) =>
    apiClient
      .post(API_ROUTES.completeTask(motorcycleId, taskId), params)
      .then((r) => r.data),
  delete: (motorcycleId: string, taskId: string) =>
    apiClient.delete(API_ROUTES.task(motorcycleId, taskId)),
};
