import { useEffect } from "react";

const EDITABLE_TARGET_SELECTOR =
  "input, textarea, select, [contenteditable=''], [contenteditable='true']";

const isEditableTarget = (target: EventTarget | null) => {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest(EDITABLE_TARGET_SELECTOR))
  );
};

export const useThemeKeyboardShortcut = (onToggle: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key !== "t") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;

      event.preventDefault();
      onToggle();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToggle]);
};
