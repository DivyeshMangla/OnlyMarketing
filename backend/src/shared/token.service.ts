// token.service.ts — Service for signing and verifying JSON Web Tokens.
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

/**
 * All JWT operations are centralised here.
 */

export interface TokenPayload {
  id: string;
}

/**
 * Signs a JWT for the given user ID.
 * @param userId - MongoDB ID of the user
 * @returns Signed JWT string
 */
export function signToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(
    { id: userId } satisfies TokenPayload,
    config.jwtSecret,
    options
  );
}

/**
 * Verifies and decodes a JWT string.
 * @param token - JWT to verify
 * @returns Decoded payload
 */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
}
