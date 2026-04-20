import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi, type User } from '@/entities/user';
import { apiClient, clearTokens, getAccessToken, setTokens } from '@/shared/api';
import { CURRENT_USER_QUERY_KEY } from './const/query-keys';

async function fetchCurrentUser(): Promise<User | null> {
  if (!getAccessToken()) return null;
  try {
    return await userApi.getProfile();
  } catch {
    clearTokens();
    return null;
  }
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<User | null>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: fetchCurrentUser,
    staleTime: Infinity,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (googleToken: string): Promise<User> => {
      const res = await apiClient.post('/auth/google', { token: googleToken });
      setTokens(res.data.accessToken, res.data.refreshToken);
      return userApi.getProfile();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user);
    },
  });

  const logout = () => {
    clearTokens();
    queryClient.clear();
  };

  return {
    user: data ?? null,
    isAuthenticated: !!data,
    isLoading,
    login: (googleToken: string) => loginMutation.mutateAsync(googleToken),
    logout,
  };
}
