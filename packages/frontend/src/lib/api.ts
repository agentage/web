import type { SystemStatus } from '@agentage/shared';

// For server-side rendering, we need absolute URLs
// For client-side, relative URLs work fine
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side: use BACKEND_API_URL for direct backend communication
    const backendUrl =
      process.env.BACKEND_URL || process.env.BACKEND_API_URL || 'http://localhost:3001';
    return backendUrl;
  }
  // Client-side: use NEXT_PUBLIC_API_URL (can be relative or absolute)
  return process.env.NEXT_PUBLIC_API_URL || '/api';
};

export const fetchSystemStatus = async (): Promise<SystemStatus> => {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/status`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch status: ${res.status}`);
    }

    const backend = await res.json();

    return {
      backend,
      environment: process.env.NODE_ENV || 'development',
    };
  } catch (error) {
    console.error('Error fetching system status:', error);
    throw error;
  }
};
