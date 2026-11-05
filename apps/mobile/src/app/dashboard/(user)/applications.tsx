import { View } from "react-native";

import { UserHeader } from "~/modules/common/layout/header";
import { ScrollView } from "~/modules/common/styled";
import { ApplicationsList } from "~/modules/nextjob/applications/applications-list";

export default function ApplicationsScreen() {
  return (
    <View className="bg-background flex-1">
      <UserHeader />
      <ScrollView
        className="bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="bg-background grow gap-4 px-6 py-4"
        showsVerticalScrollIndicator={false}
      >
        <ApplicationsList />
      </ScrollView>
    </View>
  );
}
