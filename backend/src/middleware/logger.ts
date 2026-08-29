import winston from 'winston';
import { env } from '../config/env';

// Fields that might contain PHI or secrets to mask in logs
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'jwt',
  'authorization',
  'secret',
  'apikey',
  'contactnumber',
  'abhaid',
  'phonenumber',
]);

function maskSensitiveData(obj: unknown, depth = 0): unknown {
  if (depth > 5 || obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => maskSensitiveData(item, depth + 1));
  }

  if (typeof obj === 'object') {
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey)) {
        masked[key] = '[REDACTED_PHI_OR_SECRET]';
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = maskSensitiveData(value, depth + 1);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  }

  return obj;
}

const phiMaskFormat = winston.format((info) => {
  if (env.ENABLE_PHI_MASKING) {
    return maskSensitiveData(info) as winston.Logform.TransformableInfo;
  }
  return info;
});

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    phiMaskFormat(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'medikiosk-backend' },
  transports: [
    new winston.transports.Console({
      format: env.NODE_ENV === 'development'
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, service, ...rest }) => {
              const metaStr = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : '';
              return `[${timestamp}] [${service}] ${level}: ${message}${metaStr}`;
            })
          )
        : winston.format.json(),
    }),
  ],
});
