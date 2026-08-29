import request from 'supertest';
import { createApp } from '../src/app';
import * as postgresModule from '../src/database/postgres';
import * as redisModule from '../src/storage/redis';
import * as minioModule from '../src/storage/minio';

describe('Health Check API Endpoints', () => {
  const app = createApp();

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('GET /api/v1/health should return HEALTHY when all dependencies are UP', async () => {
    jest.spyOn(postgresModule, 'checkDatabaseHealth').mockResolvedValue({
      status: 'UP',
      latencyMs: 3,
      message: 'PostgreSQL database is connected and responsive',
    });

    jest.spyOn(redisModule, 'checkRedisHealth').mockResolvedValue({
      status: 'UP',
      latencyMs: 1,
      message: 'Redis ephemeral session store is responsive',
    });

    jest.spyOn(minioModule, 'checkStorageHealth').mockResolvedValue({
      status: 'UP',
      latencyMs: 5,
      message: 'MinIO object storage is online and accessible',
    });

    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('HEALTHY');
    expect(res.body.data.dependencies.database.status).toBe('UP');
    expect(res.body.data.dependencies.redis.status).toBe('UP');
    expect(res.body.data.dependencies.storage.status).toBe('UP');
  });

  it('GET /api/v1/health/database should return 200 when database is healthy', async () => {
    jest.spyOn(postgresModule, 'checkDatabaseHealth').mockResolvedValue({
      status: 'UP',
      latencyMs: 2,
      message: 'Database OK',
    });

    const res = await request(app).get('/api/v1/health/database');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
  });

  it('GET /api/v1/health/redis should return 200 when redis is healthy', async () => {
    jest.spyOn(redisModule, 'checkRedisHealth').mockResolvedValue({
      status: 'UP',
      latencyMs: 1,
      message: 'Redis OK',
    });

    const res = await request(app).get('/api/v1/health/redis');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
  });

  it('GET /api/v1/health/storage should return 200 when minio is healthy', async () => {
    jest.spyOn(minioModule, 'checkStorageHealth').mockResolvedValue({
      status: 'UP',
      latencyMs: 4,
      message: 'MinIO OK',
    });

    const res = await request(app).get('/api/v1/health/storage');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
  });

  it('GET /api/v1/health should return 503 UNHEALTHY when any dependency is DOWN', async () => {
    jest.spyOn(postgresModule, 'checkDatabaseHealth').mockResolvedValue({
      status: 'DOWN',
      latencyMs: 10,
      message: 'Database connection failed',
    });

    jest.spyOn(redisModule, 'checkRedisHealth').mockResolvedValue({
      status: 'UP',
      latencyMs: 1,
      message: 'Redis OK',
    });

    jest.spyOn(minioModule, 'checkStorageHealth').mockResolvedValue({
      status: 'UP',
      latencyMs: 2,
      message: 'MinIO OK',
    });

    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.data.status).toBe('UNHEALTHY');
    expect(res.body.data.dependencies.database.status).toBe('DOWN');
  });
});
