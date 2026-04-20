import { apiClient } from '@/shared/api';
import { API_ROUTES } from '@/shared/config/constants';
import type { Motorcycle, CreateMotorcycleParams, UpdateMotorcycleParams } from './types';

export const motorcycleApi = {
  list: () => apiClient.get<Motorcycle[]>(API_ROUTES.MOTORCYCLES).then((r) => r.data),
  getById: (id: string) =>
    apiClient.get<Motorcycle>(API_ROUTES.motorcycle(id)).then((r) => r.data),
  create: (params: CreateMotorcycleParams) =>
    apiClient.post<Motorcycle>(API_ROUTES.MOTORCYCLES, params).then((r) => r.data),
  update: (id: string, params: UpdateMotorcycleParams) =>
    apiClient.patch<Motorcycle>(API_ROUTES.motorcycle(id), params).then((r) => r.data),
  updateHours: (id: string, currentHours: number) =>
    apiClient.patch(API_ROUTES.motorcycleHours(id), { currentHours }).then((r) => r.data),
  delete: (id: string) => apiClient.delete(API_ROUTES.motorcycle(id)),
};
