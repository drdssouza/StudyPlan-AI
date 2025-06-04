import { useState, useEffect } from 'react';
import { authService, AuthResult } from '@/services/auth';
import { User } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const result = await authService.getCurrentUser();
    if (result.success) {
      setUser(result.user);
    }
    setLoading(false);
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const result = await authService.signIn(email, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const register = async (email: string, password: string, name: string): Promise<AuthResult> => {
    const result = await authService.signUp(email, password, name);
    return result;
  };

  const logout = async (): Promise<AuthResult> => {
    const result = await authService.signOut();
    if (result.success) {
      setUser(null);
    }
    return result;
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    checkAuthStatus
  };
};