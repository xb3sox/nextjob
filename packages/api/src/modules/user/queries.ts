import { and, eq, gt } from "@workspace/db";
import { session } from "@workspace/db/schema";
import { db } from "@workspace/db/server";

export const getSessions = (userId: string) =>
  db
    .select({
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
    })
    .from(session)
    .where(and(eq(session.userId, userId), gt(session.expiresAt, new Date())));

export const getSession = ({ id, userId }: { id: string; userId: string }) =>
  db
    .select({ token: session.token })
    .from(session)
    .where(
      and(
        eq(session.id, id),
        eq(session.userId, userId),
        gt(session.expiresAt, new Date()),
      ),
    )
    .limit(1);
