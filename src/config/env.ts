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
  UPLOAD_STRATEGY: z.enum(['local', 'cloudinary']).default('cloudinary'),
  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY: z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),
  CLOUDINARY_FOLDER: z.string().default('mini-erp/products'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Config validation error: ${parsed.error.message}`);
}

const envVars = parsed.data;
const hasCloudinaryConfig = Boolean(
  envVars.CLOUDINARY_CLOUD_NAME && envVars.CLOUDINARY_API_KEY && envVars.CLOUDINARY_API_SECRET
);

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
    strategy: hasCloudinaryConfig ? 'cloudinary' : envVars.UPLOAD_STRATEGY === 'cloudinary' ? 'cloudinary' : 'local',
    cloudinaryCloudName: envVars.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: envVars.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: envVars.CLOUDINARY_API_SECRET,
    cloudinaryFolder: envVars.CLOUDINARY_FOLDER,
  },
  clientUrl: envVars.CLIENT_URL,
};
