import { apiClient } from '@/shared/api';
import { API_ROUTES } from '@/shared/config/constants';
import type { MaintenanceRecord, RecordListResponse, EditRecordParams } from './types';

export const recordApi = {
  list: (motorcycleId: string, taskId?: string, page = 1, limit = 20) => {
    const params: Record<string, string | number> = { page, limit };
    if (taskId) params.taskId = taskId;
    return apiClient
      .get<RecordListResponse>(API_ROUTES.records(motorcycleId), { params })
      .then((r) => r.data);
  },
  getById: (motorcycleId: string, recordId: string) =>
    apiClient
      .get<MaintenanceRecord>(API_ROUTES.record(motorcycleId, recordId))
      .then((r) => r.data),
  edit: (motorcycleId: string, recordId: string, params: EditRecordParams) =>
    apiClient
      .patch<MaintenanceRecord>(API_ROUTES.record(motorcycleId, recordId), params)
      .then((r) => r.data),
  delete: (motorcycleId: string, recordId: string) =>
    apiClient.delete(API_ROUTES.record(motorcycleId, recordId)),
};
