"use client";

import { cn } from "@workspace/ui";

import { useWaitlistStore } from "./store";

export function WaitlistGradient() {
  const email = useWaitlistStore((state) => state.email);

  return (
    <div
      aria-hidden
      className="animate-fade-up pointer-events-none absolute inset-0 translate-y-32 opacity-0 [--animation-delay:500ms]"
    >
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-750 ease-in-out",
          "bg-[radial-gradient(125%_125%_at_50%_0%,var(--background)_50%,var(--primary)),radial-gradient(125%_125%_at_50%_90%,var(--background)_50%,var(--primary))]",
          email ? "opacity-0" : "opacity-100",
        )}
      />
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-750 ease-in-out",
          "bg-[radial-gradient(125%_125%_at_50%_0%,var(--background)_50%,var(--success)),radial-gradient(125%_125%_at_50%_90%,var(--background)_50%,var(--success))]",
          email ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
