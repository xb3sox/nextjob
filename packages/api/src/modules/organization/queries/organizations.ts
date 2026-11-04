import {
  getAllRolesAtOrAbove,
  InvitationStatus,
  MemberRole,
} from "@workspace/auth";
import { auth } from "@workspace/auth/server";
import { and, eq, gt } from "@workspace/db";
import { invitation, organization } from "@workspace/db/schema";
import { db } from "@workspace/db/server";

export const getOrganization = async ({ id }: { id: string }) =>
  db.query.organization.findFirst({
    where: eq(organization.id, id),
  });

export const getOrganizationPublic = async ({ id }: { id: string }) =>
  db.query.organization.findFirst({
    where: eq(organization.id, id),
    columns: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      createdAt: true,
      metadata: false,
    },
  });

export const hasPendingOrganizationInvitation = async ({
  organizationId,
  email,
}: {
  organizationId: string;
  email: string;
}) => {
  const pendingInvitation = await db.query.invitation.findFirst({
    where: and(
      eq(invitation.organizationId, organizationId),
      eq(invitation.email, email),
      eq(invitation.status, InvitationStatus.PENDING),
      gt(invitation.expiresAt, new Date()),
    ),
    columns: { id: true },
  });

  return pendingInvitation !== undefined;
};

export const getOrganizationForUser = async ({
  id,
  userId,
  email,
  headers,
}: {
  id: string;
  userId: string;
  email: string;
  headers: Headers;
}) => {
  try {
    const { members } = await auth.api.listMembers({
      query: {
        organizationId: id,
        filterField: "userId",
        filterValue: userId,
        filterOperator: "eq",
      },
      headers,
    });

    const member = members.find((member) => member.userId === userId);

    if (
      member &&
      getAllRolesAtOrAbove(MemberRole.MEMBER).includes(member.role)
    ) {
      return await getOrganization({ id });
    }
  } catch {
    // fall through to invitation check
  }

  const hasInvitation = await hasPendingOrganizationInvitation({
    organizationId: id,
    email,
  });

  if (!hasInvitation) {
    return null;
  }

  return await getOrganizationPublic({ id });
};
