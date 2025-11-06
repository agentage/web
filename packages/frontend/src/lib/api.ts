import type { SystemStatus } from '@agentage/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const fetchSystemStatus = async (): Promise<SystemStatus> => {
  try {
    const res = await fetch(`${API_URL}/api/status`, {
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
