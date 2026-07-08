import type { StoredItem, EditorItem, StoredSingle, StoredTD } from "@types";

const isStoredSingle = (raw: unknown): raw is StoredSingle => {
  return typeof raw === "object" && raw !== null && "v" in raw;
};

const isStoredTD = (raw: unknown): raw is StoredTD => {
  return typeof raw === "object" && raw !== null && "t" in raw;
};

export const itemHasContent = (raw: StoredItem): boolean => {
  if (raw === null || raw === undefined) return false;
  if (isStoredSingle(raw)) return !!raw.v?.trim();
  if (isStoredTD(raw)) return !!(raw.t?.trim() || raw.d?.trim());
  return false;
};

export const itemHasSpicyContent = (raw: StoredItem): boolean => {
  if (isStoredSingle(raw)) return !!raw.s?.trim();
  if (isStoredTD(raw)) return !!(raw.st?.trim() || raw.sd?.trim());
  return false;
};

export const itemHasSpicy = (item: EditorItem): boolean => {
  if (item.type === "single") return !!item.spicy.trim();
  return !!(item.spicyTruth.trim() || item.spicyDare.trim());
};

export const deserializeItem = (raw: StoredItem): EditorItem => {
  if (raw === null || raw === undefined) {
    return { type: "single", value: "", spicy: "" };
  }
  if (isStoredSingle(raw)) {
    return {
      type: "single",
      value: raw.v,
      spicy: raw.s || "",
    };
  }
  if (isStoredTD(raw)) {
    return {
      type: "td",
      truth: raw.t || "",
      dare: raw.d || "",
      spicyTruth: raw.st ?? "",
      spicyDare: raw.sd ?? "",
    };
  }
  console.warn("deserializeItem received unknown item format:", raw);
  return { type: "single", value: "", spicy: "" };
};

export const serializeItem = (item: EditorItem): StoredItem => {
  if (item.type === "single") {
    if (!item.value.trim() && !item.spicy.trim()) return null;
    return { v: item.value, s: item.spicy.trim() ? item.spicy : undefined };
  }
  if (item.type === "td") {
    const truth = item.truth.trim() ? item.truth : item.spicyTruth;
    const dare = item.dare.trim() ? item.dare : item.spicyDare;
    const spicyTruth = item.truth.trim() ? item.spicyTruth : "";
    const spicyDare = item.dare.trim() ? item.spicyDare : "";
    if (!truth.trim() && !dare.trim()) return null;
    return {
      t: truth,
      d: dare,
      st: spicyTruth || undefined,
      sd: spicyDare || undefined,
    };
  }
  console.warn("serializeItem received unknown item type:", item);
  return null;
};
