import { useState, useRef, useEffect, type DragEvent, useMemo } from "react";
import type {
  CustomList,
  EditorItem,
  EditorSingleItem,
  EditorTDItem,
  StoredItem,
  HalfDragHalf,
  SpicySlot,
  SaveWarning,
} from "../../types";
import {
  deserializeItem,
  serializeItem,
  itemHasSpicy,
} from "../../utils/itemModel";
import SpicyToggle from "../SpicyToggle/SpicyToggle";
import HalfRow from "./editor/HalfRow";
import SpicyFieldRow from "./editor/SpicyFieldRow";
import KeepWhichDialog from "./editor/KeepWhichDialog";
import SaveWarningDialog from "./editor/SaveWarningDialog";
import "./ListEditor.css";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import PastePromptsModal from "../PastePromptsModal/PastePromptsModal";
import ListEditorInfoPanel from "./ListEditorInfoPanel";

/**
 * Pads rawItems to exactly 54 slots (filling missing ones with ""),
 * then deserializes each StoredItem into EditorItem format.
 */
function normalizeItems(rawItems: StoredItem[]): EditorItem[] {
  const padded = [...rawItems];
  while (padded.length < 54) padded.push({ v: "" });
  return padded.slice(0, 54).map(deserializeItem);
}

/**
 * Returns true if any item in the array has a non-empty spicy field.
 */
function anyHasSpicy(items: EditorItem[]): boolean {
  return items.some(itemHasSpicy);
}

/**
 * Compares two EditorItem arrays by value.
 * Swapping identical content or empty rows returns true (no real change).
 */
function itemsEqual(a: EditorItem[], b: EditorItem[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, i) => JSON.stringify(item) === JSON.stringify(b[i]));
}

interface ListEditorProps {
  list: CustomList;
  isNew: boolean;
  onSave: (updated: CustomList) => void;
  onClose: () => void;
}

export default function ListEditor({
  list,
  isNew,
  onSave,
  onClose,
}: ListEditorProps) {
  /** The display name of the list being edited. Saved on submit. */
  const [name, setName] = useState(list.name);

  /**
   * The 54-slot working copy of the list in editor format.
   * Serialized back to StoredItem[] only on save.
   */
  const [items, setItems] = useState<EditorItem[]>(() =>
    normalizeItems(list.items),
  );

  /**
   * Controls whether spicy input rows are visible.
   * Auto-enabled on load if the list already has spicy content.
   */
  const [spicyVisible, setSpicyVisible] = useState(() =>
    anyHasSpicy(normalizeItems(list.items)),
  );

  /**
   * Index of the TD item currently awaiting a "keep which half?" decision.
   * Drives the KeepWhichDialog modal.
   */
  const [keepWhichIdx, setKeepWhichIdx] = useState<number | null>(null);

  /**
   * Holds the save warning data when pre-save validation finds half-empty TD items.
   * Drives the SaveWarningDialog modal.
   */
  const [saveWarning, setSaveWarning] = useState<SaveWarning | null>(null);

  /**
   * Set of row indices currently highlighted with a warning style.
   * Clears automatically when the user types in a warned row.
   */
  const [warningSet, setWarningSet] = useState<Set<number>>(new Set());

  const initialItems = useMemo(() => normalizeItems(list.items), [list.id]);
  const initialName = list.name;

  const unSavedChanges =
    !itemsEqual(items, initialItems) || name !== initialName;

  /**
   * True when the user tries to exit while unSavedChanges is true.
   * Drives the ConfirmDialog.
   */
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  /** Controls visibility of the paste prompts modal. */
  const [showPaste, setShowPaste] = useState(false);

  /** Index of the row currently being dragged (☰ handle). null when not dragging. */
  const rowDragIdx = useRef<number | null>(null);

  /** Index of the row currently under the row drag cursor. */
  const rowDragOverIdx = useRef<number | null>(null);

  /**
   * Tracks the active half drag (⠿T / ⠿D / S⠿ handle).
   * null when no half drag is in progress.
   */
  const halfDragRef = useRef<{ rowIdx: number; half: HalfDragHalf } | null>(
    null,
  );

  /** Key string of the half slot currently highlighted during a half drag. */
  const halfDragOver = useRef<string | null>(null);

  /**
   * Tracks the active spicy drag (🔥⠿ handle).
   * null when no spicy drag is in progress.
   */
  const spicyDragRef = useRef<{ rowIdx: number; slot: SpicySlot } | null>(null);

  /** Key string of the slot currently highlighted during a spicy drag. */
  const spicyDragOver = useRef<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  /** Number of rows that have at least one filled field. Shown in the warning banner. */
  const filledCount = items.filter((it) =>
    it.type === "td"
      ? (it as EditorTDItem).truth.trim() || (it as EditorTDItem).dare.trim()
      : (it as EditorSingleItem).value.trim(),
  ).length;

  // All three exit paths (backdrop, ✕, Cancel) go through this.

  const handleClose = () => {
    if (unSavedChanges) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  // Focus panel on open; name input gets autoFocus for new lists instead.
  useEffect(() => {
    if (!isNew) panelRef.current?.focus();
  }, [isNew]);

  // Escape key — only fires when no child modal is open.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key !== "Escape" ||
        showExitConfirm ||
        showPaste ||
        keepWhichIdx !== null ||
        saveWarning !== null
      ) return;
      if (unSavedChanges) setShowExitConfirm(true);
      else onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [unSavedChanges, onClose, showExitConfirm, showPaste, keepWhichIdx, saveWarning]);

  const patch = (idx: number, changes: Partial<EditorItem>) =>
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...changes } as EditorItem;
      return next;
    });

  /**
   * Updates a named field on the item at `idx`.
   * Only marks dirty when the new value differs from the current one.
   */
  const handleChange = (idx: number, field: string, val: string) => {
    const current =
      (items[idx] as unknown as Record<string, string>)[field] ?? "";
    patch(idx, { [field]: val } as Partial<EditorItem>);
    if (warningSet.has(idx)) {
      setWarningSet((prev) => {
        const s = new Set(prev);
        s.delete(idx);
        return s;
      });
    }
  };

  /**
   * Converts a single item at `idx` to TD format.
   * Always a structural change — marks dirty unconditionally.
   */
  const handleToTD = (idx: number) => {
    setItems((prev) => {
      const next = [...prev];
      const cur = next[idx] as EditorSingleItem;
      next[idx] = {
        type: "td",
        truth: cur.value,
        dare: "",
        spicyTruth: cur.spicy,
        spicyDare: "",
      };
      return next;
    });
  };

  /**
   * Converts a TD item at `idx` to single format.
   * If both halves are filled, opens KeepWhichDialog.
   * Always marks dirty when it executes.
   */
  const handleToSingle = (idx: number) => {
    const it = items[idx] as EditorTDItem;
    const hasTruth = it.truth.trim();
    const hasDare = it.dare.trim();
    if (hasTruth && hasDare) {
      setKeepWhichIdx(idx);
      return;
    }
    setItems((prev) => {
      const next = [...prev];
      const src = next[idx] as EditorTDItem;
      next[idx] = {
        type: "single",
        value: hasTruth ? src.truth : src.dare,
        spicy: hasTruth ? src.spicyTruth : src.spicyDare,
      };
      return next;
    });
  };

  /**
   * Called after the user picks a half in KeepWhichDialog.
   * Marks dirty — the user made a deliberate choice.
   */
  const handleKeepWhich = (half: "truth" | "dare") => {
    const idx = keepWhichIdx!;
    setItems((prev) => {
      const next = [...prev];
      const src = next[idx] as EditorTDItem;
      next[idx] = {
        type: "single",
        value: half === "truth" ? src.truth : src.dare,
        spicy: half === "truth" ? src.spicyTruth : src.spicyDare,
      };
      return next;
    });
    setKeepWhichIdx(null);
  };

  /**
   * Removes one half of a TD item, converting to single using the other half.
   * Always a structural change — marks dirty.
   */
  const handleDeleteHalf = (idx: number, half: "truth" | "dare") => {
    setItems((prev) => {
      const next = [...prev];
      const src = next[idx] as EditorTDItem;
      next[idx] = {
        type: "single",
        value: half === "truth" ? src.dare : src.truth,
        spicy: half === "truth" ? src.spicyDare : src.spicyTruth,
      };
      return next;
    });
  };

  /**
   * Resets the item at `idx` to an empty single slot.
   * Only marks dirty if the slot was not already empty.
   */
  const handleClear = (idx: number) =>
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { type: "single", value: "", spicy: "" };
      return next;
    });

  const onRowDragStart = (e: DragEvent, idx: number) => {
    if (halfDragRef.current || spicyDragRef.current) {
      e.preventDefault();
      return;
    }
    rowDragIdx.current = idx;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `row:${idx}`);
    (e.currentTarget as HTMLElement)
      .closest(".editor-item")
      ?.classList.add("dragging");
  };

  const onRowDragEnd = (e: DragEvent) => {
    (e.currentTarget as HTMLElement)
      .closest(".editor-item")
      ?.classList.remove("dragging");
    document
      .querySelectorAll(".editor-item.drag-over-row")
      .forEach((el) => el.classList.remove("drag-over-row"));
    rowDragIdx.current = null;
    rowDragOverIdx.current = null;
  };

  const onRowDragOver = (e: DragEvent, idx: number) => {
    if (halfDragRef.current || spicyDragRef.current) return;
    if (!e.dataTransfer.types.includes("text/plain")) return;
    e.preventDefault();
    if (rowDragOverIdx.current !== idx) {
      document
        .querySelectorAll(".editor-item.drag-over-row")
        .forEach((el) => el.classList.remove("drag-over-row"));
      rowDragOverIdx.current = idx;
      (e.currentTarget as HTMLElement).classList.add("drag-over-row");
    }
  };

  const onRowDragLeave = (e: DragEvent) => {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node))
      (e.currentTarget as HTMLElement).classList.remove("drag-over-row");
  };

  /**
   * Performs the row reorder.
   * Only marks dirty if the two rows had different content — swapping
   * two empty rows or two identical rows is a no-op.
   */
  const onRowDrop = (e: DragEvent, dropIdx: number) => {
    (e.currentTarget as HTMLElement).classList.remove("drag-over-row");
    if (halfDragRef.current || spicyDragRef.current) return;
    const from = rowDragIdx.current;
    if (from === null || from === dropIdx) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(dropIdx, 0, moved);
      return next;
    });
    rowDragIdx.current = null;
  };

  const clearHalfOver = () =>
    document
      .querySelectorAll(".td-half.half-drag-over")
      .forEach((el) => el.classList.remove("half-drag-over"));

  const onHalfDragStart = (
    e: DragEvent,
    rowIdx: number,
    half: HalfDragHalf,
  ) => {
    e.stopPropagation();
    halfDragRef.current = { rowIdx, half };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `half:${rowIdx}:${half}`);
    (e.currentTarget as HTMLElement).classList.add("half-dragging");
  };

  /** Fires on drag cancel too — never marks dirty here. */
  const onHalfDragEnd = (e: DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove("half-dragging");
    clearHalfOver();
    halfDragRef.current = null;
    halfDragOver.current = null;
  };

  const onHalfDragOver = (e: DragEvent, rowIdx: number, half: HalfDragHalf) => {
    if (!halfDragRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const key = `${rowIdx}:${half}`;
    if (halfDragOver.current !== key) {
      clearHalfOver();
      halfDragOver.current = key;
      (e.currentTarget as HTMLElement).classList.add("half-drag-over");
    }
  };

  const onHalfDragLeave = (e: DragEvent) => {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node))
      (e.currentTarget as HTMLElement).classList.remove("half-drag-over");
  };

  const getHalfText = (item: EditorItem, half: HalfDragHalf): string =>
    item.type === "td"
      ? (item as EditorTDItem)[half]
      : (item as EditorSingleItem).value;

  const getHalfSpicy = (item: EditorItem, half: HalfDragHalf): string => {
    if (item.type === "td") {
      const td = item as EditorTDItem;
      return half === "truth" ? td.spicyTruth : td.spicyDare;
    }
    return (item as EditorSingleItem).spicy;
  };

  const applyHalf = (
    item: EditorItem,
    half: HalfDragHalf,
    text: string,
    spicy: string,
  ): EditorItem => {
    if (item.type === "td") {
      const td = item as EditorTDItem;
      return half === "truth"
        ? { ...td, truth: text, spicyTruth: spicy }
        : { ...td, dare: text, spicyDare: spicy };
    }
    return { ...(item as EditorSingleItem), value: text, spicy };
  };

  /**
   * Performs the half drop.
   * Only marks dirty if the swap produced a real change in content.
   * Swapping two slots with identical text (including both empty) = no dirty.
   */
  const onHalfDrop = (e: DragEvent, toRowIdx: number, toHalf: HalfDragHalf) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).classList.remove("half-drag-over");
    const src = halfDragRef.current;
    if (!src) return;

    setItems((prev) => {
      const next = prev.map((it) => ({ ...it }));

      if (src.rowIdx === toRowIdx) {
        if (src.half === toHalf) return next;

        const item = { ...next[src.rowIdx] } as EditorTDItem;
        const fromText = src.half === "truth" ? item.truth : item.dare;
        const fromSpicy =
          src.half === "truth" ? item.spicyTruth : item.spicyDare;
        const toText = toHalf === "truth" ? item.truth : item.dare;
        const toSpicy = toHalf === "truth" ? item.spicyTruth : item.spicyDare;
        const shouldSwapSpicy = fromSpicy.trim() !== "";

        const result = { ...item };
        if (src.half === "truth") {
          result.truth = toText;
          result.spicyTruth = shouldSwapSpicy ? toSpicy : fromSpicy;
        } else {
          result.dare = toText;
          result.spicyDare = shouldSwapSpicy ? toSpicy : fromSpicy;
        }
        if (toHalf === "truth") {
          result.truth = fromText;
          result.spicyTruth = shouldSwapSpicy ? fromSpicy : toSpicy;
        } else {
          result.dare = fromText;
          result.spicyDare = shouldSwapSpicy ? fromSpicy : toSpicy;
        }

        next[src.rowIdx] = result;
        return next;
      }

      const fromItem = { ...next[src.rowIdx] } as EditorItem;
      const toItem = { ...next[toRowIdx] } as EditorItem;
      const fromText = getHalfText(fromItem, src.half);
      const fromSpicy = getHalfSpicy(fromItem, src.half);
      const toText = getHalfText(toItem, toHalf);
      const toSpicy = getHalfSpicy(toItem, toHalf);
      const shouldSwapSpicy = fromSpicy.trim() !== "";

      next[src.rowIdx] = applyHalf(
        fromItem,
        src.half,
        toText,
        shouldSwapSpicy ? toSpicy : fromSpicy,
      );
      next[toRowIdx] = applyHalf(
        toItem,
        toHalf,
        fromText,
        shouldSwapSpicy ? fromSpicy : toSpicy,
      );

      return next;
    });

    halfDragRef.current = null;
    halfDragOver.current = null;
  };

  const clearSpicyOver = () =>
    document
      .querySelectorAll(".spicy-drag-over,.main-drag-over")
      .forEach((el) => {
        el.classList.remove("spicy-drag-over");
        el.classList.remove("main-drag-over");
      });

  const onSpicyDragStart = (e: DragEvent, rowIdx: number, slot: SpicySlot) => {
    e.stopPropagation();
    spicyDragRef.current = { rowIdx, slot };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `spicy:${rowIdx}:${slot}`);
    (e.currentTarget as HTMLElement).classList.add("half-dragging");
  };

  /** Fires on drag cancel too — never marks dirty here. */
  const onSpicyDragEnd = (e: DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove("half-dragging");
    clearSpicyOver();
    spicyDragRef.current = null;
    spicyDragOver.current = null;
  };

  const onAnyDragOver = (e: DragEvent, key: string, className: string) => {
    if (!spicyDragRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    if (spicyDragOver.current !== key) {
      clearSpicyOver();
      spicyDragOver.current = key;
      (e.currentTarget as HTMLElement).classList.add(className);
    }
  };

  const onAnyDragLeave = (e: DragEvent) => {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      (e.currentTarget as HTMLElement).classList.remove("spicy-drag-over");
      (e.currentTarget as HTMLElement).classList.remove("main-drag-over");
    }
  };

  const resolveSpicyField = (item: EditorItem, slot: SpicySlot): string => {
    if (item.type === "single") return "spicy";
    if (slot === "spicy") return "spicyTruth";
    return slot;
  };

  /** Spicy → spicy: swaps two spicy values. Only dirty if they differed. */
  const onSpicyDropOnSpicy = (
    e: DragEvent,
    toRowIdx: number,
    toSlot: SpicySlot,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).classList.remove("spicy-drag-over");
    const src = spicyDragRef.current;
    if (!src || (src.rowIdx === toRowIdx && src.slot === toSlot)) return;

    setItems((prev) => {
      const next = prev.map((it) => ({ ...it }));
      const fromItem = next[src.rowIdx] as Record<string, string>;
      const toItem = next[toRowIdx] as Record<string, string>;
      const realFrom = resolveSpicyField(next[src.rowIdx], src.slot);
      const realTo = resolveSpicyField(next[toRowIdx], toSlot);
      const tmp = fromItem[realFrom] ?? "";
      fromItem[realFrom] = toItem[realTo] ?? "";
      toItem[realTo] = tmp;
      return next;
    });

    spicyDragRef.current = null;
    spicyDragOver.current = null;
  };

  /** Spicy → main: swaps spicy value with a main text slot. Only dirty if they differed. */
  const onSpicyDropOnMain = (
    e: DragEvent,
    toRowIdx: number,
    mainField: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).classList.remove("main-drag-over");
    const src = spicyDragRef.current;
    if (!src) return;

    setItems((prev) => {
      const next = prev.map((it) => ({ ...it }));
      const fromItem = next[src.rowIdx] as Record<string, string>;
      const toItem = next[toRowIdx] as Record<string, string>;
      const realFrom = resolveSpicyField(next[src.rowIdx], src.slot);
      const spicyText = fromItem[realFrom] ?? "";
      const mainText = toItem[mainField] ?? "";
      fromItem[realFrom] = mainText;
      toItem[mainField] = spicyText;
      return next;
    });

    spicyDragRef.current = null;
    spicyDragOver.current = null;
  };

  /**
   * Single-with-spicy drag onto another spicy slot.
   * Swaps the full single (value + spicy) with target's (main + spicy).
   * Only dirty if content actually changed.
   */
  const onSingleSpicyDropOnSpicySlot = (
    e: DragEvent,
    toRowIdx: number,
    toSlot: SpicySlot,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).classList.remove("spicy-drag-over");
    const src = spicyDragRef.current;
    if (!src) return;

    setItems((prev) => {
      const next = prev.map((it) => ({ ...it }));
      const fromItem = { ...next[src.rowIdx] } as EditorItem;
      const toItem = { ...next[toRowIdx] } as EditorItem;

      const fromValue = (fromItem as EditorSingleItem).value;
      const fromSpicy = (fromItem as EditorSingleItem).spicy;

      const toMain =
        toItem.type === "single"
          ? (toItem as EditorSingleItem).value
          : toSlot === "spicyTruth"
            ? (toItem as EditorTDItem).truth
            : (toItem as EditorTDItem).dare;

      const toSpicyKey = resolveSpicyField(toItem, toSlot);
      const toSpicyVal =
        (toItem as unknown as Record<string, string>)[toSpicyKey] ?? "";

      next[src.rowIdx] = {
        ...(fromItem as EditorSingleItem),
        value: toMain,
        spicy: toSpicyVal,
      };

      if (toItem.type === "single") {
        next[toRowIdx] = {
          ...(toItem as EditorSingleItem),
          value: fromValue,
          spicy: fromSpicy,
        };
      } else {
        const td = { ...(toItem as EditorTDItem) };
        if (toSlot === "spicyTruth") {
          td.truth = fromValue;
          td.spicyTruth = fromSpicy;
        } else {
          td.dare = fromValue;
          td.spicyDare = fromSpicy;
        }
        next[toRowIdx] = td;
      }

      return next;
    });

    spicyDragRef.current = null;
    spicyDragOver.current = null;
  };

  const spicyHandleProps = (rowIdx: number, slot: SpicySlot) => ({
    draggable: true as const,
    onDragStart: (e: DragEvent<HTMLDivElement>) =>
      onSpicyDragStart(e, rowIdx, slot),
    onDragEnd: onSpicyDragEnd,
  });

  /**
   * Drop zone props for a spicy field.
   * Accepts half drags (main ↔ spicy swap) and spicy drags (spicy ↔ spicy or full single swap).
   */
  const spicyDropProps = (rowIdx: number, slot: SpicySlot) => ({
    onDragOver: (e: DragEvent<HTMLDivElement>) => {
      if (halfDragRef.current) {
        e.preventDefault();
        e.stopPropagation();
        const key = `spicy_${rowIdx}_${slot}`;
        if (spicyDragOver.current !== key) {
          clearSpicyOver();
          spicyDragOver.current = key;
          (e.currentTarget as HTMLElement).classList.add("spicy-drag-over");
        }
        return;
      }
      if (spicyDragRef.current) {
        onAnyDragOver(e, `${rowIdx}:${slot}`, "spicy-drag-over");
      }
    },
    onDragLeave: onAnyDragLeave,
    onDrop: (e: DragEvent<HTMLDivElement>) => {
      if (halfDragRef.current) {
        e.preventDefault();
        e.stopPropagation();
        (e.currentTarget as HTMLElement).classList.remove("spicy-drag-over");
        const halfSrc = halfDragRef.current;

        setItems((prev) => {
          const next = prev.map((it) => ({ ...it }));
          const fromItem = next[halfSrc.rowIdx] as Record<string, string>;
          const toItem = next[rowIdx] as Record<string, string>;
          const halfField: string =
            (next[halfSrc.rowIdx] as EditorItem).type === "single"
              ? "value"
              : halfSrc.half;
          const spicyField = resolveSpicyField(
            next[rowIdx] as EditorItem,
            slot,
          );
          const halfText = fromItem[halfField] ?? "";
          const spicyText = toItem[spicyField] ?? "";
          fromItem[halfField] = spicyText;
          toItem[spicyField] = halfText;
          return next;
        });

        halfDragRef.current = null;
        halfDragOver.current = null;
        return;
      }

      const src = spicyDragRef.current;
      if (!src) return;

      const srcItem = items[src.rowIdx] as EditorSingleItem;
      const isSingleWithSpicy =
        srcItem.type === "single" &&
        srcItem.value.trim() !== "" &&
        srcItem.spicy.trim() !== "";

      if (isSingleWithSpicy) {
        onSingleSpicyDropOnSpicySlot(e, rowIdx, slot);
      } else {
        onSpicyDropOnSpicy(e, rowIdx, slot);
      }
    },
  });

  const mainDropOverProps = (rowIdx: number, mainField: string) => ({
    onDragOver: (e: DragEvent<HTMLDivElement>) =>
      spicyDragRef.current
        ? onAnyDragOver(e, `main_${rowIdx}_${mainField}`, "main-drag-over")
        : undefined,
    onDragLeave: onAnyDragLeave,
    onDrop: (e: DragEvent<HTMLDivElement>) =>
      spicyDragRef.current
        ? onSpicyDropOnMain(e, rowIdx, mainField)
        : undefined,
  });

  const halfDropProps = (rowIdx: number, half: HalfDragHalf) => ({
    onDragOver: (e: DragEvent<HTMLDivElement>) =>
      halfDragRef.current
        ? onHalfDragOver(e, rowIdx, half)
        : spicyDragRef.current
          ? onAnyDragOver(e, `main_${rowIdx}_${half}`, "main-drag-over")
          : undefined,
    onDragLeave: onHalfDragLeave,
    onDrop: (e: DragEvent<HTMLDivElement>) =>
      halfDragRef.current
        ? onHalfDrop(e, rowIdx, half)
        : spicyDragRef.current
          ? onSpicyDropOnMain(e, rowIdx, half)
          : undefined,
  });

  const singleHalfDropProps = (rowIdx: number) => ({
    onDragOver: (e: DragEvent<HTMLDivElement>) =>
      halfDragRef.current
        ? onHalfDragOver(e, rowIdx, "truth")
        : spicyDragRef.current
          ? onAnyDragOver(e, `main_${rowIdx}_value`, "main-drag-over")
          : undefined,
    onDragLeave: onHalfDragLeave,
    onDrop: (e: DragEvent<HTMLDivElement>) =>
      halfDragRef.current
        ? onHalfDrop(e, rowIdx, "truth")
        : spicyDragRef.current
          ? onSpicyDropOnMain(e, rowIdx, "value")
          : undefined,
  });

  const handleSave = () => {
    const promoted = items.map((item): EditorItem => {
      if (item.type === "single") {
        const s = item as EditorSingleItem;
        if (!s.value.trim() && s.spicy.trim())
          return { ...s, value: s.spicy, spicy: "" };
      }
      if (item.type === "td") {
        let td = item as EditorTDItem;
        if (!td.truth.trim() && td.spicyTruth.trim())
          td = { ...td, truth: td.spicyTruth, spicyTruth: "" };
        if (!td.dare.trim() && td.spicyDare.trim())
          td = { ...td, dare: td.spicyDare, spicyDare: "" };
        return td;
      }
      return item;
    });

    const halfEmpty = promoted
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => {
        if (item.type !== "td") return false;
        const td = item as EditorTDItem;
        return (
          (td.truth.trim() && !td.dare.trim()) ||
          (!td.truth.trim() && td.dare.trim())
        );
      })
      .map(({ item, idx }) => ({ item: item as EditorTDItem, idx }));

    if (halfEmpty.length > 0) {
      setSaveWarning({ promotedItems: promoted, halfEmpty });
      return;
    }

    onSave({
      ...list,
      name: name.trim() || "Unnamed List",
      items: promoted.map(serializeItem),
    });
  };

  const handleSaveAndConvert = (promotedItems: EditorItem[]) => {
    const fixed = promotedItems.map((item): EditorItem => {
      if (item.type !== "td") return item;
      const td = item as EditorTDItem;
      const hasTruth = td.truth.trim();
      const hasDare = td.dare.trim();
      if ((hasTruth && !hasDare) || (!hasTruth && hasDare)) {
        return {
          type: "single",
          value: hasTruth ? td.truth : td.dare,
          spicy: hasTruth ? td.spicyTruth : td.spicyDare,
        };
      }
      return item;
    });
    setSaveWarning(null);
    onSave({
      ...list,
      name: name.trim() || "Unnamed List",
      items: fixed.map(serializeItem),
    });
  };

  const handleFixThem = (promotedItems: EditorItem[]) => {
    setItems(promotedItems);
    const idxSet = new Set(saveWarning!.halfEmpty.map(({ idx }) => idx));
    setWarningSet(idxSet);
    setSaveWarning(null);
    setTimeout(() => {
      const first = saveWarning!.halfEmpty[0]?.idx;
      if (first !== undefined) {
        document
          .querySelector(`.editor-item[data-idx="${first}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  /** Number of empty slots available for paste to fill. */
  const emptySlotCount = items.filter(
    (it) =>
      it.type === "single" && (it as EditorSingleItem).value.trim() === "",
  ).length;

  /**
   * Receives parsed items from PastePromptsModal and fills empty slots
   * from the top down, leaving existing content untouched.
   */
  const handlePasteConfirm = (
    pastedItems: import("../../types").StoredItem[],
  ) => {
    setItems((prev) => {
      const next = [...prev];
      let pasteIdx = 0;
      for (let i = 0; i < next.length && pasteIdx < pastedItems.length; i++) {
        const cur = next[i] as EditorSingleItem;
        if (cur.type === "single" && cur.value.trim() === "") {
          next[i] = deserializeItem(pastedItems[pasteIdx]);
          pasteIdx++;
        }
      }
      return next;
    });
    setShowPaste(false);
  };

  return (
    <div
      className="editor-overlay"
      onClick={(e) => {
        e.stopPropagation();
        handleClose();
      }}
    >
      <div
        ref={panelRef}
        className="editor-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="editor-header">
          <div className="editor-title-block">
            <div className="editor-title-content">
              <div className="editor-title" id="editor-title">
                {isNew ? "Create List" : "Edit List"}
              </div>
              <ListEditorInfoPanel />
            </div>
            <div className="editor-subtitle">
              {filledCount !== 54 ? `${filledCount} / 54 items` : "54 items"}
              {unSavedChanges ? " · unsaved changes" : ""}
            </div>
          </div>
          <div className="editor-header-actions">
            <button
              className="editor-paste-btn"
              onClick={() => setShowPaste(true)}
              title="Paste prompts in bulk"
            >
              📋 Paste
            </button>
            <SpicyToggle
              enabled={spicyVisible}
              onToggle={() => setSpicyVisible((v) => !v)}
              variant="editor"
            />
            <button className="editor-close" onClick={handleClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="editor-body">
          <div className="editor-name-row">
            <input
              className="editor-name-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              placeholder="List name..."
              maxLength={40}
              autoFocus={isNew}
            />
          </div>

          <div className="editor-items-list">
            {items.map((item, idx) => {
              const isTD = item.type === "td";
              const single = item as EditorSingleItem;
              const td = item as EditorTDItem;

              return (
                <div
                  key={idx}
                  className={`editor-item ${warningSet.has(idx) ? "item-warning" : ""}`}
                  data-idx={idx}
                  onDragOver={(e) => onRowDragOver(e, idx)}
                  onDragLeave={onRowDragLeave}
                  onDrop={(e) => onRowDrop(e, idx)}
                >
                  <div
                    className="drag-handle"
                    draggable
                    title="Drag to reorder this row"
                    onDragStart={(e) => onRowDragStart(e, idx)}
                    onDragEnd={onRowDragEnd}
                  >
                    ☰
                  </div>

                  <div className="item-num">{idx + 1}</div>

                  <div className="item-inputs">
                    <div className="item-type-toggle">
                      <button
                        className={`type-btn ${!isTD ? "active single" : ""}`}
                        onClick={() => isTD && handleToSingle(idx)}
                      >
                        Single
                      </button>
                      <button
                        className={`type-btn ${isTD ? "active td" : ""}`}
                        onClick={() => !isTD && handleToTD(idx)}
                      >
                        Truth/Dare
                      </button>
                    </div>

                    {!isTD ? (
                      <>
                        <div
                          className="td-half single-drop-target"
                          {...singleHalfDropProps(idx)}
                        >
                          <div
                            className="half-drag-handle single-handle"
                            draggable
                            title="Drag to swap this single with any slot"
                            onDragStart={(e) =>
                              onHalfDragStart(e, idx, "truth")
                            }
                            onDragEnd={onHalfDragEnd}
                          >
                            <span className="half-handle-label">S</span>
                            <span className="half-handle-dots">⠿</span>
                          </div>
                          <textarea
                            className="item-input"
                            value={single.value}
                            onChange={(e) =>
                              handleChange(idx, "value", e.target.value)
                            }
                            maxLength={350}
                            placeholder={`Choice #${idx + 1}...`}
                            rows={1}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.preventDefault();
                            }}
                          />
                        </div>
                        <SpicyFieldRow
                          value={single.spicy}
                          onChange={(v) => handleChange(idx, "spicy", v)}
                          placeholder="Spicy version..."
                          spicyVisible={spicyVisible}
                          dragHandleProps={spicyHandleProps(idx, "spicy")}
                          dropProps={spicyDropProps(idx, "spicy")}
                        />
                      </>
                    ) : (
                      <div className="td-halves">
                        <HalfRow
                          half="truth"
                          value={td.truth}
                          onChange={(v) => handleChange(idx, "truth", v)}
                          onDelete={() => handleDeleteHalf(idx, "truth")}
                          onDragStart={(e) => onHalfDragStart(e, idx, "truth")}
                          onDragEnd={onHalfDragEnd}
                          {...halfDropProps(idx, "truth")}
                        />
                        <SpicyFieldRow
                          value={td.spicyTruth}
                          onChange={(v) => handleChange(idx, "spicyTruth", v)}
                          placeholder="Spicy truth..."
                          spicyVisible={spicyVisible}
                          dragHandleProps={spicyHandleProps(idx, "spicyTruth")}
                          dropProps={spicyDropProps(idx, "spicyTruth")}
                        />
                        <HalfRow
                          half="dare"
                          value={td.dare}
                          onChange={(v) => handleChange(idx, "dare", v)}
                          onDelete={() => handleDeleteHalf(idx, "dare")}
                          onDragStart={(e) => onHalfDragStart(e, idx, "dare")}
                          onDragEnd={onHalfDragEnd}
                          {...halfDropProps(idx, "dare")}
                        />
                        <SpicyFieldRow
                          value={td.spicyDare}
                          onChange={(v) => handleChange(idx, "spicyDare", v)}
                          placeholder="Spicy dare..."
                          spicyVisible={spicyVisible}
                          dragHandleProps={spicyHandleProps(idx, "spicyDare")}
                          dropProps={spicyDropProps(idx, "spicyDare")}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    className="item-delete"
                    onClick={() => handleClear(idx)}
                    title="Clear this slot"
                    aria-label={`Clear slot ${idx + 1}`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="editor-footer">
          <button className="cancel-btn" onClick={handleClose}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave}>
            Save List
          </button>
        </div>
      </div>

      {showPaste && (
        <PastePromptsModal
          emptySlots={emptySlotCount}
          onConfirm={handlePasteConfirm}
          onCancel={() => setShowPaste(false)}
        />
      )}

      {showExitConfirm && (
        <ConfirmDialog
          title="Unsaved Changes"
          message="You have unsaved changes. Are you sure you want to exit without saving?"
          confirmLabel="Exit"
          cancelLabel="Keep Editing"
          onConfirm={onClose}
          onCancel={() => setShowExitConfirm(false)}
        />
      )}

      {keepWhichIdx !== null && (
        <KeepWhichDialog
          item={items[keepWhichIdx] as EditorTDItem}
          onKeep={handleKeepWhich}
          onCancel={() => setKeepWhichIdx(null)}
        />
      )}

      {saveWarning && (
        <SaveWarningDialog
          halfEmpty={saveWarning.halfEmpty}
          onFixThem={() => handleFixThem(saveWarning.promotedItems)}
          onSaveAndConvert={() =>
            handleSaveAndConvert(saveWarning.promotedItems)
          }
          onCancel={() => setSaveWarning(null)}
        />
      )}
    </div>
  );
}
