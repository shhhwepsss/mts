import { apiClient, safeParseApi } from '@/shared/api';
import { API_ROUTES } from '@/shared/const/api-routes';
import {
  MaintenanceRecordSchema,
  RecordListResponseSchema,
} from './schema/record.schema';
import type {
  MaintenanceRecord,
  RecordListResponse,
  EditRecordParams,
} from './model/record.model';

export const recordApi = {
  list: async (
    motorcycleId: string,
    taskId?: string,
    page = 1,
    limit = 20,
  ): Promise<RecordListResponse> => {
    const params: Record<string, string | number> = { page, limit };
    if (taskId) params.taskId = taskId;
    const { data } = await apiClient.get(API_ROUTES.records(motorcycleId), { params });
    return safeParseApi(RecordListResponseSchema, data, 'recordApi.list');
  },
  getById: async (motorcycleId: string, recordId: string): Promise<MaintenanceRecord> => {
    const { data } = await apiClient.get(API_ROUTES.record(motorcycleId, recordId));
    return safeParseApi(MaintenanceRecordSchema, data, 'recordApi.getById');
  },
  edit: async (
    motorcycleId: string,
    recordId: string,
    params: EditRecordParams,
  ): Promise<MaintenanceRecord> => {
    const { data } = await apiClient.patch(API_ROUTES.record(motorcycleId, recordId), params);
    return safeParseApi(MaintenanceRecordSchema, data, 'recordApi.edit');
  },
  delete: (motorcycleId: string, recordId: string) =>
    apiClient.delete(API_ROUTES.record(motorcycleId, recordId)),
};
