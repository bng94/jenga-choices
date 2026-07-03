import type { CustomList } from "../types";
import { DEFAULT_LISTS } from "../data/defaults";

export function getFullListById(
  id: string,
  customLists: CustomList[],
): CustomList {
  const defaultList = DEFAULT_LISTS.find((l) => l.id === id);
  if (defaultList) return defaultList;
  // A dangling id (e.g. a deleted or never-saved list) falls back to the
  // first default list, so the game never shows an "Unknown" list.
  return customLists.find((l) => l.id === id) ?? DEFAULT_LISTS[0];
}

export function generateListId(): string {
  return `custom-${Date.now()}`;
}
