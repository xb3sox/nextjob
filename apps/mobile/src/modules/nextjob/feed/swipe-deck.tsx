/* oxlint-disable react/immutability, eslint/no-unused-vars, react/capitalized-calls */
import { useState } from "react";
import { View, Pressable, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
} from "react-native-reanimated";

import { Text } from "@workspace/ui-mobile/text";

import { JobCard, Job } from "./job-card";

const MOCK_JOBS: Job[] = [
  {
    id: "1",
    company: "Acme Corp",
    logo: "https://ui-avatars.com/api/?name=Acme+Corp&background=random",
    title: "Senior Frontend Engineer",
    salary: "$140k - $160k",
    matchScore: 95,
  },
  {
    id: "2",
    company: "TechFlow",
    logo: "https://ui-avatars.com/api/?name=TechFlow&background=random",
    title: "React Native Developer",
    salary: "$130k - $150k",
    matchScore: 88,
  },
  {
    id: "3",
    company: "Innovate Inc",
    logo: "https://ui-avatars.com/api/?name=Innovate+Inc&background=random",
    title: "Full Stack Engineer",
    salary: "$120k - $140k",
    matchScore: 82,
  },
];

export function SwipeDeck() {
  const { width: screenWidth } = useWindowDimensions();
  const swipeThreshold = screenWidth * 0.25;

  const [currentIndex, setCurrentIndex] = useState(0);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const handleSwipeComplete = (direction: "left" | "right") => {
    setCurrentIndex((prev) => prev + 1);
    translateX.value = 0;
    translateY.value = 0;
  };

  const triggerSwipe = (direction: "left" | "right") => {
    translateX.value = withSpring(
      direction === "right" ? screenWidth * 1.5 : -screenWidth * 1.5,
      {},
      () => {
        runOnJS(handleSwipeComplete)(direction);
      },
    );
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      "worklet";
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      "worklet";
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd((event) => {
      "worklet";
      if (event.translationX > swipeThreshold) {
        translateX.value = withSpring(screenWidth * 1.5, {}, () => {
          runOnJS(handleSwipeComplete)("right");
        });
      } else if (event.translationX < -swipeThreshold) {
        translateX.value = withSpring(-screenWidth * 1.5, {}, () => {
          runOnJS(handleSwipeComplete)("left");
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-screenWidth / 2, 0, screenWidth / 2],
      [-10, 0, 10],
      "clamp",
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const nextCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, screenWidth / 2],
      [0.9, 1],
      "clamp",
    );

    return {
      transform: [{ scale }],
    };
  });

  if (currentIndex >= MOCK_JOBS.length) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="mb-2 text-center text-2xl font-bold">
          No more jobs!
        </Text>
        <Text className="text-muted-foreground text-center">
          Check back later for more matches.
        </Text>
      </View>
    );
  }

  const currentJob = MOCK_JOBS[currentIndex];
  const nextJob =
    currentIndex < MOCK_JOBS.length - 1
      ? MOCK_JOBS[currentIndex + 1]
      : undefined;

  return (
    <View className="flex-1 items-center justify-center p-4">
      {/* Background card (next job) */}
      {nextJob && (
        <Animated.View
          style={[
            { position: "absolute", width: "100%", paddingHorizontal: 16 },
            nextCardStyle,
          ]}
        >
          <JobCard job={nextJob} />
        </Animated.View>
      )}

      {/* Foreground card (current job) */}
      {currentJob && (
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{ width: "100%" }, cardStyle]}>
            <JobCard job={currentJob} />
          </Animated.View>
        </GestureDetector>
      )}

      <View className="mt-12 w-full flex-row justify-between px-8">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pass job"
          onPress={() => triggerSwipe("left")}
          className="items-center"
        >
          <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-red-500 bg-red-500/10">
            <Text className="text-xl font-bold text-red-500">✗</Text>
          </View>
          <Text className="text-muted-foreground mt-2 font-medium">Pass</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Apply to job"
          onPress={() => triggerSwipe("right")}
          className="items-center"
        >
          <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-green-500 bg-green-500/10">
            <Text className="text-xl font-bold text-green-500">✓</Text>
          </View>
          <Text className="text-muted-foreground mt-2 font-medium">Apply</Text>
        </Pressable>
      </View>
    </View>
  );
}
