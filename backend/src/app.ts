import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { logger } from './middleware/logger';
import { errorHandler, AppError } from './middleware/errorHandler';
import { healthRoutes } from './modules/health/health.routes';

export function createApp(): Express {
  const app = express();

  // Security & standard middlewares
  app.use(helmet());
  app.use(cors({
    origin: env.CORS_ORIGINS.split(','),
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP Request Logging Middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
      });
    });
    next();
  });

  // Base API v1 Routes
  const apiV1Router = express.Router();
  apiV1Router.use('/health', healthRoutes);

  app.use(env.API_PREFIX, apiV1Router);

  // 404 Handler
  app.use('*', (req) => {
    throw new AppError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
