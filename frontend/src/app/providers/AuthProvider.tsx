import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { userApi, type User } from '@/entities/user';
import { apiClient, getAccessToken, clearTokens, setTokens } from '@/shared/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (googleToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      userApi
        .getProfile()
        .then(setUser)
        .catch(() => clearTokens())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (googleToken: string) => {
    const { data } = await apiClient.post('/auth/google', { token: googleToken });
    setTokens(data.accessToken, data.refreshToken);
    const profile = await userApi.getProfile();
    setUser(profile);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
