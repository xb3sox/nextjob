import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// ============================================================================
// Database client
//
// The connection is created lazily so that importing this module (directly or
// transitively, e.g. from the auth service) never throws when DATABASE_URL is
// not configured — this keeps unit tests and tooling working without a live
// Postgres instance. Tests should mock this module (`vi.mock('../db/index')`).
// ============================================================================

let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!dbInstance) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        'DATABASE_URL is not set. Configure the environment before using the database.'
      );
    }
    client = postgres(url, { max: 10 });
    dbInstance = drizzle(client, { schema });
  }
  return dbInstance;
}

/**
 * Proxy that resolves the lazy db on first property access. This preserves the
 * familiar `db.query.users...` / `db.insert(users)...` API used across the
 * codebase while avoiding eager connection creation at import time.
 */
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

export { schema };
export default db;
