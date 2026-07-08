import type { DefaultListIds, ListId } from "@types";

export const STORAGE_KEYS = {
  customLists: "jenga_custom_lists",
  classicList: "jenga_classic_list",
  classicSession: "jenga_classic_session",
  boardList: "jenga_board_list",
  spicyEnabled: {
    classic: "jenga_spicy_classic",
    board: "jenga_spicy_board",
  },
  infoPanels: {
    classic: "info_classic",
    board: "info_board",
    lists: "info_lists",
  },
} as const;

export const DEFAULT_LIST_IDS: { [key in DefaultListIds]: ListId } = {
  singles: "default-singles",
  truthDare: "default-truthdare",
  valentine: "default-valentine",
} as const;
