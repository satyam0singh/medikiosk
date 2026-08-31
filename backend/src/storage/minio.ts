import * as Minio from 'minio';
import { env } from '../config/env';
import { logger } from '../middleware/logger';
import { DependencyHealthStatus } from '@medikiosk/shared-types';

export const minioClient = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT && env.MINIO_PORT !== 9000 ? env.MINIO_PORT : env.MINIO_USE_SSL ? 443 : env.MINIO_PORT || 9000,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

export async function initializeMinioBuckets(): Promise<void> {
  const buckets = [env.MINIO_BUCKET_DOCUMENTS, env.MINIO_BUCKET_AUDIO];

  for (const bucket of buckets) {
    try {
      const exists = await minioClient.bucketExists(bucket);
      if (!exists) {
        await minioClient.makeBucket(bucket, 'us-east-1');
        logger.info(`Created MinIO bucket: ${bucket}`);
      } else {
        logger.debug(`MinIO bucket already exists: ${bucket}`);
      }
    } catch (error) {
      logger.warn(`Could not verify/create MinIO bucket ${bucket}`, { error: (error as Error).message });
    }
  }
}

export async function checkStorageHealth(): Promise<DependencyHealthStatus> {
  const start = Date.now();
  try {
    const buckets = await minioClient.listBuckets();
    const latencyMs = Date.now() - start;
    const bucketNames = buckets.map(b => b.name);

    return {
      status: 'UP',
      latencyMs,
      message: 'MinIO object storage is online and accessible',
      details: {
        buckets: bucketNames,
        documentsBucketReady: bucketNames.includes(env.MINIO_BUCKET_DOCUMENTS),
        audioBucketReady: bucketNames.includes(env.MINIO_BUCKET_AUDIO),
      },
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    return {
      status: 'DOWN',
      latencyMs,
      message: `MinIO storage connection failed: ${(error as Error).message}`,
    };
  }
}

export async function uploadDocument(
  bucket: string,
  objectKey: string,
  buffer: Buffer,
  metaData: Record<string, string> = {}
): Promise<string> {
  await minioClient.putObject(bucket, objectKey, buffer, buffer.length, metaData);
  return objectKey;
}

export async function getPresignedDownloadUrl(
  bucket: string,
  objectKey: string,
  expirySeconds = 3600
): Promise<string> {
  return await minioClient.presignedGetObject(bucket, objectKey, expirySeconds);
}
