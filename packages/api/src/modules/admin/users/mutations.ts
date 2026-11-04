import { and, eq } from "@workspace/db";
import { account } from "@workspace/db/schema";
import { db } from "@workspace/db/server";

export const deleteAccount = async ({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) =>
  db.delete(account).where(and(eq(account.id, id), eq(account.userId, userId)));
