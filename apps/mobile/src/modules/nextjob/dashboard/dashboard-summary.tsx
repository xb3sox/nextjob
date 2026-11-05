import { View } from "react-native";

import { Button } from "@workspace/ui-mobile/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui-mobile/card";
import { Progress } from "@workspace/ui-mobile/progress";
import { Text } from "@workspace/ui-mobile/text";

export function DashboardSummary() {
  const dailyApplied = 18;
  const dailyTarget = 25;
  const pendingApproval = 4;

  return (
    <View className="gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Application Progress</CardTitle>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="flex-row items-end justify-between">
            <Text className="text-3xl font-bold">{dailyApplied}</Text>
            <Text className="text-muted-foreground pb-1">
              / {dailyTarget} applied
            </Text>
          </View>
          <Progress
            value={(dailyApplied / dailyTarget) * 100}
            className="w-full"
          />
        </CardContent>
      </Card>

      <View className="flex-row gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="text-primary text-4xl font-bold">
              {pendingApproval}
            </Text>
          </CardContent>
        </Card>
      </View>

      <View className="gap-2">
        <Text className="mb-2 text-lg font-semibold">Quick Actions</Text>
        <Button variant="default">
          <Text>Review Matches</Text>
        </Button>
        <Button variant="outline">
          <Text>Update Preferences</Text>
        </Button>
      </View>
    </View>
  );
}
