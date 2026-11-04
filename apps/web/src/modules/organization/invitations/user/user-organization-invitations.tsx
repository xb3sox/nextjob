"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";

import { handle } from "@workspace/api/utils";
import { InvitationStatus } from "@workspace/auth";
import { useTranslation } from "@workspace/i18n";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui-web/alert";
import { Button } from "@workspace/ui-web/button";
import { Icons } from "@workspace/ui-web/icons";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@workspace/ui-web/modal";
import { Skeleton } from "@workspace/ui-web/skeleton";
import { Spinner } from "@workspace/ui-web/spinner";
import { toast } from "@workspace/ui-web/toast";

import { api } from "~/lib/api/client";
import { authClient } from "~/lib/auth/client";
import { organization } from "~/modules/organization/lib/api";
import { user } from "~/modules/user/lib/api";

import { InvitationSummaryCard } from "../invitation-summary-card";

import type { Invitation } from "@workspace/auth";

dayjs.extend(duration);
dayjs.extend(relativeTime);

export const UserOrganizationInvitationsBanner = () => {
  const { t } = useTranslation(["organization", "common"]);
  const session = authClient.useSession();
  const userId = session.data?.user.id;

  const { data } = useQuery({
    ...user.queries.invitations.getAll(userId),
    enabled: !!userId,
  });
  const pendingInvitations = data?.filter(
    (invitation) =>
      invitation.status === InvitationStatus.PENDING &&
      dayjs(invitation.expiresAt).isAfter(dayjs()),
  );

  if (!pendingInvitations?.length) {
    return null;
  }

  return (
    <UserOrganizationInvitationsListModal
      invitations={pendingInvitations}
      render={
        <button
          type="button"
          aria-label={t("invitations.user.banner.title", {
            count: pendingInvitations.length,
          })}
          className="ring-offset-background focus-visible:ring-ring w-full cursor-pointer rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Alert
            variant="primary"
            className="hover:bg-primary/10 flex flex-wrap items-center justify-between gap-4 transition-colors"
          >
            <div className="flex flex-col items-start gap-y-0.5">
              <AlertTitle>
                {t("invitations.user.banner.title", {
                  count: pendingInvitations.length,
                })}
              </AlertTitle>
              <AlertDescription>
                {t("invitations.user.banner.description")}
              </AlertDescription>
            </div>
          </Alert>
        </button>
      }
    />
  );
};

const UserOrganizationInvitationsListModalItem = ({
  invitation,
  onSuccess,
}: {
  invitation: Invitation;
  onSuccess?: () => void;
}) => {
  const { t } = useTranslation(["common", "organization"]);
  const queryClient = useQueryClient();
  const { refetch } = authClient.useListOrganizations();
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;

  const { data, isLoading } = useQuery({
    queryKey: organization.queries.get({ id: invitation.organizationId })
      .queryKey,
    queryFn: () =>
      handle(api.organizations[":id"].$get)({
        param: { id: invitation.organizationId },
      }),
  });

  const acceptInvitation = useMutation({
    ...organization.mutations.invitations.accept,
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        user.queries.invitations.getAll(userId),
      );
      toast.add({
        title: t("invitations.accept.success", "", {
          organization: data?.organization?.name ?? "",
        }),
        type: "success",
      });
      await refetch();
      onSuccess?.();
    },
  });
  const rejectInvitation = useMutation({
    ...organization.mutations.invitations.reject,
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        user.queries.invitations.getAll(userId),
      );
      toast.add({
        title: t("invitations.reject.success", "", {
          organization: data?.organization?.name ?? "",
        }),
        type: "success",
      });
      onSuccess?.();
    },
  });

  if (isLoading) {
    return <Skeleton className="h-19 w-full" />;
  }

  if (!data?.organization) {
    return null;
  }

  return (
    <li className="flex items-stretch gap-2">
      <InvitationSummaryCard
        invitation={invitation}
        organization={data.organization}
      />

      <div className="flex flex-col gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            rejectInvitation.mutate({ invitationId: invitation.id })
          }
          disabled={rejectInvitation.isPending || acceptInvitation.isPending}
        >
          {rejectInvitation.isPending ? <Spinner /> : <Icons.X />}
          {t("reject")}
        </Button>

        <Button
          size="sm"
          onClick={() =>
            acceptInvitation.mutate({ invitationId: invitation.id })
          }
          disabled={rejectInvitation.isPending || acceptInvitation.isPending}
        >
          {acceptInvitation.isPending ? <Spinner /> : <Icons.Check />}
          {t("accept")}
        </Button>
      </div>
    </li>
  );
};

export const UserOrganizationInvitationsListModal = ({
  render,
  invitations,
}: {
  invitations: Invitation[];
  render: React.ReactElement;
}) => {
  const { t } = useTranslation("organization");
  const [open, setOpen] = useState(false);

  return (
    <Modal
      open={open}
      drawer={{ onOpenChange: setOpen }}
      dialog={{ onOpenChange: setOpen }}
    >
      <ModalTrigger render={render} />
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{t("invitations.user.list.title")}</ModalTitle>
          <ModalDescription>
            {t("invitations.user.list.description")}
          </ModalDescription>
        </ModalHeader>

        <ul className="flex flex-col gap-4">
          {invitations.map((invitation) => (
            <UserOrganizationInvitationsListModalItem
              key={invitation.id}
              invitation={invitation}
              {...(invitations.length === 1
                ? { onSuccess: () => setOpen(false) }
                : {})}
            />
          ))}
        </ul>
      </ModalContent>
    </Modal>
  );
};
