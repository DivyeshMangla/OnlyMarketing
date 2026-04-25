// auth.middleware.ts — Express middleware; validates JWTs and attaches the user document to the request.
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './token.service';
import { findUserById } from '../features/auth/auth.service';
import { sendError } from './response';
import { IUser } from '../features/auth/auth.types';

/**
 * Express type augmentation: adds `user` to the Request object so all
 * downstream handlers that follow authMiddleware get full type safety.
 */
declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

/**
 * Validates the Authorization header, verifies the JWT, and loads the user.
 * @param req - Express Request
 * @param res - Express Response
 * @param next - Express NextFunction
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : undefined;

  if (!token) {
    sendError(res, 'No token provided — authorization denied', 401);
    return;
  }

  try {
    const payload = verifyToken(token);
    const user = await findUserById(payload.id);

    if (!user) {
      sendError(res, 'User associated with this token no longer exists', 401);
      return;
    }

    req.user = user;
    next();
  } catch {
    sendError(res, 'Token is invalid or has expired', 401);
  }
};
