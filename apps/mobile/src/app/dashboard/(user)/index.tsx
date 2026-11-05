import { View } from "react-native";

import { UserHeader } from "~/modules/common/layout/header";
import { ScrollView } from "~/modules/common/styled";
import { DashboardSummary } from "~/modules/nextjob/dashboard/dashboard-summary";

export default function Home() {
  return (
    <View className="bg-background flex-1">
      <UserHeader />
      <ScrollView
        testID="dashboard-home"
        className="bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="bg-background grow gap-6 px-6 py-6"
        showsVerticalScrollIndicator={false}
      >
        <DashboardSummary />
      </ScrollView>
    </View>
  );
}
