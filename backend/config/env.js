import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const configDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendDirectory = path.resolve(configDirectory, '..');
dotenv.config({ path: path.resolve(backendDirectory, '../.env') });

const port = Number(process.env.PORT || 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32 ||
    process.env.SESSION_SECRET.startsWith('replace-')) {
  throw new Error('Set SESSION_SECRET to a random secret of at least 32 characters in .env.');
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port,
  sessionSecret: process.env.SESSION_SECRET,
  adminUsername: process.env.ADMIN_USERNAME || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  backendDirectory,
  projectRoot: path.resolve(backendDirectory, '..'),
  databasePath: path.resolve(backendDirectory, 'data/portfolio.sqlite'),
  uploadsDirectory: path.resolve(backendDirectory, 'uploads')
};
