export type AppView = "classic" | "board";

export type GameMode = "classic" | "board";

export type DefaultListIds = "singles" | "truthDare" | "valentine";

export type ListId =
  | "default-singles"
  | "default-truthdare"
  | "default-valentine";

export type BlockType = "blank" | "numbered";
export type GamePhase = "setup" | "playing";
export type RevealStep = "td-choice" | "spicy-choice" | "prompt" | "blank";
export type NumberedOrder = "random" | "list";

export interface LastReveal {
  item: EditorItem;
  half: "truth" | "dare" | null;
  useSpicy: boolean;
}

/** An in-progress reveal, saved so a mid-reveal app close restores the same prompt. */
export interface ActiveReveal {
  item: EditorItem;
  step: RevealStep;
  half: "truth" | "dare" | null;
  spicy: boolean;
}

/**
 * A snapshot of an in-progress classic game, persisted to localStorage so the
 * game survives the phone sleeping, the tab being discarded, or the PWA being
 * relaunched mid-tower.
 */
export interface GameSession {
  listId: string;
  blockType: BlockType;
  numberedOrder: NumberedOrder;
  /** The full padded-to-54, shuffled item order at game start. */
  shuffledItems: EditorItem[];
  usedPositions: number[];
  spicyEnabled: boolean;
  lastReveal: LastReveal | null;
  lastWrittenReveal: LastReveal | null;
  activeReveal: ActiveReveal | null;
}
