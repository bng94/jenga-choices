import { useState, useRef, useEffect, useMemo, type DragEvent } from "react";
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
import ListEditorHeader from "./editor/ListEditorHeader";
import ListEditorItem from "./editor/ListEditorItem";
import type { EditorItemHandlers } from "./editor/ListEditorItem";
import KeepWhichDialog from "./editor/KeepWhichDialog";
import SaveWarningDialog from "./editor/SaveWarningDialog";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import PastePromptsModal from "../PastePromptsModal/PastePromptsModal";
import "./ListEditor.css";

function normalizeItems(rawItems: StoredItem[]): EditorItem[] {
  const padded = [...rawItems];
  while (padded.length < 54) padded.push({ v: "" });
  return padded.slice(0, 54).map(deserializeItem);
}

function anyHasSpicy(items: EditorItem[]): boolean {
  return items.some(itemHasSpicy);
}

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

const ListEditor = ({ list, isNew, onSave, onClose }: ListEditorProps) => {
  const [name, setName] = useState(list.name);
  const [items, setItems] = useState<EditorItem[]>(() =>
    normalizeItems(list.items),
  );
  const [spicyVisible, setSpicyVisible] = useState(() =>
    anyHasSpicy(normalizeItems(list.items)),
  );
  const [keepWhichIdx, setKeepWhichIdx] = useState<number | null>(null);
  const [saveWarning, setSaveWarning] = useState<SaveWarning | null>(null);
  const [warningSet, setWarningSet] = useState<Set<number>>(new Set());
  const [houseRules, setHouseRules] = useState(list.houseRules ?? "");
  const [houseRulesOpen, setHouseRulesOpen] = useState(false);
  const initialHouseRules = list.houseRules ?? "";

  const initialItems = useMemo(() => normalizeItems(list.items), [list.id]);
  const initialName = list.name;

  const unSavedChanges =
    !itemsEqual(items, initialItems) ||
    name !== initialName ||
    houseRules !== initialHouseRules;

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showPaste, setShowPaste] = useState(false);

  const rowDragIdx = useRef<number | null>(null);
  const rowDragOverIdx = useRef<number | null>(null);
  const halfDragRef = useRef<{ rowIdx: number; half: HalfDragHalf } | null>(null);
  const halfDragOver = useRef<string | null>(null);
  const spicyDragRef = useRef<{ rowIdx: number; slot: SpicySlot } | null>(null);
  const spicyDragOver = useRef<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const filledCount = items.filter((it) =>
    it.type === "td"
      ? (it as EditorTDItem).truth.trim() || (it as EditorTDItem).dare.trim()
      : (it as EditorSingleItem).value.trim(),
  ).length;

  const handleClose = () => {
    if (unSavedChanges) setShowExitConfirm(true);
    else onClose();
  };

  useEffect(() => {
    if (!isNew) panelRef.current?.focus();
  }, [isNew]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key !== "Escape" ||
        showExitConfirm ||
        showPaste ||
        keepWhichIdx !== null ||
        saveWarning !== null
      )
        return;
      if (unSavedChanges) setShowExitConfirm(true);
      else onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [unSavedChanges, onClose, showExitConfirm, showPaste, keepWhichIdx, saveWarning]);

  // ── Item mutation ─────────────────────────────────────────────────────────

  const patch = (idx: number, changes: Partial<EditorItem>) =>
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...changes } as EditorItem;
      return next;
    });

  const handleChange = (idx: number, field: string, val: string) => {
    patch(idx, { [field]: val } as Partial<EditorItem>);
    if (warningSet.has(idx)) {
      setWarningSet((prev) => {
        const s = new Set(prev);
        s.delete(idx);
        return s;
      });
    }
  };

  const handleToTD = (idx: number) => {
    setItems((prev) => {
      const next = [...prev];
      const cur = next[idx] as EditorSingleItem;
      next[idx] = { type: "td", truth: cur.value, dare: "", spicyTruth: cur.spicy, spicyDare: "" };
      return next;
    });
  };

  const handleToSingle = (idx: number) => {
    const it = items[idx] as EditorTDItem;
    const hasTruth = it.truth.trim();
    const hasDare = it.dare.trim();
    if (hasTruth && hasDare) { setKeepWhichIdx(idx); return; }
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

  const handleClear = (idx: number) =>
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { type: "single", value: "", spicy: "" };
      return next;
    });

  // ── Row drag ──────────────────────────────────────────────────────────────

  const onRowDragStart = (e: DragEvent<HTMLDivElement>, idx: number) => {
    if (halfDragRef.current || spicyDragRef.current) { e.preventDefault(); return; }
    rowDragIdx.current = idx;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `row:${idx}`);
    (e.currentTarget as HTMLElement).closest(".editor-item")?.classList.add("dragging");
  };

  const onRowDragEnd = (e: DragEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).closest(".editor-item")?.classList.remove("dragging");
    document.querySelectorAll(".editor-item.drag-over-row").forEach((el) => el.classList.remove("drag-over-row"));
    rowDragIdx.current = null;
    rowDragOverIdx.current = null;
  };

  const onRowDragOver = (e: DragEvent<HTMLDivElement>, idx: number) => {
    if (halfDragRef.current || spicyDragRef.current) return;
    if (!e.dataTransfer.types.includes("text/plain")) return;
    e.preventDefault();
    if (rowDragOverIdx.current !== idx) {
      document.querySelectorAll(".editor-item.drag-over-row").forEach((el) => el.classList.remove("drag-over-row"));
      rowDragOverIdx.current = idx;
      (e.currentTarget as HTMLElement).classList.add("drag-over-row");
    }
  };

  const onRowDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node))
      (e.currentTarget as HTMLElement).classList.remove("drag-over-row");
  };

  const onRowDrop = (e: DragEvent<HTMLDivElement>, dropIdx: number) => {
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

  // ── Half drag ─────────────────────────────────────────────────────────────

  const clearHalfOver = () =>
    document.querySelectorAll(".td-half.half-drag-over").forEach((el) => el.classList.remove("half-drag-over"));

  const onHalfDragStart = (e: DragEvent<HTMLDivElement>, rowIdx: number, half: HalfDragHalf) => {
    e.stopPropagation();
    halfDragRef.current = { rowIdx, half };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `half:${rowIdx}:${half}`);
    (e.currentTarget as HTMLElement).classList.add("half-dragging");
  };

  const onHalfDragEnd = (e: DragEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).classList.remove("half-dragging");
    clearHalfOver();
    halfDragRef.current = null;
    halfDragOver.current = null;
  };

  const onHalfDragOver = (e: DragEvent<HTMLDivElement>, rowIdx: number, half: HalfDragHalf) => {
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

  const onHalfDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node))
      (e.currentTarget as HTMLElement).classList.remove("half-drag-over");
  };

  const getHalfText = (item: EditorItem, half: HalfDragHalf): string =>
    item.type === "td" ? (item as EditorTDItem)[half] : (item as EditorSingleItem).value;

  const getHalfSpicy = (item: EditorItem, half: HalfDragHalf): string => {
    if (item.type === "td") {
      const td = item as EditorTDItem;
      return half === "truth" ? td.spicyTruth : td.spicyDare;
    }
    return (item as EditorSingleItem).spicy;
  };

  const applyHalf = (item: EditorItem, half: HalfDragHalf, text: string, spicy: string): EditorItem => {
    if (item.type === "td") {
      const td = item as EditorTDItem;
      return half === "truth" ? { ...td, truth: text, spicyTruth: spicy } : { ...td, dare: text, spicyDare: spicy };
    }
    return { ...(item as EditorSingleItem), value: text, spicy };
  };

  const onHalfDrop = (e: DragEvent<HTMLDivElement>, toRowIdx: number, toHalf: HalfDragHalf) => {
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
        const fromSpicy = src.half === "truth" ? item.spicyTruth : item.spicyDare;
        const toText = toHalf === "truth" ? item.truth : item.dare;
        const toSpicy = toHalf === "truth" ? item.spicyTruth : item.spicyDare;
        const shouldSwapSpicy = fromSpicy.trim() !== "";
        const result = { ...item };
        if (src.half === "truth") { result.truth = toText; result.spicyTruth = shouldSwapSpicy ? toSpicy : fromSpicy; }
        else { result.dare = toText; result.spicyDare = shouldSwapSpicy ? toSpicy : fromSpicy; }
        if (toHalf === "truth") { result.truth = fromText; result.spicyTruth = shouldSwapSpicy ? fromSpicy : toSpicy; }
        else { result.dare = fromText; result.spicyDare = shouldSwapSpicy ? fromSpicy : toSpicy; }
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
      next[src.rowIdx] = applyHalf(fromItem, src.half, toText, shouldSwapSpicy ? toSpicy : fromSpicy);
      next[toRowIdx] = applyHalf(toItem, toHalf, fromText, shouldSwapSpicy ? fromSpicy : toSpicy);
      return next;
    });

    halfDragRef.current = null;
    halfDragOver.current = null;
  };

  // ── Spicy drag ────────────────────────────────────────────────────────────

  const clearSpicyOver = () =>
    document.querySelectorAll(".spicy-drag-over,.main-drag-over").forEach((el) => {
      el.classList.remove("spicy-drag-over");
      el.classList.remove("main-drag-over");
    });

  const onSpicyDragStart = (e: DragEvent<HTMLDivElement>, rowIdx: number, slot: SpicySlot) => {
    e.stopPropagation();
    spicyDragRef.current = { rowIdx, slot };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `spicy:${rowIdx}:${slot}`);
    (e.currentTarget as HTMLElement).classList.add("half-dragging");
  };

  const onSpicyDragEnd = (e: DragEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).classList.remove("half-dragging");
    clearSpicyOver();
    spicyDragRef.current = null;
    spicyDragOver.current = null;
  };

  const onAnyDragOver = (e: DragEvent<HTMLDivElement>, key: string, className: string) => {
    if (!spicyDragRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    if (spicyDragOver.current !== key) {
      clearSpicyOver();
      spicyDragOver.current = key;
      (e.currentTarget as HTMLElement).classList.add(className);
    }
  };

  const onAnyDragLeave = (e: DragEvent<HTMLDivElement>) => {
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

  const onSpicyDropOnSpicy = (e: DragEvent<HTMLDivElement>, toRowIdx: number, toSlot: SpicySlot) => {
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

  const onSpicyDropOnMain = (e: DragEvent<HTMLDivElement>, toRowIdx: number, mainField: string) => {
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

  const onSingleSpicyDropOnSpicySlot = (e: DragEvent<HTMLDivElement>, toRowIdx: number, toSlot: SpicySlot) => {
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
      const toSpicyVal = (toItem as unknown as Record<string, string>)[toSpicyKey] ?? "";
      next[src.rowIdx] = { ...(fromItem as EditorSingleItem), value: toMain, spicy: toSpicyVal };
      if (toItem.type === "single") {
        next[toRowIdx] = { ...(toItem as EditorSingleItem), value: fromValue, spicy: fromSpicy };
      } else {
        const td = { ...(toItem as EditorTDItem) };
        if (toSlot === "spicyTruth") { td.truth = fromValue; td.spicyTruth = fromSpicy; }
        else { td.dare = fromValue; td.spicyDare = fromSpicy; }
        next[toRowIdx] = td;
      }
      return next;
    });
    spicyDragRef.current = null;
    spicyDragOver.current = null;
  };

  // ── Drag prop factories ───────────────────────────────────────────────────

  const spicyHandleProps = (rowIdx: number, slot: SpicySlot) => ({
    draggable: true as const,
    onDragStart: (e: DragEvent<HTMLDivElement>) => onSpicyDragStart(e, rowIdx, slot),
    onDragEnd: onSpicyDragEnd,
  });

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
      if (spicyDragRef.current) onAnyDragOver(e, `${rowIdx}:${slot}`, "spicy-drag-over");
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
            (next[halfSrc.rowIdx] as EditorItem).type === "single" ? "value" : halfSrc.half;
          const spicyField = resolveSpicyField(next[rowIdx] as EditorItem, slot);
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
        srcItem.type === "single" && srcItem.value.trim() !== "" && srcItem.spicy.trim() !== "";
      if (isSingleWithSpicy) onSingleSpicyDropOnSpicySlot(e, rowIdx, slot);
      else onSpicyDropOnSpicy(e, rowIdx, slot);
    },
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

  // ── Save / paste ──────────────────────────────────────────────────────────

  const handleSave = () => {
    const promoted = items.map((item): EditorItem => {
      if (item.type === "single") {
        const s = item as EditorSingleItem;
        if (!s.value.trim() && s.spicy.trim()) return { ...s, value: s.spicy, spicy: "" };
      }
      if (item.type === "td") {
        let td = item as EditorTDItem;
        if (!td.truth.trim() && td.spicyTruth.trim()) td = { ...td, truth: td.spicyTruth, spicyTruth: "" };
        if (!td.dare.trim() && td.spicyDare.trim()) td = { ...td, dare: td.spicyDare, spicyDare: "" };
        return td;
      }
      return item;
    });

    const halfEmpty = promoted
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => {
        if (item.type !== "td") return false;
        const td = item as EditorTDItem;
        return (td.truth.trim() && !td.dare.trim()) || (!td.truth.trim() && td.dare.trim());
      })
      .map(({ item, idx }) => ({ item: item as EditorTDItem, idx }));

    if (halfEmpty.length > 0) { setSaveWarning({ promotedItems: promoted, halfEmpty }); return; }

    onSave({
      ...list,
      name: name.trim() || "Unnamed List",
      items: promoted.map(serializeItem),
      houseRules: houseRules.trim() || undefined,
    });
  };

  const handleSaveAndConvert = (promotedItems: EditorItem[]) => {
    const fixed = promotedItems.map((item): EditorItem => {
      if (item.type !== "td") return item;
      const td = item as EditorTDItem;
      const hasTruth = td.truth.trim();
      const hasDare = td.dare.trim();
      if ((hasTruth && !hasDare) || (!hasTruth && hasDare)) {
        return { type: "single", value: hasTruth ? td.truth : td.dare, spicy: hasTruth ? td.spicyTruth : td.spicyDare };
      }
      return item;
    });
    setSaveWarning(null);
    onSave({
      ...list,
      name: name.trim() || "Unnamed List",
      items: fixed.map(serializeItem),
      houseRules: houseRules.trim() || undefined,
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

  const emptySlotCount = items.filter(
    (it) => it.type === "single" && (it as EditorSingleItem).value.trim() === "",
  ).length;

  const handlePasteConfirm = (pastedItems: StoredItem[]) => {
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="editor-overlay"
      onClick={(e) => { e.stopPropagation(); handleClose(); }}
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
        <ListEditorHeader
          isNew={isNew}
          filledCount={filledCount}
          unSavedChanges={unSavedChanges}
          spicyVisible={spicyVisible}
          onToggleSpicy={() => setSpicyVisible((v) => !v)}
          onShowPaste={() => setShowPaste(true)}
          onClose={handleClose}
        />

        <div className="editor-body">
          <div className="editor-name-row">
            <input
              className="editor-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="List name..."
              maxLength={40}
              autoFocus={isNew}
            />
          </div>

          <div className="house-rules-section">
            <button
              type="button"
              className={`house-rules-toggle${houseRulesOpen ? " open" : ""}`}
              onClick={() => setHouseRulesOpen((v) => !v)}
            >
              <span>House Rules</span>
              <span className={`house-rules-arrow${houseRulesOpen ? " open" : ""}`}>▶</span>
            </button>
            {houseRulesOpen && (
              <div className="house-rules-body">
                <textarea
                  className="house-rules-textarea"
                  value={houseRules}
                  onChange={(e) => setHouseRules(e.target.value)}
                  placeholder="Add any house rules for this list (optional)..."
                  maxLength={600}
                />
              </div>
            )}
          </div>

          <div className="editor-items-list">
            {items.map((item, idx) => {
              const handlers: EditorItemHandlers = {
                onChangeField: (field, val) => handleChange(idx, field, val),
                onToTD: () => handleToTD(idx),
                onToSingle: () => handleToSingle(idx),
                onDeleteHalf: (half) => handleDeleteHalf(idx, half),
                onClear: () => handleClear(idx),
                rowDrag: {
                  onDragStart: (e) => onRowDragStart(e, idx),
                  onDragEnd: onRowDragEnd,
                  onDragOver: (e) => onRowDragOver(e, idx),
                  onDragLeave: onRowDragLeave,
                  onDrop: (e) => onRowDrop(e, idx),
                },
                halfDrag: {
                  onStart: (e, half) => onHalfDragStart(e, idx, half),
                  onEnd: onHalfDragEnd,
                  dropProps: (half) => halfDropProps(idx, half),
                  singleDropProps: () => singleHalfDropProps(idx),
                },
                spicyDrag: {
                  handleProps: (slot) => spicyHandleProps(idx, slot),
                  dropProps: (slot) => spicyDropProps(idx, slot),
                },
              };

              return (
                <ListEditorItem
                  key={idx}
                  item={item}
                  idx={idx}
                  isWarning={warningSet.has(idx)}
                  spicyVisible={spicyVisible}
                  handlers={handlers}
                />
              );
            })}
          </div>
        </div>

        <div className="editor-footer">
          <button className="cancel-btn" onClick={handleClose}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>Save List</button>
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
          onSaveAndConvert={() => handleSaveAndConvert(saveWarning.promotedItems)}
          onCancel={() => setSaveWarning(null)}
        />
      )}
    </div>
  );
};

export default ListEditor;
