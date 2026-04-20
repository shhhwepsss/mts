import { apiClient, safeParseApi } from '@/shared/api';
import { API_ROUTES } from '@/shared/const/api-routes';
import {
  MotorcycleSchema,
  MotorcycleListSchema,
} from './schema/motorcycle.schema';
import type {
  Motorcycle,
  CreateMotorcycleParams,
  UpdateMotorcycleParams,
} from './model/motorcycle.model';

export const motorcycleApi = {
  list: async (): Promise<Motorcycle[]> => {
    const { data } = await apiClient.get(API_ROUTES.MOTORCYCLES);
    return safeParseApi(MotorcycleListSchema, data, 'motorcycleApi.list');
  },
  getById: async (id: string): Promise<Motorcycle> => {
    const { data } = await apiClient.get(API_ROUTES.motorcycle(id));
    return safeParseApi(MotorcycleSchema, data, 'motorcycleApi.getById');
  },
  create: async (params: CreateMotorcycleParams): Promise<Motorcycle> => {
    const { data } = await apiClient.post(API_ROUTES.MOTORCYCLES, params);
    return safeParseApi(MotorcycleSchema, data, 'motorcycleApi.create');
  },
  update: async (id: string, params: UpdateMotorcycleParams): Promise<Motorcycle> => {
    const { data } = await apiClient.patch(API_ROUTES.motorcycle(id), params);
    return safeParseApi(MotorcycleSchema, data, 'motorcycleApi.update');
  },
  updateHours: (id: string, currentHours: number) =>
    apiClient.patch(API_ROUTES.motorcycleHours(id), { currentHours }).then((r) => r.data),
  delete: (id: string) => apiClient.delete(API_ROUTES.motorcycle(id)),
};
