/**
 * Express.js type augmentation for authentication
 * Extends the Request interface to include user information
 */

import { ObjectId } from 'mongodb';

declare global {
  namespace Express {
    interface User {
      // JWT fields (for stateless auth)
      userId?: string;
      isAuthenticated?: boolean;

      // OAuth/Database fields (populated from OAuth callback)
      id?: string;
      _id?: ObjectId | string;
      email: string;
      displayName?: string;
      avatar?: string;

      // Provider information
      providers?: {
        github?: {
          id: string;
          email: string;
          connectedAt?: Date;
        };
        google?: {
          id: string;
          email: string;
          connectedAt?: Date;
        };
        microsoft?: {
          id: string;
          email: string;
          connectedAt?: Date;
        };
      };

      // Authorization
      role: 'user' | 'admin';

      // Timestamps
      createdAt?: Date;
      updatedAt?: Date;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
