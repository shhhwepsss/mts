import { apiClient } from '@/shared/api';
import { API_ROUTES } from '@/shared/config/constants';
import type { User } from './types';

export const userApi = {
  getProfile: () => apiClient.get<User>(API_ROUTES.USERS_ME).then((r) => r.data),
  updateProfile: (name: string) =>
    apiClient.patch<User>(API_ROUTES.USERS_ME, { name }).then((r) => r.data),
};
