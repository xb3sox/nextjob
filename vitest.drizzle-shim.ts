// Test-only shim around drizzle-orm's pg-core index builders.
//
// Why this exists: Vitest externalizes node_modules, so `drizzle-orm` loads
// its CJS build (where column `defaultConfig` is undefined) while our schema
// sources are transformed as ESM — the mismatch makes
// `JSON.parse(JSON.stringify(column.defaultConfig))` throw inside
// `index(...).on(...)`. This shim keeps the exact same module identity for
// table/column constructors (so runtime brand checks like `is(col, PgColumn)`
// keep working) and only repairs the deep-copy in `.on()` / `.onOnly()`.
export * from 'drizzle-orm/pg-core';

import * as pgCore from 'drizzle-orm/pg-core';

const cloneDefaultConfig = (column: any) => {
  try {
    return JSON.parse(JSON.stringify(column.defaultConfig));
  } catch {
    // Externalized-CJS columns expose `defaultConfig` as a getter that throws
    // before returning anything useful; fall back to the plain object copy.
    return { ...column.config };
  }
};

for (const builderName of ['PgIndexBuilderOn', 'UniqueIndexBuilderOn'] as const) {
  const Builder = (pgCore as any)[builderName];
  if (!Builder?.prototype) continue;
  for (const method of ['on', 'onOnly'] as const) {
    if (typeof Builder.prototype[method] !== 'function') continue;
    Builder.prototype[method] = function patched(
      this: any,
      ...columns: any[]
    ) {
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
      // Mirror the original constructor arity/branching of the upstream impl.
      const unique = this.unique ?? false;
      const only = method === 'onOnly';
      return new (pgCore as any).IndexBuilder(mapped, unique, only, this.name);
    };
  }
}
