// errorHandler.ts — Central Express error-handling middleware; normalizes all thrown errors into consistent JSON responses.
import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { config } from '../config';

/**
 * Typed shape for errors thrown inside route handlers.
 * Extending Error lets us attach an HTTP status code at the throw site.
 */
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly errors?: unknown[]
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Central Express error-handling middleware.
 * @param err - The caught error instance
 * @param _req - Express Request (unused)
 * @param res - Express Response
 * @param _next - Express NextFunction (required for signature)
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const isDev = config.nodeEnv === 'development';

  if (isDev) {
    console.error('[ErrorHandler]', err);
  }

  // Our own typed errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
    return;
  }

  // Mongoose field validation failures (e.g. required, minlength, enum)
  if (err instanceof MongooseError.ValidationError) {
    const errors = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  // Mongoose bad ObjectId (e.g. /contacts/not-an-id)
  if (err instanceof MongooseError.CastError) {
    res.status(400).json({
      success: false,
      message: `Invalid value for field '${err.path}'`,
    });
    return;
  }

  // Unknown / unexpected errors
  res.status(500).json({
    success: false,
    message: isDev && err instanceof Error ? err.message : 'Internal server error',
  });
};
