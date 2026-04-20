import { apiClient, safeParseApi } from '@/shared/api';
import { API_ROUTES } from '@/shared/const/api-routes';
import { TaskSchema, TaskListSchema } from './schema/task.schema';
import type {
  Task,
  CreateTaskParams,
  UpdateTaskParams,
  CompleteTaskParams,
} from './model/task.model';

export const taskApi = {
  listByMotorcycle: async (motorcycleId: string): Promise<Task[]> => {
    const { data } = await apiClient.get(API_ROUTES.tasks(motorcycleId));
    return safeParseApi(TaskListSchema, data, 'taskApi.listByMotorcycle');
  },
  create: async (motorcycleId: string, params: CreateTaskParams): Promise<Task> => {
    const { data } = await apiClient.post(API_ROUTES.tasks(motorcycleId), params);
    return safeParseApi(TaskSchema, data, 'taskApi.create');
  },
  update: async (motorcycleId: string, taskId: string, params: UpdateTaskParams): Promise<Task> => {
    const { data } = await apiClient.patch(API_ROUTES.task(motorcycleId, taskId), params);
    return safeParseApi(TaskSchema, data, 'taskApi.update');
  },
  complete: (motorcycleId: string, taskId: string, params: CompleteTaskParams) =>
    apiClient
      .post(API_ROUTES.completeTask(motorcycleId, taskId), params)
      .then((r) => r.data),
  delete: (motorcycleId: string, taskId: string) =>
    apiClient.delete(API_ROUTES.task(motorcycleId, taskId)),
};
