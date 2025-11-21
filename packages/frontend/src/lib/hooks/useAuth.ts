'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authApi, type User } from '../auth-api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    checkAuthStatus();

    // Listen for auth token changes (e.g., after OAuth callback)
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('auth-token-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-token-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Refresh auth status when pathname changes (e.g., after redirect from callback)
  useEffect(() => {
    if (pathname === '/' && authApi.hasToken()) {
      checkAuthStatus();
    }
  }, [pathname]);

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
    isMounted,
    login,
    logout,
    refresh: checkAuthStatus,
  };
}
