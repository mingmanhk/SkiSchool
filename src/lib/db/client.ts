// Database client utilities for multi-tenant RLS support
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema_multi_tenant';

type DbSchema = typeof schema;

let _db: PostgresJsDatabase<DbSchema> | null = null;

/**
 * Lazily initialises the Drizzle/Postgres client on first access.
 * This prevents a startup crash when DATABASE_URL is not set in
 * environments that don't need the DB (e.g. static builds, unit tests).
 */
function getDb(): PostgresJsDatabase<DbSchema> {
  if (_db) return _db;

  const connectionString =
    process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL or POSTGRES_PRISMA_URL must be set before using the database client.',
    );
  }

  const queryClient = postgres(connectionString, {
    max: 10, // connection pool size
    idle_timeout: 20,
    connect_timeout: 10,
  });

  _db = drizzle(queryClient, { schema });
  return _db;
}

/**
 * Proxy that forwards property access to the lazily-created client.
 * Allows `import { db } from '@/lib/db/client'` to work as before
 * without breaking existing service code.
 */
export const db = new Proxy({} as PostgresJsDatabase<DbSchema>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

/**
 * Returns the database client, optionally scoped to a tenant context.
 * For Supabase RLS the tenant_id is set in the JWT; for direct Postgres
 * connections a session variable can be added here in future.
 */
export function getDbClient(_tenantId?: string): PostgresJsDatabase<DbSchema> {
  return getDb();
}

/**
 * Executes a callback inside a Postgres transaction.
 */
export async function withTransaction<T>(
  callback: (tx: PostgresJsDatabase<DbSchema>) => Promise<T>,
): Promise<T> {
  const client = getDb();
  return (client as any).transaction(callback);
}

export { schema };
