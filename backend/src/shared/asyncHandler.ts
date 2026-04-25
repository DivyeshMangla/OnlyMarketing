// asyncHandler.ts — Higher-order function; wraps async route handlers to ensure errors are caught and passed to Express's next().
import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an asynchronous function to capture rejections and pass them to error middleware.
 * @param fn - Asynchronous RequestHandler
 * @returns Standard Express RequestHandler
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
