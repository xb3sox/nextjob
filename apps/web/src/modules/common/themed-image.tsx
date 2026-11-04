import Image from "next/image";

import { cn } from "@workspace/ui";

import type { ComponentProps } from "react";

interface ThemedImageProps extends Omit<ComponentProps<typeof Image>, "src"> {
  light: string;
  dark: string;
}

export const ThemedImage = ({
  light,
  dark,
  className,
  priority,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px",
  ...props
}: ThemedImageProps) => {
  const isPriority = priority ?? false;

  return (
    <>
      <Image
        {...props}
        src={light}
        sizes={sizes}
        priority={isPriority}
        className={cn(className, "dark:hidden")}
      />
      <Image
        {...props}
        src={dark}
        sizes={sizes}
        priority={false}
        loading={isPriority ? "eager" : (props.loading ?? "lazy")}
        fetchPriority={isPriority ? "high" : props.fetchPriority}
        className={cn(className, "hidden dark:block")}
      />
    </>
  );
};
