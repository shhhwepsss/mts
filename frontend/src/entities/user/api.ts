import { apiClient, safeParseApi } from '@/shared/api';
import { API_ROUTES } from '@/shared/const/api-routes';
import { UserSchema } from './schema/user.schema';
import type { User, UserLanguage } from './model/user.model';

export interface UpdateProfileInput {
  name?: string;
  language?: UserLanguage;
}

export const userApi = {
  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get(API_ROUTES.USERS_ME);
    return safeParseApi(UserSchema, data, 'userApi.getProfile');
  },
  updateProfile: async (input: UpdateProfileInput): Promise<User> => {
    const { data } = await apiClient.patch(API_ROUTES.USERS_ME, input);
    return safeParseApi(UserSchema, data, 'userApi.updateProfile');
  },
};
