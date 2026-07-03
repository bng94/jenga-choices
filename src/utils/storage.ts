import { STORAGE_KEYS } from "../constants/storage";
import type { CustomList, GameSession } from "../types";

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

/**
 * Restore a saved in-progress game, or null if there is none or it doesn't
 * belong to the given list (e.g. the active list changed since it was saved).
 */
export function loadGameSession(listId: string): GameSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.classicSession);
    if (!raw) return null;
    const session = JSON.parse(raw) as GameSession;
    if (
      session.listId !== listId ||
      (session.blockType !== "blank" && session.blockType !== "numbered") ||
      !Array.isArray(session.shuffledItems) ||
      session.shuffledItems.length === 0 ||
      !Array.isArray(session.usedPositions)
    ) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveGameSession(session: GameSession): void {
  try {
    localStorage.setItem(STORAGE_KEYS.classicSession, JSON.stringify(session));
  } catch {
    // Storage full or unavailable — the game still works, it just won't survive a reload.
  }
}

export function clearGameSession(): void {
  localStorage.removeItem(STORAGE_KEYS.classicSession);
}

export function loadInfoPanelOpen(key: string): boolean | null {
  const saved = localStorage.getItem(key);
  if (saved === null) return null;
  return saved === "true";
}

export function saveInfoPanelOpen(key: string, open: boolean): void {
  localStorage.setItem(key, String(open));
}
