/**
 * Device Authorization Types
 * Types for OAuth 2.0 Device Authorization Grant (RFC 8628)
 */

import { z } from 'zod';

/**
 * Device code document structure in MongoDB
 */
export interface DeviceCodeDocument {
  _id?: string;
  deviceCode: string; // Unique server-side identifier
  userCode: string; // User-facing code (e.g., "ABCD-1234")
  provider: 'github'; // OAuth provider (github only for now)
  expiresAt: Date; // TTL for cleanup
  authorizedAt?: Date; // Set when user completes OAuth
  userId?: string; // Set when user completes OAuth
  accessToken?: string; // Generated token for CLI
  createdAt: Date;
}

/**
 * Request to initiate device authorization
 */
export const deviceCodeRequestSchema = z.object({
  provider: z.enum(['github']).optional().default('github'),
});

export type DeviceCodeRequest = z.infer<typeof deviceCodeRequestSchema>;

/**
 * Response from POST /api/auth/device/code
 */
export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
}

/**
 * Request to poll for token
 */
export const deviceTokenRequestSchema = z.object({
  device_code: z.string().min(1),
});

export type DeviceTokenRequest = z.infer<typeof deviceTokenRequestSchema>;

/**
 * Successful token response
 */
export interface DeviceTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
}

/**
 * Error response for device auth
 */
export interface DeviceAuthError {
  error:
    | 'authorization_pending'
    | 'slow_down'
    | 'access_denied'
    | 'expired_token'
    | 'invalid_grant'
    | 'invalid_request'
    | 'server_error';
  error_description: string;
}

/**
 * User code format: XXXX-XXXX (8 alphanumeric characters with hyphen)
 */
export const USER_CODE_LENGTH = 8;
export const USER_CODE_PATTERN = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/**
 * Default configuration values
 */
export const DEVICE_CODE_DEFAULTS = {
  EXPIRES_IN_SECONDS: 900, // 15 minutes
  POLLING_INTERVAL_SECONDS: 5,
} as const;
