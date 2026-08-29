import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load root or local .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:3001,http://localhost:5173'),

  // PostgreSQL
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().default('medikiosk_db'),
  DB_USER: z.string().default('medikiosk_user'),
  DB_PASSWORD: z.string().default('medikiosk_password'),
  DB_POOL_MIN: z.coerce.number().default(2),
  DB_POOL_MAX: z.coerce.number().default(20),
  DB_IDLE_TIMEOUT_MS: z.coerce.number().default(30000),
  DATABASE_URL: z.string().optional(),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),
  REDIS_DB: z.coerce.number().default(0),
  REDIS_URL: z.string().optional(),
  SESSION_TTL_SECONDS: z.coerce.number().default(86400),

  // MinIO
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_USE_SSL: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  MINIO_ACCESS_KEY: z.string().default('medikiosk_minio_admin'),
  MINIO_SECRET_KEY: z.string().default('medikiosk_minio_secret_key'),
  MINIO_BUCKET_DOCUMENTS: z.string().default('medikiosk-documents'),
  MINIO_BUCKET_AUDIO: z.string().default('medikiosk-audio'),

  // JWT
  JWT_SECRET: z.string().default('super_secret_jwt_dev_key_change_in_production_min_32_bytes_long'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_SECRET: z.string().default('super_secret_refresh_key_change_in_production_32_bytes'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),

  // AI Providers
  ASR_PROVIDER: z.string().default('mock'),
  TTS_PROVIDER: z.string().default('mock'),
  OCR_PROVIDER: z.string().default('mock'),
  LLM_PROVIDER: z.string().default('mock'),
  NER_PROVIDER: z.string().default('mock'),

  // Logging & Safety
  LOG_LEVEL: z.string().default('info'),
  ENABLE_PHI_MASKING: z.preprocess((val) => val === 'true' || val === true || val === undefined, z.boolean()).default(true),
  AUDIT_LOG_ENABLED: z.preprocess((val) => val === 'true' || val === true || val === undefined, z.boolean()).default(true),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

function parseEnv(): EnvConfig {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Environment configuration validation failed:', result.error.format());
    throw new Error('Invalid environment configuration');
  }
  return result.data;
}

export const env = parseEnv();
