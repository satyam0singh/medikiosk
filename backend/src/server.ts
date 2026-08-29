import { createApp } from './app';
import { env } from './config/env';
import { logger } from './middleware/logger';
import { dbPool, runMigrations } from './database/postgres';
import { redisClient } from './storage/redis';
import { initializeMinioBuckets } from './storage/minio';

async function bootstrap() {
  logger.info(`Starting MediKiosk Backend Service (Environment: ${env.NODE_ENV})...`);

  // 1. Initialize MinIO Buckets
  try {
    await initializeMinioBuckets();
  } catch (error) {
    logger.warn('Storage bucket initialization deferred (MinIO might start asynchronously)', {
      error: (error as Error).message,
    });
  }

  // 2. Connect Redis
  try {
    if (redisClient.status !== 'ready' && redisClient.status !== 'connecting') {
      await redisClient.connect();
    }
  } catch (error) {
    logger.warn('Redis initial connection deferred (will retry automatically)', {
      error: (error as Error).message,
    });
  }

  // 3. Database Migration Runner (In local development/demo)
  try {
    await runMigrations();
  } catch (error) {
    logger.warn('Database auto-migration deferred (Postgres may start asynchronously)', {
      error: (error as Error).message,
    });
  }

  // 4. Start HTTP Express Server
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 MediKiosk API Server running on port ${env.PORT}`);
    logger.info(`👉 Health check: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      try {
        await dbPool.end();
        await redisClient.quit();
        logger.info('Closed DB pool and Redis connections. Exiting process.');
        process.exit(0);
      } catch (err) {
        logger.error('Error during graceful shutdown', { error: (err as Error).message });
        process.exit(1);
      }
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

if (require.main === module) {
  bootstrap().catch((err) => {
    logger.error('Fatal bootstrap error', { error: err.message, stack: err.stack });
    process.exit(1);
  });
}
