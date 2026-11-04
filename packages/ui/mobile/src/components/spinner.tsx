import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
  cancelAnimation,
  withRepeat,
  useSharedValue,
} from "react-native-reanimated";

import { useTranslation } from "@workspace/i18n";

import { Icons } from "./icons";

function Spin({ children }: { children: React.ReactNode }) {
  const rotation = useSharedValue(0);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotateZ: `${rotation.get()}deg`,
        },
      ],
    };
  }, [rotation]);

  useEffect(() => {
    rotation.set(
      withRepeat(
        withTiming(360, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(rotation);
  }, [rotation]);

  return (
    <Animated.View
      style={[
        animatedStyles,
        {
          alignSelf: "center",
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function Spinner(props: React.ComponentProps<typeof Icons.Loader>) {
  const { t } = useTranslation("common");
  return (
    <Spin>
      <Icons.Loader2 aria-label={t("loading")} size={18} {...props} />
    </Spin>
  );
}

export { Spin, Spinner };
