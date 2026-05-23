import { STORAGE_KEYS } from "../constants/storage";
import type { CustomList } from "../types";

export function loadCustomLists(): CustomList[] {
  try {
    return (
      JSON.parse(localStorage.getItem(STORAGE_KEYS.customLists) ?? "null") ?? []
    );
  } catch {
    return [];
  }
}

export function saveCustomLists(lists: CustomList[]): void {
  localStorage.setItem(STORAGE_KEYS.customLists, JSON.stringify(lists));
}

export function loadClassicListId(): string {
  return localStorage.getItem(STORAGE_KEYS.classicList) ?? "default-singles";
}

export function saveClassicListId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.classicList, id);
}

export function loadClassicSpicyEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEYS.spicyEnabled.classic) === "true";
}

export function saveClassicSpicyEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEYS.spicyEnabled.classic, String(enabled));
}

export function loadBoardListId(): string {
  return localStorage.getItem(STORAGE_KEYS.boardList) ?? "default-singles";
}

export function saveBoardListId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.boardList, id);
}

export function loadBoardSpicyEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEYS.spicyEnabled.board) === "true";
}

export function saveBoardSpicyEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEYS.spicyEnabled.board, String(enabled));
}

export function loadInfoPanelOpen(key: string): boolean | null {
  const saved = localStorage.getItem(key);
  if (saved === null) return null;
  return saved === "true";
}

export function saveInfoPanelOpen(key: string, open: boolean): void {
  localStorage.setItem(key, String(open));
}
