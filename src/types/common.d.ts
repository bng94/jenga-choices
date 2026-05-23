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
