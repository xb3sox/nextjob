import { Image } from "expo-image";
import { View } from "react-native";

import { Badge } from "@workspace/ui-mobile/badge";
import { Card, CardContent } from "@workspace/ui-mobile/card";
import { Text } from "@workspace/ui-mobile/text";

interface Application {
  id: string;
  company: string;
  logo: string;
  title: string;
  status: "Needs Approval" | "Submitting" | "Confirmed" | "Interview";
  date: string;
}

const MOCK_APPLICATIONS: Application[] = [
  {
    id: "1",
    company: "Google",
    logo: "https://ui-avatars.com/api/?name=Google&background=random",
    title: "Senior Product Manager",
    status: "Interview",
    date: "Oct 24",
  },
  {
    id: "2",
    company: "Stripe",
    logo: "https://ui-avatars.com/api/?name=Stripe&background=random",
    title: "Frontend Engineer",
    status: "Confirmed",
    date: "Oct 26",
  },
  {
    id: "3",
    company: "Vercel",
    logo: "https://ui-avatars.com/api/?name=Vercel&background=random",
    title: "Developer Advocate",
    status: "Submitting",
    date: "Today",
  },
  {
    id: "4",
    company: "Acme Corp",
    logo: "https://ui-avatars.com/api/?name=Acme+Corp&background=random",
    title: "Full Stack Developer",
    status: "Needs Approval",
    date: "Today",
  },
];

const getStatusColor = (status: Application["status"]) => {
  switch (status) {
    case "Needs Approval":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "Submitting":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "Confirmed":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "Interview":
      return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
};

export function ApplicationsList() {
  return (
    <View className="gap-4 pb-8">
      <View className="mb-2">
        <Text className="text-2xl font-bold">Applications</Text>
        <Text className="text-muted-foreground">
          Track your job search progress
        </Text>
      </View>

      {MOCK_APPLICATIONS.map((app) => (
        <Card key={app.id}>
          <CardContent className="flex-row items-center gap-4 p-4">
            <Image
              source={{ uri: app.logo }}
              style={{ width: 48, height: 48, borderRadius: 12 }}
              contentFit="cover"
            />
            <View className="flex-1 gap-1">
              <Text className="text-base font-bold" numberOfLines={1}>
                {app.title}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {app.company}
              </Text>

              <View className="mt-2 flex-row items-center justify-between">
                <Badge variant="outline" className={getStatusColor(app.status)}>
                  <Text
                    className={`text-xs font-semibold ${getStatusColor(app.status).split(" ")[1]}`}
                  >
                    {app.status}
                  </Text>
                </Badge>
                <Text className="text-muted-foreground text-xs">
                  {app.date}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
      ))}
    </View>
  );
}
