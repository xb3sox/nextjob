import { MenuView } from "@expo/ui/community/menu";
import * as React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import type { MenuAction, NativeActionEvent } from "@expo/ui/community/menu";
import type { ButtonProps } from "@expo/ui/swift-ui";
import type { ImageSourcePropType } from "react-native";

export type SFSymbolName = NonNullable<ButtonProps["systemImage"]>;

export type ContextMenuCheckboxState = "on" | "off" | "mixed";

export interface ContextMenuIcon {
  ios?: SFSymbolName;
  android?: ImageSourcePropType;
}

export interface ContextMenuAction {
  title: string;
  icon?: ContextMenuIcon;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export interface ContextMenuCheckbox {
  type: "checkbox";
  title: string;
  icon?: ContextMenuIcon;
  disabled?: boolean;
  value: boolean | ContextMenuCheckboxState;
  onValueChange?: (
    next: Exclude<ContextMenuCheckboxState, "mixed">,
    previous: ContextMenuCheckboxState,
  ) => void;
}

export interface ContextMenuLabel {
  type: "label";
  title: string;
}

export interface ContextMenuSubmenu {
  type: "sub";
  title: string;
  icon?: ContextMenuIcon;
  disabled?: boolean;
  items: ContextMenuEntry[];
}

export type ContextMenuEntry =
  | ContextMenuAction
  | ContextMenuCheckbox
  | ContextMenuLabel
  | ContextMenuSubmenu;

export type ContextMenuSection = ContextMenuEntry[];

interface ContextMenuProps {
  trigger: React.ReactElement;
  sections: ContextMenuSection[];
  disabled?: boolean;
  fullWidth?: boolean;
}

export const ContextMenu = ({
  trigger,
  sections,
  disabled = false,
  fullWidth = false,
}: ContextMenuProps) => {
  const colorScheme: "dark" | "light" =
    useColorScheme() === "dark" ? "dark" : "light";
  const [size, setSize] = React.useState<{ width: number; height: number }>();
  const handlersRef = React.useRef(new Map<string, () => void>());

  const actions = React.useMemo(() => {
    const handlers = new Map<string, () => void>();
    return { menuActions: toMenuActions(sections, handlers), handlers };
  }, [sections]);

  React.useEffect(() => {
    handlersRef.current = actions.handlers;
  }, [actions.handlers]);

  const onPressAction = React.useCallback((event: NativeActionEvent) => {
    handlersRef.current.get(event.nativeEvent.event)?.();
  }, []);

  const resolvedTrigger = React.isValidElement(trigger) ? (
    trigger
  ) : (
    <View>{trigger}</View>
  );

  if (disabled || !hasMenuItems(sections)) {
    return resolvedTrigger;
  }

  const menuProps = {
    actions: actions.menuActions,
    colorScheme,
    onPressAction,
    shouldOpenOnLongPress: true,
  };

  if (Platform.OS === "android") {
    return (
      <View
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setSize((current) =>
            current?.width === width && current?.height === height
              ? current
              : { width, height },
          );
        }}
      >
        {resolvedTrigger}
        <MenuView {...menuProps} style={StyleSheet.absoluteFill}>
          <View style={size} />
        </MenuView>
      </View>
    );
  }

  if (!fullWidth) {
    return <MenuView {...menuProps}>{resolvedTrigger}</MenuView>;
  }

  return (
    <View
      className="w-full"
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setSize((current) =>
          current?.width === width ? current : { width, height },
        );
      }}
    >
      {size?.width ? (
        <MenuView {...menuProps}>
          <View style={{ width: size.width }}>{resolvedTrigger}</View>
        </MenuView>
      ) : (
        resolvedTrigger
      )}
    </View>
  );
};

const toMenuImage = (icon?: ContextMenuIcon): MenuAction["image"] => {
  if (!icon) {
    return undefined;
  }

  return Platform.OS === "ios" ? icon.ios : icon.android;
};

const checkboxState = (
  value: boolean | ContextMenuCheckboxState,
): ContextMenuCheckboxState =>
  typeof value === "boolean" ? (value ? "on" : "off") : value;

const hasActivatableEntry = (entries: ContextMenuEntry[]): boolean =>
  entries.some((entry) => {
    if ("type" in entry) {
      if (entry.type === "label") {
        return false;
      }

      if (entry.type === "sub") {
        return hasActivatableEntry(entry.items);
      }
    }

    return true;
  });

const hasMenuItems = (sections: ContextMenuSection[]) =>
  sections.some((section) => hasActivatableEntry(section));

const entryToMenuAction = (
  entry: ContextMenuEntry,
  id: string,
  handlers: Map<string, () => void>,
): MenuAction | null => {
  if ("type" in entry) {
    if (entry.type === "label") {
      if (!entry.title) {
        return null;
      }

      handlers.set(id, () => {});

      return {
        id,
        title: entry.title,
        attributes: { disabled: true },
      };
    }

    if (entry.type === "checkbox") {
      const previous = checkboxState(entry.value);

      handlers.set(id, () =>
        entry.onValueChange?.(previous === "on" ? "off" : "on", previous),
      );

      return {
        id,
        title: entry.title,
        image: toMenuImage(entry.icon),
        state: previous === "on" ? "on" : "off",
        attributes: entry.disabled ? { disabled: true } : undefined,
      };
    }

    if (entry.type === "sub") {
      const subactions = entriesToMenuActions(entry.items, id, handlers);
      if (subactions.length === 0) {
        return null;
      }

      return {
        id,
        title: entry.title,
        image: toMenuImage(entry.icon),
        attributes: entry.disabled ? { disabled: true } : undefined,
        subactions,
      };
    }
  }

  handlers.set(id, entry.onPress);

  return {
    id,
    title: entry.title,
    image: toMenuImage(entry.icon),
    attributes: {
      destructive: entry.destructive,
      disabled: entry.disabled,
    },
  };
};

const entriesToMenuActions = (
  entries: ContextMenuEntry[],
  prefix: string,
  handlers: Map<string, () => void>,
): MenuAction[] =>
  entries.flatMap((entry, index) => {
    const action = entryToMenuAction(entry, `${prefix}-${index}`, handlers);
    return action ? [action] : [];
  });

const toMenuActions = (
  sections: ContextMenuSection[],
  handlers: Map<string, () => void>,
): MenuAction[] =>
  sections.flatMap((section, sectionIndex) => {
    const subactions = entriesToMenuActions(
      section,
      `s${sectionIndex}`,
      handlers,
    );

    if (subactions.length === 0) {
      return [];
    }

    if (sections.length === 1) {
      return subactions;
    }

    return [
      {
        id: `section-${sectionIndex}`,
        title: "",
        displayInline: true,
        subactions,
      },
    ];
  });
