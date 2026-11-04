import { useParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";

import { ROOT_MENU_HREF } from "./types";

import type { Item, Menu } from "./types";

const flattenItems = (menu: Menu) => menu.flatMap((group) => group.items);

const findNodeByHref = (menu: Menu, href: string) => {
  if (href === ROOT_MENU_HREF) {
    return null;
  }

  const stack = [{ items: flattenItems(menu), parentHref: ROOT_MENU_HREF }];

  while (stack.length > 0) {
    const { items, parentHref } = stack.pop()!;

    for (const item of items) {
      if (item.href === href) {
        return { item, parentHref };
      }

      if (item.menu) {
        stack.push({
          items: flattenItems(item.menu),
          parentHref: item.href,
        });
      }
    }
  }

  return null;
};

export const useMenu = (menu: Menu) => {
  const pathname = usePathname();
  const params = useParams();

  const normalizedPathname = pathname.replace(
    `/${params.locale?.toString()}`,
    "",
  );

  const findItemByHref = useCallback(
    (href: string) => findNodeByHref(menu, href)?.item ?? null,
    [menu],
  );

  const findParentByHref = useCallback(
    (href: string) => findNodeByHref(menu, href)?.parentHref ?? null,
    [menu],
  );

  const itemForPath = findItemByHref(normalizedPathname);
  const parentHrefForPath = findParentByHref(normalizedPathname);
  const parentItemForPath = parentHrefForPath
    ? findItemByHref(parentHrefForPath)
    : null;
  const hrefFromPath =
    (itemForPath?.menu ? itemForPath.href : parentItemForPath?.href) ??
    ROOT_MENU_HREF;

  const [history, setHistory] = useState<{
    previous: string;
    next: string | null;
  }>({
    previous: parentHrefForPath ?? ROOT_MENU_HREF,
    next: itemForPath?.href ?? null,
  });
  const [currentHref, setCurrentHref] = useState(hrefFromPath);
  const [prevPathname, setPrevPathname] = useState(normalizedPathname);

  if (normalizedPathname !== prevPathname) {
    setPrevPathname(normalizedPathname);
    setHistory({
      previous: parentHrefForPath ?? ROOT_MENU_HREF,
      next: itemForPath?.href ?? null,
    });
    setCurrentHref(hrefFromPath);
  }

  const onBack = useCallback(() => {
    const parent = findParentByHref(currentHref) ?? ROOT_MENU_HREF;

    setHistory({
      previous: parent,
      next: currentHref,
    });
    setTimeout(() => {
      setCurrentHref(parent);
    });
  }, [findParentByHref, currentHref]);

  const onForward = useCallback(
    (href: string) => {
      setHistory({
        previous: currentHref,
        next: href,
      });
      setTimeout(() => {
        setCurrentHref(href);
      });
    },
    [currentHref],
  );

  const isActive = useCallback(
    (item: Item) => {
      function hasActive(item: Item): boolean {
        if (item.menu) {
          return item.menu.some((group) =>
            group.items.some((child) => hasActive(child)),
          );
        } else {
          const exact = item.exact ?? true;
          return exact
            ? normalizedPathname === item.href
            : normalizedPathname.startsWith(item.href);
        }
      }
      return hasActive(item);
    },
    [normalizedPathname],
  );

  return {
    isActive,
    history,
    onBack,
    onForward,
    currentHref,
    findItemByHref,
    findParentByHref,
  };
};
