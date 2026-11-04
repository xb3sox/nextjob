import { createContext, useContext } from "react";
import { Dimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

import { cn } from "@workspace/ui";

import type { FlatList } from "react-native";
import type { ViewProps } from "react-native";
import type {
  SharedValue,
  ScrollHandlerProcessed,
  FlatListPropsWithLayout,
} from "react-native-reanimated";

interface CarouselContextType {
  threshold: number;
  scrollX: SharedValue<number> | null;
  onScroll: ScrollHandlerProcessed;
}

const CarouselContext = createContext<CarouselContextType>({
  threshold: Dimensions.get("window").width,
  scrollX: null,
  onScroll: () => null,
});

const nativeGesture = () => Gesture.Native();

const Carousel = ({
  className,
  threshold = Dimensions.get("window").width,
  ...props
}: ViewProps & { threshold?: number }) => {
  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: ({ contentOffset: { x } }) => {
      scrollX.set(x);
    },
  });

  return (
    <CarouselContext.Provider value={{ scrollX, onScroll, threshold }}>
      <View {...props} className={cn("flex-1 items-center gap-4", className)} />
    </CarouselContext.Provider>
  );
};

const CarouselList = <ItemT,>(
  props: FlatListPropsWithLayout<ItemT> & {
    ref?: React.ForwardedRef<FlatList>;
  },
) => {
  const { onScroll, threshold } = useContext(CarouselContext);
  const native = nativeGesture();

  return (
    <GestureDetector gesture={native}>
      <Animated.FlatList
        onScroll={onScroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToAlignment="start"
        pagingEnabled
        snapToInterval={threshold}
        {...props}
      />
    </GestureDetector>
  );
};

const CarouselListItem = ({
  index,
  style,
  ...props
}: ViewProps & { index: number }) => {
  const { scrollX, threshold } = useContext(CarouselContext);
  const opacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX?.get() ?? 0,
      [(index - 1) * threshold, index * threshold, (index + 1) * threshold],
      [0, 1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return <Animated.View style={[style, opacity]} {...props} />;
};

const CarouselPaginationDots = ({ className, ...props }: ViewProps) => {
  return <View className={cn("flex-row gap-1.5", className)} {...props} />;
};

const CarouselPaginationDot = ({
  className,
  index = 0,
  ...props
}: ViewProps & { index?: number }) => {
  const { scrollX, threshold } = useContext(CarouselContext);

  const animatedDot = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX?.get() ?? 0,
      [(index - 1) * threshold, index * threshold, (index + 1) * threshold],
      [0.7, 1, 0.7],
    ),
    width: interpolate(
      scrollX?.get() ?? 0,
      [(index - 1) * threshold, index * threshold, (index + 1) * threshold],
      [11, 28, 11],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View
      className={cn("bg-primary h-3 rounded-full opacity-50", className)}
      style={animatedDot}
      {...props}
    />
  );
};

export {
  Carousel,
  CarouselList,
  CarouselListItem,
  CarouselPaginationDots,
  CarouselPaginationDot,
};
