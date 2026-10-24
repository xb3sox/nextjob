import type { Db } from "./db";

/** Fires the external call, then records it. */
export async function submitAndRecord(
  db: Db,
  effect: () => Promise<void>,
  id: string,
): Promise<void> {
  await effect();
  await db.query("INSERT INTO submissions (id) VALUES ($1)", [id]);
}
