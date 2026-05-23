import type { CustomList, StoredItem } from "../types";
import { DEFAULT_LIST_IDS } from "../constants/storage";
import {
  DEFAULT_SINGLES_LIST,
  DEFAULT_TD_LIST,
  DEFAULT_VALENTINE_LIST,
} from "../data/defaults";

export function getListById(
  id: string,
  customLists: CustomList[],
): StoredItem[] {
  if (id === DEFAULT_LIST_IDS.singles) return DEFAULT_SINGLES_LIST;
  if (id === DEFAULT_LIST_IDS.truthDare) return DEFAULT_TD_LIST;
  if (id === DEFAULT_LIST_IDS.valentine) return DEFAULT_VALENTINE_LIST;
  return customLists.find((l) => l.id === id)?.items ?? DEFAULT_SINGLES_LIST;
}

export function getListNameById(id: string, customLists: CustomList[]): string {
  if (id === DEFAULT_LIST_IDS.singles) return "Classic Singles";
  if (id === DEFAULT_LIST_IDS.truthDare) return "Truth or Dare";
  if (id === DEFAULT_LIST_IDS.valentine) return "Valentine's Day";
  return customLists.find((l) => l.id === id)?.name ?? "Unknown";
}

export function generateListId(): string {
  return `custom-${Date.now()}`;
}
