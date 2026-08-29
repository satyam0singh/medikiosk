import { Request, Response, NextFunction } from 'express';
import { checkDatabaseHealth } from '../../database/postgres';
import { checkRedisHealth } from '../../storage/redis';
import { checkStorageHealth } from '../../storage/minio';
import { ApiResponse, SystemHealthReport } from '@medikiosk/shared-types';
import { env } from '../../config/env';

export class HealthController {
  public static async getSystemHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [dbHealth, redisHealth, storageHealth] = await Promise.all([
        checkDatabaseHealth(),
        checkRedisHealth(),
        checkStorageHealth(),
      ]);

      const isUnhealthy = dbHealth.status === 'DOWN' || redisHealth.status === 'DOWN' || storageHealth.status === 'DOWN';
      const isDegraded = dbHealth.status === 'DEGRADED' || redisHealth.status === 'DEGRADED' || storageHealth.status === 'DEGRADED';

      const overallStatus = isUnhealthy ? 'UNHEALTHY' : isDegraded ? 'DEGRADED' : 'HEALTHY';

      const report: SystemHealthReport = {
        status: overallStatus,
        version: '0.1.0',
        environment: env.NODE_ENV,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        dependencies: {
          database: dbHealth,
          redis: redisHealth,
          storage: storageHealth,
        },
      };

      const response: ApiResponse<SystemHealthReport> = {
        success: overallStatus !== 'UNHEALTHY',
        data: report,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      };

      res.status(overallStatus === 'UNHEALTHY' ? 503 : 200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public static async getDatabaseHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dbHealth = await checkDatabaseHealth();
      const response: ApiResponse = {
        success: dbHealth.status !== 'DOWN',
        data: dbHealth,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      };
      res.status(dbHealth.status === 'DOWN' ? 503 : 200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public static async getRedisHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const redisHealth = await checkRedisHealth();
      const response: ApiResponse = {
        success: redisHealth.status !== 'DOWN',
        data: redisHealth,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      };
      res.status(redisHealth.status === 'DOWN' ? 503 : 200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public static async getStorageHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storageHealth = await checkStorageHealth();
      const response: ApiResponse = {
        success: storageHealth.status !== 'DOWN',
        data: storageHealth,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      };
      res.status(storageHealth.status === 'DOWN' ? 503 : 200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
