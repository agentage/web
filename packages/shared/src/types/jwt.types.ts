/**
 * JWT Types
 * Shared types for JWT token handling
 */

/**
 * JWT token payload structure
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

/**
 * Result of JWT token verification
 */
export interface JwtVerifyResult {
  valid: boolean;
  payload?: JwtPayload;
  error?: string;
  expired?: boolean;
}

/**
 * JWT service methods interface
 */
export interface JwtServiceMethods {
  /**
   * Generate a new JWT token
   * @param payload - The JWT payload
   * @param expiresIn - Optional custom expiration (e.g., '30d', '7d', '24h')
   */
  generateToken(payload: JwtPayload, expiresIn?: string): string;

  /**
   * Verify and decode a JWT token
   */
  verifyToken(token: string): JwtVerifyResult;

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): JwtPayload | null;
}
