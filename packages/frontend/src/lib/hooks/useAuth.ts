'use client';

import { useEffect, useState } from 'react';
import { authApi, type User } from '../auth-api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      const currentUser = await authApi.getCurrentUser();
      setIsAuthenticated(!!currentUser);
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  function login(provider: 'google' | 'github' | 'microsoft') {
    authApi.loginWithProvider(provider);
  }

  async function logout() {
    await authApi.logout();
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refresh: checkAuthStatus,
  };
}
