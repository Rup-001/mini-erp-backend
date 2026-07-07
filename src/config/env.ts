import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRATION_MINUTES: z.coerce.number().default(60),
  UPLOAD_DIR: z.string().default('public/uploads/products'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(5),
  CLIENT_URL: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Config validation error: ${parsed.error.message}`);
}

const envVars = parsed.data;

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGO_URI,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
  },
  upload: {
    dir: envVars.UPLOAD_DIR,
    maxFileSizeMb: envVars.MAX_FILE_SIZE_MB,
  },
  clientUrl: envVars.CLIENT_URL,
};
