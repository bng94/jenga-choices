import { DEFAULT_LIST_IDS, STORAGE_KEYS } from "@constants/storage";
import type { CustomList, GameSession } from "@types";
import { normalizeHouseRules } from "./houseRules";

export const loadCustomLists = (): CustomList[] => {
  try {
    const lists: CustomList[] =
      JSON.parse(localStorage.getItem(STORAGE_KEYS.customLists) ?? "null") ??
      [];
    // Migrate legacy string houseRules (and drop malformed values) on read;
    // the next save persists the normalized shape.
    return lists.map((l) => {
      const rules = normalizeHouseRules(l.houseRules);
      return rules.length
        ? { ...l, houseRules: rules }
        : { ...l, houseRules: undefined };
    });
  } catch {
    return [];
  }
};

export const saveCustomLists = (lists: CustomList[]): void => {
  localStorage.setItem(STORAGE_KEYS.customLists, JSON.stringify(lists));
};

export const loadClassicListId = (): string => {
  return (
    localStorage.getItem(STORAGE_KEYS.classicList) ?? DEFAULT_LIST_IDS.singles
  );
};

export const saveClassicListId = (id: string): void => {
  localStorage.setItem(STORAGE_KEYS.classicList, id);
};

export const loadClassicSpicyEnabled = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.spicyEnabled.classic) === "true";
};

export const saveClassicSpicyEnabled = (enabled: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.spicyEnabled.classic, String(enabled));
};

export const loadBoardListId = (): string => {
  return (
    localStorage.getItem(STORAGE_KEYS.boardList) ?? DEFAULT_LIST_IDS.singles
  );
};

export const saveBoardListId = (id: string): void => {
  localStorage.setItem(STORAGE_KEYS.boardList, id);
};

export const loadBoardSpicyEnabled = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.spicyEnabled.board) === "true";
};

export const saveBoardSpicyEnabled = (enabled: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.spicyEnabled.board, String(enabled));
};

/**
 * Restore a saved in-progress game, or null if there is none or it doesn't
 * belong to the given list (e.g. the active list changed since it was saved).
 */
export const loadGameSession = (listId: string): GameSession | null => {
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
};

export const saveGameSession = (session: GameSession): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.classicSession, JSON.stringify(session));
  } catch {
    // Storage full or unavailable — the game still works, it just won't survive a reload.
  }
};

export const clearGameSession = (): void => {
  localStorage.removeItem(STORAGE_KEYS.classicSession);
};

export const loadInfoPanelOpen = (key: string): boolean | null => {
  const saved = localStorage.getItem(key);
  if (saved === null) return null;
  return saved === "true";
};

export const saveInfoPanelOpen = (key: string, open: boolean): void => {
  localStorage.setItem(key, String(open));
};
