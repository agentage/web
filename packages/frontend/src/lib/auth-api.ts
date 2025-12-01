/**
 * Authentication API client
 * Handles OAuth authentication flow with JWT tokens
 */

const getApiBaseUrl = () => {
  // Always use relative URLs in the browser to leverage Next.js rewrites
  return '/api';
};

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  verifiedAlias?: string; // Verified username/alias from OAuth provider
  role: 'user' | 'admin';
  providers: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  user?: {
    userId: string;
    email: string;
    role: 'user' | 'admin';
  };
}

export interface MeResponse {
  user: User;
  authenticated: boolean;
}

export interface ProvidersResponse {
  providers: Array<{
    name: string;
    email: string;
    connectedAt: string;
  }>;
}

/**
 * Get JWT token from localStorage
 */
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('agentage_token');
};

/**
 * Set JWT token in localStorage
 */
const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('agentage_token', token);
};

/**
 * Remove JWT token from localStorage
 */
const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('agentage_token');
};

export const authApi = {
  /**
   * Get current user authentication status
   */
  async getAuthStatus(): Promise<AuthStatusResponse> {
    try {
      const token = getToken();
      const headers: HeadersInit = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${getApiBaseUrl()}/auth/status`, {
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        return { authenticated: false };
      }

      return await response.json();
    } catch (error) {
      console.error('Auth status check failed:', error);
      return { authenticated: false };
    }
  },

  /**
   * Get current user details
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = getToken();

      if (!token) {
        return null;
      }

      const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        // Token invalid, remove it
        removeToken();
        return null;
      }

      const data: MeResponse = await response.json();
      return data.user;
    } catch (error) {
      console.error('Get user failed:', error);
      return null;
    }
  },

  /**
   * Initiate OAuth login
   */
  loginWithProvider(provider: 'google' | 'github' | 'microsoft') {
    window.location.href = `${getApiBaseUrl()}/auth/${provider}`;
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      const token = getToken();

      if (token) {
        await fetch(`${getApiBaseUrl()}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always remove token and redirect
      removeToken();
      window.location.href = '/';
    }
  },

  /**
   * Get user's connected OAuth providers
   */
  async getProviders(): Promise<ProvidersResponse['providers']> {
    try {
      const token = getToken();

      if (!token) {
        return [];
      }

      const response = await fetch(`${getApiBaseUrl()}/auth/providers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        return [];
      }

      const data: ProvidersResponse = await response.json();
      return data.providers;
    } catch (error) {
      console.error('Get providers failed:', error);
      return [];
    }
  },

  /**
   * Store JWT token from OAuth callback
   */
  storeToken(token: string): void {
    setToken(token);
  },

  /**
   * Check if user has a valid token
   */
  hasToken(): boolean {
    return !!getToken();
  },

  /**
   * Remove token
   */
  removeToken(): void {
    removeToken();
  },

  /**
   * Get token
   */
  getToken(): string | null {
    return getToken();
  },
};
