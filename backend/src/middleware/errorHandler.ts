import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '@medikiosk/shared-types';
import { logger } from './logger';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const timestamp = new Date().toISOString();

  // 1. Handle Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));

    logger.warn('Validation error on request', {
      url: req.originalUrl,
      method: req.method,
      errors: formattedErrors,
    });

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request payload validation failed',
        details: formattedErrors,
      },
      meta: {
        timestamp,
        version: 'v1',
      },
    };

    res.status(400).json(response);
    return;
  }

  // 2. Handle Custom Operational AppError
  if (err instanceof AppError) {
    logger.warn(`Operational AppError: ${err.message}`, {
      code: err.code,
      statusCode: err.statusCode,
      url: req.originalUrl,
      method: req.method,
    });

    const response: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      meta: {
        timestamp,
        version: 'v1',
      },
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // 3. Handle Unexpected Server Error
  logger.error(`Unhandled error: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected internal error occurred',
      details: err.stack,
    },
    meta: {
      timestamp,
      version: 'v1',
    },
  };

  res.status(500).json(response);
}
