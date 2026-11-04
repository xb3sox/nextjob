"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import * as React from "react";

import { cn } from "@workspace/ui";

function Drawer({ ...props }: DrawerPrimitive.Root.Props) {
  return (
    <DrawerPrimitive.Root data-slot="drawer" swipeDirection="down" {...props} />
  );
}

function DrawerTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerClose({ ...props }: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerContent({
  className,
  children,
  ...props
}: DrawerPrimitive.Popup.Props) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Backdrop
        data-slot="drawer-overlay"
        className={cn(
          "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 overscroll-contain bg-black/10 opacity-[calc(1-var(--drawer-swipe-progress,0))] transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0 supports-backdrop-filter:backdrop-blur-xs supports-[-webkit-touch-callout:none]:absolute",
        )}
      />
      <DrawerPrimitive.Viewport className="fixed inset-0 z-50 overscroll-contain">
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          className={cn(
            "bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[80vh] flex-col rounded-t-lg border-t shadow-lg outline-none",
            "transform-[translate3d(0,var(--translate-y,0),0)] transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] [--closed-transform:translate3d(0,calc(100%+2px),0)] [--translate-y:var(--drawer-swipe-movement-y)] data-ending-style:transform-(--closed-transform) data-starting-style:transform-(--closed-transform) data-swiping:duration-0",
            className,
          )}
          {...props}
        >
          <div
            aria-hidden="true"
            className="bg-muted mx-auto mt-4 h-2 w-[100px] shrink-0 rounded-full"
          />
          <DrawerPrimitive.Content className="flex flex-col overflow-auto overscroll-contain">
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col items-center gap-0.5 p-6 text-center md:gap-1.5",
        className,
      )}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-6", className)}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn(
        "text-foreground text-xl leading-tight font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
