"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { MemberRole } from "@workspace/auth";
import { useTranslation } from "@workspace/i18n";
import { Button } from "@workspace/ui-web/button";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@workspace/ui-web/modal";
import { Spinner } from "@workspace/ui-web/spinner";
import { toast } from "@workspace/ui-web/toast";

import { pathsConfig } from "~/config/paths";
import { authClient } from "~/lib/auth/client";
import {
  SettingsCard,
  SettingsCardHeader,
  SettingsCardTitle,
  SettingsCardDescription,
  SettingsCardFooter,
} from "~/modules/common/layout/dashboard/settings-card";
import { useActiveOrganization } from "~/modules/organization/hooks/use-active-organization";
import { organization } from "~/modules/organization/lib/api";

export const LeaveOrganization = ({
  organizationId,
}: {
  organizationId: string;
}) => {
  const { t } = useTranslation("organization");
  const { activeMember } = useActiveOrganization();
  const session = authClient.useSession();
  const userId = session.data?.user.id;
  const isOwner = activeMember?.role === MemberRole.OWNER;

  const { data: activeOrganization } = useQuery(
    organization.queries.get({ id: organizationId }),
  );

  const { data: canLeave } = useQuery({
    ...organization.queries.canLeave({ id: organizationId, userId }),
    enabled: isOwner && !!userId,
  });

  const canCurrentMemberLeave = !isOwner || canLeave?.allowed === true;

  if (!activeOrganization) {
    return null;
  }

  return (
    <SettingsCard variant="destructive" disabled={!canCurrentMemberLeave}>
      <SettingsCardHeader>
        <SettingsCardTitle>{t("leave.title")}</SettingsCardTitle>
        <SettingsCardDescription>
          {t("leave.description")}
        </SettingsCardDescription>
      </SettingsCardHeader>

      <SettingsCardFooter>
        {canCurrentMemberLeave ? (
          <ConfirmLeaveModal
            organizationId={activeOrganization.id}
            render={
              <Button size="sm" className="ml-auto" variant="destructive">
                {t("leave.cta")}
              </Button>
            }
          />
        ) : (
          t("leave.cannotLeaveAsOnlyOwner")
        )}
      </SettingsCardFooter>
    </SettingsCard>
  );
};

const ConfirmLeaveModal = ({
  render,
  organizationId,
}: {
  render: React.ReactElement;
  organizationId: string;
}) => {
  const { t } = useTranslation(["common", "organization"]);
  const router = useRouter();
  const { refetch } = authClient.useListOrganizations();

  const leaveOrganization = useMutation({
    ...organization.mutations.leave,
    onSuccess: async () => {
      await refetch();
      toast.add({ title: t("leave.success"), type: "success" });
      router.replace(pathsConfig.dashboard.user.index);
    },
  });

  const handleLeave = () => {
    leaveOrganization.mutate({ organizationId });
  };

  return (
    <Modal>
      <ModalTrigger render={render} />
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{t("leave.title")}</ModalTitle>
          <ModalDescription className="whitespace-pre-line">
            {t("leave.disclaimer")}
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <ModalClose
            render={<Button variant="outline">{t("cancel")}</Button>}
          />
          <Button
            onClick={handleLeave}
            variant="destructive"
            disabled={leaveOrganization.isPending}
          >
            {leaveOrganization.isPending ? <Spinner /> : t("common:leave")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
