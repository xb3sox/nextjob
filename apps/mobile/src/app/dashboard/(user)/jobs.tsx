import { View } from "react-native";

import { UserHeader } from "~/modules/common/layout/header";
import { SwipeDeck } from "~/modules/nextjob/feed/swipe-deck";

export default function JobsScreen() {
  return (
    <View className="bg-background flex-1">
      <UserHeader />
      <View className="bg-background flex-1">
        <SwipeDeck />
      </View>
    </View>
  );
}
