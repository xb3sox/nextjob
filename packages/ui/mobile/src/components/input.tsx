import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { TextInput } from "react-native";

import { cn } from "@workspace/ui";

import type { ComponentRef } from "react";
import type { TextInputProps } from "react-native";

type TextInputRef = ComponentRef<typeof TextInput>;

const inputVariants = cva(
  "border-input native:leading-[1.25] text-foreground bg-background dark:bg-input/30 flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 font-sans text-base shadow-sm shadow-black/5",
);

const Input = forwardRef<TextInputRef, TextInputProps>(function Input(
  {
    className,
    placeholderTextColorClassName,
    selectionColorClassName,
    ...props
  },
  ref,
) {
  return (
    <TextInput
      ref={ref}
      className={cn(
        inputVariants(),
        props.editable === false && "opacity-50",
        className,
      )}
      placeholderTextColorClassName={cn(
        "accent-muted-foreground",
        placeholderTextColorClassName,
      )}
      selectionColorClassName={cn("accent-foreground", selectionColorClassName)}
      {...props}
    />
  );
});

export { inputVariants, Input };
