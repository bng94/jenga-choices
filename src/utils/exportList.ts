import type {
  CustomList,
  ExportFile,
  ExportItem,
  ExportSingle,
  ExportTD,
  StoredItem,
  StoredSingle,
  StoredTD,
} from "../types";

function isStoredSingle(raw: StoredItem): raw is StoredSingle {
  return typeof raw === "object" && raw !== null && "v" in raw;
}

function isStoredTD(raw: StoredItem): raw is StoredTD {
  return typeof raw === "object" && raw !== null && "t" in raw;
}

/** Converts one StoredItem to its human-readable export shape. Skips null/undefined/blank. */
function toExportItem(raw: StoredItem): ExportItem | null {
  if (raw === null || raw === undefined) return null;

  if (isStoredSingle(raw)) {
    if (!raw.v.trim()) return null;
    const item: ExportSingle = { prompt: raw.v };
    if (raw.s?.trim()) item.spicy = raw.s;
    return item;
  }

  if (isStoredTD(raw)) {
    if (!raw.t?.trim() && !raw.d?.trim()) return null;
    const item: ExportTD = { truth: raw.t ?? "", dare: raw.d ?? "" };
    if (raw.st?.trim()) item.spicy_truth = raw.st;
    if (raw.sd?.trim()) item.spicy_dare = raw.sd;
    return item;
  }

  return null;
}

/**
 * Converts a CustomList to a human-readable JSON file and triggers a browser download.
 * Empty/blank items are excluded from the export.
 */
export function exportList(list: CustomList): void {
  const exportItems = list.items
    .map(toExportItem)
    .filter((item): item is ExportItem => item !== null);

  const file: ExportFile = {
    id: String(Date.now()),
    name: list.name,
    items: exportItems,
  };

  const blob = new Blob([JSON.stringify(file, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${list.name.toLowerCase().replace(/\s+/g, "-")}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
