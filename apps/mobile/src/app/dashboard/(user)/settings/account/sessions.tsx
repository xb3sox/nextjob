import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert, View, FlatList, RefreshControl } from "react-native";
import { Fragment } from "react/jsx-runtime";

import { useTranslation } from "@workspace/i18n";
import { cn } from "@workspace/ui";
import { Badge } from "@workspace/ui-mobile/badge";
import { Button } from "@workspace/ui-mobile/button";
import { Icons } from "@workspace/ui-mobile/icons";
import { Skeleton } from "@workspace/ui-mobile/skeleton";
import { Spinner } from "@workspace/ui-mobile/spinner";
import { Text } from "@workspace/ui-mobile/text";

import { pathsConfig } from "~/config/paths";
import { authClient } from "~/lib/auth";
import { auth } from "~/modules/auth/lib/api";
import { user } from "~/modules/user/lib/api";

export default function Sessions() {
  const { t } = useTranslation(["common", "auth"]);
  const currentSession = authClient.useSession();
  const signOut = useMutation({
    ...auth.mutations.signOut,
    onSuccess: () => {
      router.replace(pathsConfig.index);
    },
  });

  const {
    data: sessions,
    isLoading,
    isFetching,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    ...user.queries.sessions.getAll(currentSession.data?.user.id),
    enabled: !!currentSession.data?.user.id,
  });

  const revoke = useMutation({
    ...user.mutations.sessions.revoke,
    onSuccess: async (_, id) => {
      Alert.alert(t("account.sessions.revoke.success"));
      if (id === currentSession.data?.session.id) {
        await signOut.mutateAsync(undefined);
        return;
      }
      await refetch();
    },
  });

  const isInitialLoading = currentSession.isPending || isLoading;

  return (
    <View className="bg-background flex-1 gap-6 p-6">
      <Text className="text-muted-foreground font-medium">
        {t("account.sessions.description")}
      </Text>
      <View className="border-border flex-1 rounded-md border">
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerClassName={cn({
            "flex-1": !sessions?.length,
            "items-center justify-center":
              !sessions?.length && !isInitialLoading,
          })}
          renderItem={({ item }) => (
            <View className="flex-row justify-between gap-3 px-4 py-3">
              <View className="flex-1">
                <View className="shrink flex-row items-center gap-1">
                  <Text
                    className="shrink text-sm font-medium"
                    numberOfLines={1}
                  >
                    {item.ipAddress}
                  </Text>
                  {item.id === currentSession.data?.session.id && (
                    <Badge variant="outline" className="mb-0.5">
                      <Text>{t("current")}</Text>
                    </Badge>
                  )}
                </View>
                <Text
                  className="text-muted-foreground text-sm"
                  numberOfLines={1}
                >
                  {item.userAgent}
                </Text>
              </View>

              <Button
                size="icon"
                variant="ghost"
                disabled={revoke.isPending && revoke.variables === item.id}
                onPress={() => revoke.mutate(item.id)}
              >
                {revoke.isPending && revoke.variables === item.id ? (
                  <Spinner className="text-foreground" size={16} />
                ) : (
                  <Icons.Trash className="text-foreground" size={16} />
                )}
              </Button>
            </View>
          )}
          ItemSeparatorComponent={() => <View className="bg-border h-px" />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                void refetch();
              }}
              tintColorClassName="accent-primary"
              colorsClassName="accent-primary"
            />
          }
          ListEmptyComponent={
            isInitialLoading ? (
              <View className="w-full items-start">
                {Array.from({ length: 15 }).map((_, index, arr) => (
                  <Fragment key={index}>
                    <View className="flex-row items-center justify-between gap-3 px-4 py-3">
                      <View className="gap-1.5">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-64" />
                      </View>
                      <Skeleton className="h-10 w-10" />
                    </View>
                    {index !== arr.length - 1 && (
                      <View className="bg-border h-px" />
                    )}
                  </Fragment>
                ))}
              </View>
            ) : error && !sessions ? (
              <View className="items-center gap-3 p-6">
                <Text className="text-center">{t("error.general")}</Text>
                <Button
                  variant="outline"
                  disabled={isFetching}
                  onPress={() => void refetch()}
                >
                  <Text>{t("tryAgain")}</Text>
                </Button>
              </View>
            ) : (
              <Text>{t("account.sessions.noSessions")}</Text>
            )
          }
        />
      </View>
    </View>
  );
}
