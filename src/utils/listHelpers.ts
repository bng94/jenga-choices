import type { CustomList } from "../types";
import { DEFAULT_LIST_IDS } from "../constants/storage";
import {
  DEFAULT_SINGLES_LIST,
  DEFAULT_TD_LIST,
  DEFAULT_VALENTINE_LIST,
} from "../data/defaults";

export function getFullListById(
  id: string,
  customLists: CustomList[],
): CustomList {
  if (id === DEFAULT_LIST_IDS.singles)
    return { id, name: "Classic Singles", items: DEFAULT_SINGLES_LIST };
  if (id === DEFAULT_LIST_IDS.truthDare)
    return { id, name: "Truth or Dare", items: DEFAULT_TD_LIST };
  if (id === DEFAULT_LIST_IDS.valentine)
    return { id, name: "Valentine's Day", items: DEFAULT_VALENTINE_LIST };
  // A dangling id (e.g. a deleted or never-saved list) falls back to the
  // real default list, so the game never shows an "Unknown" list.
  return (
    customLists.find((l: CustomList) => l.id === id) ?? {
      id: DEFAULT_LIST_IDS.singles,
      name: "Classic Singles",
      items: DEFAULT_SINGLES_LIST,
    }
  );
}

export function generateListId(): string {
  return `custom-${Date.now()}`;
}
