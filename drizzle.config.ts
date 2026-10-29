import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit configuration.
 *
 * `packages/api` has no package manifest of its own, so the schema and the
 * migration output are addressed from the repository root. Generated SQL is
 * committed under `packages/api/drizzle/`; the journal in
 * `packages/api/drizzle/meta/` must be committed too, or `db:migrate` cannot
 * order migrations.
 *
 *   bun run db:generate                 # new SQL from schema changes (no DB needed)
 *   DATABASE_URL=postgres://… bun run db:migrate   # apply pending migrations
 *
 * `dbCredentials` is added only when DATABASE_URL is set: `generate` and the
 * CI drift check must work on a machine with no database, and drizzle-kit
 * rejects a config whose credentials are empty.
 *
 * `migrate` connects through the `postgres` driver that is already a repo
 * dependency; without it drizzle-kit fails with "please install either of
 * 'pg', 'postgres', …".
 */
const url = process.env.DATABASE_URL;

export default defineConfig({
  schema: './packages/api/src/db/schema.ts',
  out: './packages/api/drizzle',
  dialect: 'postgresql',
  strict: true,
  verbose: true,
  ...(url ? { dbCredentials: { url } } : {}),
});
