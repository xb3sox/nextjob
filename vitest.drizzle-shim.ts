// Test-only shim around drizzle-orm's pg-core index builders.
//
// Why this exists: Vitest externalizes node_modules, so `drizzle-orm` loads
// its CJS build while our schema sources are transformed as ESM. Under that
// mixed path the column classes' `defaultConfig` resolves to undefined and
// `JSON.parse(JSON.stringify(undefined))` inside `index(...).on(...)` throws
// `SyntaxError: "undefined" is not valid JSON`, breaking every packages/api
// suite that transitively imports src/db/schema.ts (auth, ats-connector, …).
// This shim keeps the exact same module identity for table/column
// constructors (so runtime brand checks like `is(col, PgColumn)` keep
// working) and only repairs the deep-copy in `.on()` / `.onOnly()`.
//
// IMPORTANT: wire this up via `resolve.alias` ONLY. Do NOT also add
// `server.deps.inline: [/drizzle-orm/]` — inlining makes Vitest process
// drizzle-orm's internal relative imports too and silently breaks named
// exports (`uuid is not a function`).
export * from 'drizzle-orm/pg-core';

import * as pgCore from 'drizzle-orm/pg-core';

const cloneDefaultConfig = (column: any) => {
  try {
    return JSON.parse(JSON.stringify(column.defaultConfig));
  } catch {
    // Defensive fallback: keep the same shape the upstream class field
    // provides ({ order: 'asc', nulls: 'last', opClass: undefined }) so an
    // unserializable value degrades to a shallow copy instead of throwing.
    return { ...column.config };
  }
};

for (const builderName of ['PgIndexBuilderOn', 'UniqueIndexBuilderOn'] as const) {
  const Builder = (pgCore as any)[builderName];
  if (!Builder?.prototype) continue;
  for (const method of ['on', 'onOnly'] as const) {
    if (typeof Builder.prototype[method] !== 'function') continue;
    Builder.prototype[method] = function patched(this: any, ...columns: any[]) {
      const mapped = columns.map((it) => {
        if (it && typeof it === 'object' && 'name' in it && 'indexConfig' in it) {
          return new (pgCore as any).IndexedColumn(
            it.name,
            !!it.keyAsName,
            it.columnType,
            cloneDefaultConfig(it)
          );
        }
        return it;
      });
      const unique = this.unique ?? false;
      const only = method === 'onOnly';
      return new (pgCore as any).IndexBuilder(mapped, unique, only, this.name);
    };
  }
}
