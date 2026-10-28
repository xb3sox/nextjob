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
 *   bun run db:generate   # new SQL from schema changes
 *   bun run db:migrate    # apply pending migrations (needs DATABASE_URL)
 */
export default defineConfig({
  schema: './packages/api/src/db/schema.ts',
  out: './packages/api/drizzle',
  dialect: 'postgresql',
  strict: true,
  verbose: true,
});
