import { View } from "react-native";

import { BuiltWith } from "@workspace/ui-mobile/built-with";
import { Text } from "@workspace/ui-mobile/text";

import { appConfig } from "~/config/app";
import { UserHeader } from "~/modules/common/layout/header";
import { ScrollView } from "~/modules/common/styled";
import { UserOrganizationInvitationsBanner } from "~/modules/organization/invitations/user/user-organization-invitations";
import { OrganizationPicker } from "~/modules/organization/organization-picker";

export default function Home() {
  return (
    <View className="bg-background flex-1">
      <UserHeader />
      <ScrollView
        testID="dashboard-home"
        className="bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="items-center bg-background grow gap-6 px-6 py-2"
        showsVerticalScrollIndicator={false}
      >
        <UserOrganizationInvitationsBanner />
        <OrganizationPicker />
        <View className="items-center gap-1.5 pt-4 pb-10">
          <BuiltWith />
          {appConfig.version ? (
            <Text className="text-muted-foreground text-xs">
              {`v${appConfig.version}`}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
