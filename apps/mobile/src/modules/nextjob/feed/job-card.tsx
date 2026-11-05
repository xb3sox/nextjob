import { Image } from "expo-image";
import { View } from "react-native";

import { Badge } from "@workspace/ui-mobile/badge";
import { Text } from "@workspace/ui-mobile/text";

export interface Job {
  id: string;
  company: string;
  logo: string;
  title: string;
  salary: string;
  matchScore: number;
}

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <View className="bg-card border-border h-[400px] w-full justify-between rounded-3xl border p-6 shadow-lg shadow-black/10">
      <View className="gap-4">
        <View className="flex-row items-start justify-between">
          <Image
            source={{ uri: job.logo }}
            style={{ width: 64, height: 64, borderRadius: 16 }}
            contentFit="cover"
          />
          <Badge variant="default" className="bg-green-500/10">
            <Text className="font-bold text-green-600">
              {job.matchScore}% Match
            </Text>
          </Badge>
        </View>

        <View className="mt-4 gap-2">
          <Text className="text-2xl font-bold">{job.title}</Text>
          <Text className="text-muted-foreground text-lg font-medium">
            {job.company}
          </Text>
        </View>
      </View>

      <View className="border-border flex-row items-center justify-between border-t pt-4">
        <Text className="text-muted-foreground font-medium">Est. Salary</Text>
        <Text className="text-lg font-bold">{job.salary}</Text>
      </View>
    </View>
  );
}
