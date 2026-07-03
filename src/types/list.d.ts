// src/types/list.d.ts

export interface StoredSingle {
  v: string; // value (main text)
  s?: string; // spicy text
}

export interface StoredTD {
  t: string; // truth
  d: string; // dare
  st?: string; // spicy truth
  sd?: string; // spicy dare
}

export type StoredItem = StoredSingle | StoredTD | null | undefined;

export interface EditorSingleItem {
  type: "single";
  value: string;
  spicy: string;
}

export interface EditorTDItem {
  type: "td";
  truth: string;
  dare: string;
  spicyTruth: string;
  spicyDare: string;
}

export type EditorItem = EditorSingleItem | EditorTDItem;

/**
 * `when` may be empty for rules migrated from the old free-text format.
 */
export interface HouseRule {
  /**
   * A short phrase describing the trigger for this rule,
   * e.g. "The tower falls".
   */
  when: string;
  /**
   * A short phrase describing the consequence of this rule,
   * e.g. "Rebuild it and do 10 jumping jacks".
   * Must be at least 2 characters long to be actionable.
   */
  then: string;
}

export interface CustomList {
  id: string;
  name: string;
  items: StoredItem[];
  houseRules?: HouseRule[];
}

export type SpicySlot = "spicy" | "spicyTruth" | "spicyDare";
export type MainField = "value" | "truth" | "dare";
export type HalfDragHalf = "truth" | "dare";

export interface HalfDragState {
  rowIdx: number;
  half: HalfDragHalf;
}

export interface SpicyDragState {
  rowIdx: number;
  slot: SpicySlot;
}

export interface HalfEmptyEntry {
  item: EditorTDItem;
  idx: number;
}

export interface SaveWarning {
  promotedItems: EditorItem[];
  halfEmpty: HalfEmptyEntry[];
}

export interface ExportSingle {
  prompt: string;
  spicy?: string;
}

export interface ExportTD {
  truth: string;
  dare: string;
  spicy_truth?: string;
  spicy_dare?: string;
}

export type ExportItem = ExportSingle | ExportTD;

export interface ExportFile {
  id: string;
  name: string;
  items: ExportItem[];
  /** Modern exports write HouseRule[]; older files may contain a plain string. */
  houseRules?: HouseRule[] | string;
}

export interface ImportPreview {
  name: string;
  totalItems: number;
  singles: number;
  tdPairs: number;
  spicyCount: number;
  rawItems: StoredItem[];
  houseRules?: HouseRule[];
}

export interface ImportError {
  message: string;
}

export type ImportResult =
  | { ok: true; preview: ImportPreview }
  | { ok: false; error: ImportError };
