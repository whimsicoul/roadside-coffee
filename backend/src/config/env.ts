import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  SECRET_KEY: z.string().min(16),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  SMTP_SERVER: z.string(),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string().email(),
  SMTP_PASSWORD: z.string(),
  ADMIN_EMAIL: z.string().email(),
  PORT: z.coerce.number().int().positive().default(8000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DAILY_ORDER_GENERATION_TIME: z.string().default('06:00'),
  SCHEDULER_TIMEZONE: z.string().default('UTC'),
});

export type EnvVars = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
