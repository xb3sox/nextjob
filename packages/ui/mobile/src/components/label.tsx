import * as LabelPrimitive from "@rn-primitives/label";

import { cn } from "@workspace/ui";

import { Text } from "./text";

function Label({
  className,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: LabelPrimitive.TextProps & React.RefAttributes<LabelPrimitive.TextRef>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "flex flex-row items-center gap-2 select-none",
        disabled && "opacity-50",
      )}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
    >
      <Text
        asChild
        className={cn("native:leading-tight text-sm font-medium", className)}
      >
        <LabelPrimitive.Text {...props} />
      </Text>
    </LabelPrimitive.Root>
  );
}

export { Label };
