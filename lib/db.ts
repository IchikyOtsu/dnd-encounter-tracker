import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

// Charger .env.local si les variables ne sont pas déjà définies (pour les scripts)
if (!process.env.TURSO_DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL is not defined');
}

if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN is not defined');
}

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
