import * as Notifications from "expo-notifications";
import { memo, useEffect } from "react";

import { logger } from "@workspace/shared/logger";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationsProviderProps {
  readonly children: React.ReactNode;
}

export const NotificationsProvider = memo<NotificationsProviderProps>(
  ({ children }) => {
    useEffect(() => {
      const receivedSubscription =
        Notifications.addNotificationReceivedListener((notification) => {
          logger.info(
            "Notification received:",
            notification.request.identifier,
          );
        });
      const responseSubscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          logger.info(
            "Notification response received:",
            response.notification.request.identifier,
          );
        });

      return () => {
        receivedSubscription.remove();
        responseSubscription.remove();
      };
    }, []);

    return children;
  },
);

NotificationsProvider.displayName = "NotificationsProvider";
