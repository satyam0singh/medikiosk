import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from '../middleware/logger';
import { DependencyHealthStatus } from '@medikiosk/shared-types';

export const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  db: env.REDIS_DB,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis ephemeral storage');
});

redisClient.on('error', (err) => {
  logger.warn('Redis client error (will retry or fallback to degraded mode)', { error: err.message });
});

export async function checkRedisHealth(): Promise<DependencyHealthStatus> {
  const start = Date.now();
  try {
    if (redisClient.status !== 'ready' && redisClient.status !== 'connecting') {
      await redisClient.connect();
    }
    const pong = await redisClient.ping();
    const latencyMs = Date.now() - start;

    if (pong === 'PONG') {
      return {
        status: 'UP',
        latencyMs,
        message: 'Redis ephemeral session store is responsive',
        details: {
          status: redisClient.status,
        },
      };
    }

    return {
      status: 'DEGRADED',
      latencyMs,
      message: `Unexpected ping response: ${pong}`,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    return {
      status: 'DOWN',
      latencyMs,
      message: `Redis connection failed: ${(error as Error).message}`,
    };
  }
}

export async function setSessionState(sessionId: string, state: unknown, ttlSeconds = env.SESSION_TTL_SECONDS): Promise<void> {
  try {
    const key = `session:${sessionId}`;
    await redisClient.setex(key, ttlSeconds, JSON.stringify(state));
  } catch (error) {
    logger.error('Failed to save session state in Redis', { sessionId, error: (error as Error).message });
  }
}

export async function getSessionState<T>(sessionId: string): Promise<T | null> {
  try {
    const key = `session:${sessionId}`;
    const raw = await redisClient.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    logger.error('Failed to read session state from Redis', { sessionId, error: (error as Error).message });
    return null;
  }
}

export async function deleteSessionState(sessionId: string): Promise<void> {
  try {
    const key = `session:${sessionId}`;
    await redisClient.del(key);
  } catch (error) {
    logger.error('Failed to delete session state from Redis', { sessionId, error: (error as Error).message });
  }
}
