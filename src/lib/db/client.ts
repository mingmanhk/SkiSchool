import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL!;

if (!connectionString) {
  // We don't throw immediately to allow build time execution (e.g. for static generation) if env is missing
  // But usage will fail.
  console.warn('Database connection string is not set');
}

// Global client to prevent multiple connections in dev (Next.js hot reload)
const globalForDb = global as unknown as { conn: postgres.Sql | undefined };

const conn = globalForDb.conn ?? postgres(connectionString || 'postgres://localhost:5432/postgres');

if (process.env.NODE_ENV !== 'production') globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
