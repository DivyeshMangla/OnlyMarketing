// response.ts — Utility functions for sending consistent JSON responses across the application.
import { Response } from 'express';

/**
 * Standardised success response helper.
 * @param res - Express Response
 * @param data - Payload to send
 * @param message - Optional success message
 * @param statusCode - HTTP status code (default 200)
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): void {
  res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    data,
  });
}

/**
 * Standardised error response helper.
 * @param res - Express Response
 * @param message - Error message
 * @param statusCode - HTTP status code (default 500)
 * @param errors - Optional array of validation errors
 */
export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown[]
): void {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
}
