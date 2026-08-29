import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { logger } from './middleware/logger';
import { errorHandler, AppError } from './middleware/errorHandler';
import { healthRoutes } from './modules/health/health.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { patientRoutes } from './modules/patients/patients.routes';
import { encounterRoutes } from './modules/encounters/encounters.routes';
import { consentRoutes } from './modules/consent/consent.routes';
import { sessionRoutes } from './modules/sessions/sessions.routes';
import { questionRoutes } from './modules/questions/questions.routes';
import { safetyRoutes } from './modules/safety/safety.routes';

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
  apiV1Router.use('/auth', authRoutes);
  apiV1Router.use('/patients', patientRoutes);
  apiV1Router.use('/encounters', encounterRoutes);
  apiV1Router.use('/consents', consentRoutes);
  apiV1Router.use('/sessions', sessionRoutes);
  apiV1Router.use('/questions', questionRoutes);
  apiV1Router.use('/alerts', safetyRoutes);

  app.use(env.API_PREFIX, apiV1Router);

  // 404 Handler
  app.use('*', (req) => {
    throw new AppError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
