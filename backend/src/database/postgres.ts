import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { logger } from '../middleware/logger';
import { DependencyHealthStatus } from '@medikiosk/shared-types';

export const dbPool = env.DATABASE_URL
  ? new Pool({
      connectionString: env.DATABASE_URL,
      ssl:
        env.DATABASE_URL.includes('localhost') || env.DATABASE_URL.includes('127.0.0.1')
          ? false
          : { rejectUnauthorized: false },
      min: env.DB_POOL_MIN,
      max: env.DB_POOL_MAX,
      idleTimeoutMillis: env.DB_IDLE_TIMEOUT_MS,
      connectionTimeoutMillis: 10000,
    })
  : new Pool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      min: env.DB_POOL_MIN,
      max: env.DB_POOL_MAX,
      idleTimeoutMillis: env.DB_IDLE_TIMEOUT_MS,
      connectionTimeoutMillis: 10000,
    });

dbPool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client pool', { error: err.message });
});

export async function query<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<R>> {
  const start = Date.now();
  try {
    const res = await dbPool.query<R>(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed DB Query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('DB Query execution error', { text, error: (error as Error).message });
    throw error;
  }
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await dbPool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back due to error', { error: (error as Error).message });
    throw error;
  } finally {
    client.release();
  }
}

export async function checkDatabaseHealth(): Promise<DependencyHealthStatus> {
  const start = Date.now();
  try {
    const result = await dbPool.query('SELECT 1 as health_check, current_database() as db_name, version() as version');
    const latencyMs = Date.now() - start;
    return {
      status: 'UP',
      latencyMs,
      message: 'PostgreSQL database is connected and responsive',
      details: {
        database: result.rows[0]?.db_name,
        poolTotal: dbPool.totalCount,
        poolIdle: dbPool.idleCount,
        poolWaiting: dbPool.waitingCount,
      },
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    return {
      status: 'DOWN',
      latencyMs,
      message: `Database connection failed: ${(error as Error).message}`,
    };
  }
}

export async function runMigrations(): Promise<void> {
  logger.info('Starting database migration checks...');
  let migrationsDir = path.resolve(__dirname, '../../../infrastructure/postgres/migrations');
  let seedsDir = path.resolve(__dirname, '../../../infrastructure/postgres/seeds');

  if (!fs.existsSync(migrationsDir)) {
    migrationsDir = path.resolve(process.cwd(), 'infrastructure/postgres/migrations');
    seedsDir = path.resolve(process.cwd(), 'infrastructure/postgres/seeds');
  }
  if (!fs.existsSync(migrationsDir)) {
    migrationsDir = path.resolve(__dirname, '../../infrastructure/postgres/migrations');
    seedsDir = path.resolve(__dirname, '../../infrastructure/postgres/seeds');
  }

  try {
    // 1. Check if migrations directory exists
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
      for (const file of files) {
        logger.info(`Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        await query(sql);
      }
      logger.info('Database migrations applied successfully');
    }

    // 2. Check if seed is needed
    const usersCount = await query('SELECT count(*) as count FROM users');
    if (parseInt(usersCount.rows[0]?.count || '0', 10) === 0 && fs.existsSync(seedsDir)) {
      const seedFiles = fs.readdirSync(seedsDir).filter(f => f.endsWith('.sql')).sort();
      for (const file of seedFiles) {
        logger.info(`Running seed data: ${file}`);
        const sql = fs.readFileSync(path.join(seedsDir, file), 'utf-8');
        await query(sql);
      }
      logger.info('Synthetic clinical seed applied successfully');
    }
  } catch (error) {
    logger.error('Error executing database migrations/seeds', { error: (error as Error).message });
    throw error;
  }
}
