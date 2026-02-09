import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    logger.warn('Validation error', {
      path: req.path,
      errors: err.errors
    });

    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
    return;
  }

  // Application errors
  if (err instanceof AppError) {
    logger.warn('Application error', {
      path: req.path,
      message: err.message,
      statusCode: err.statusCode
    });

    res.status(err.statusCode).json({
      error: err.message
    });
    return;
  }

  // Unknown errors
  logger.error('Unexpected error', {
    path: req.path,
    error: err.message,
    stack: err.stack
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
}
