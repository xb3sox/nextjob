import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";

import { logger } from "@workspace/shared/logger";

import { useNotificationsPermissions } from "~/modules/common/hooks/notifications/use-notifications-permissions";
import { isAndroid } from "~/utils/device";

const fetchPushToken = async () => {
  if (isAndroid) {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const pushToken = await Notifications.getExpoPushTokenAsync({
    projectId:
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId,
  });

  return pushToken.data;
};

export const usePushToken = () => {
  const permissions = useNotificationsPermissions();

  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getToken = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await fetchPushToken();
      setToken(data);
      return data;
    } catch (error) {
      logger.error("Failed to get Expo push token:", error);
      setToken(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!permissions.isGranted) {
      return;
    }

    let cancelled = false;

    const syncToken = async () => {
      try {
        const data = await fetchPushToken();
        if (!cancelled) {
          setToken(data);
        }
      } catch (error) {
        logger.error("Failed to get Expo push token:", error);
        if (!cancelled) {
          setToken(null);
        }
      }
    };

    void syncToken();

    return () => {
      cancelled = true;
    };
  }, [permissions.isGranted]);

  return {
    token: permissions.isGranted ? token : null,
    isLoading: permissions.isGranted && isLoading,
    getToken,
  };
};
