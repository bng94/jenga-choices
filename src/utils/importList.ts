import type {
  CustomList,
  ExportFile,
  ExportItem,
  ExportSingle,
  ExportTD,
  ImportPreview,
  ImportResult,
  StoredItem,
  StoredSingle,
  StoredTD,
} from "@types";
import { EXAMPLE_HOUSE_RULES, normalizeHouseRules } from "./houseRules";

export const exampleImportCode = `{
  "name": "My List",
  "items": [
    { "prompt": "Do 10 push-ups" },
    { "prompt": "Sing a song", "spicy": "Sing it in opera" },
    { "truth": "What is your fear?", "dare": "Run around the room" }
  ],
  "houseRules": [
    ${EXAMPLE_HOUSE_RULES.map((rule) => JSON.stringify(rule)).join(",\n    ")}
  ]
}`;

const isExportSingle = (item: unknown): item is ExportSingle => {
  return (
    typeof item === "object" &&
    item !== null &&
    "prompt" in item &&
    typeof (item as ExportSingle).prompt === "string"
  );
};

const isExportTD = (item: unknown): item is ExportTD => {
  return (
    typeof item === "object" &&
    item !== null &&
    "truth" in item &&
    "dare" in item &&
    typeof (item as ExportTD).truth === "string" &&
    typeof (item as ExportTD).dare === "string"
  );
};

/** Converts a human-readable export item back to the internal StoredItem format. */
const toStoredItem = (item: ExportItem): StoredItem => {
  if (isExportSingle(item)) {
    const stored: StoredSingle = { v: item.prompt.slice(0, 350) };
    if (item.spicy?.trim()) stored.s = item.spicy.slice(0, 350);
    return stored;
  }
  if (isExportTD(item)) {
    const stored: StoredTD = {
      t: item.truth.slice(0, 350),
      d: item.dare.slice(0, 350),
    };
    if (item.spicy_truth?.trim()) stored.st = item.spicy_truth.slice(0, 350);
    if (item.spicy_dare?.trim()) stored.sd = item.spicy_dare.slice(0, 350);
    return stored;
  }
  return null;
};

const validateExportFile = (parsed: unknown): ExportFile => {
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("File is not a valid JSON object.");
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj.name !== "string" || !obj.name.trim()) {
    throw new Error("Missing or empty list name.");
  }

  if (!Array.isArray(obj.items)) {
    throw new Error("Missing items array.");
  }

  if (obj.items.length === 0) {
    throw new Error("List has no items.");
  }

  const knownItem = obj.items.find(
    (item) => isExportSingle(item) || isExportTD(item),
  );

  if (!knownItem) {
    throw new Error(
      "No recognisable items found. Each item needs a 'prompt' field, or both 'truth' and 'dare' fields.",
    );
  }

  return parsed as ExportFile;
};

/**
 * Parses a JSON string from an imported file and returns either a preview
 * (for the user to confirm) or a validation error.
 */
export const parseImportFile = (jsonText: string): ImportResult => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { ok: false, error: { message: "File is not valid JSON." } };
  }

  let file: ExportFile;
  try {
    file = validateExportFile(parsed);
  } catch (err) {
    return {
      ok: false,
      error: { message: err instanceof Error ? err.message : "Unknown error." },
    };
  }

  const storedItems = file.items.map(toStoredItem);

  const singles = file.items.filter(isExportSingle).length;
  const tdPairs = file.items.filter(isExportTD).length;
  const spicyCount = file.items.filter(
    (item) =>
      (isExportSingle(item) && !!item.spicy?.trim()) ||
      (isExportTD(item) &&
        (!!item.spicy_truth?.trim() || !!item.spicy_dare?.trim())),
  ).length;

  const preview: ImportPreview = {
    name: file.name.trim(),
    totalItems: storedItems.length,
    singles,
    tdPairs,
    spicyCount,
    rawItems: storedItems,
  };
  // Accepts both shapes: modern HouseRule[] and the legacy plain string
  // (which lands in the "then" slot of a single rule).
  const houseRules = normalizeHouseRules(file.houseRules);
  if (houseRules.length) preview.houseRules = houseRules;

  return { ok: true, preview };
};

/**
 * Builds a CustomList from a confirmed ImportPreview.
 * Pads to 54 items with null if the import has fewer.
 */
export const buildImportedList = (
  preview: ImportPreview,
  newId: string,
): CustomList => {
  const padded: StoredItem[] = [...preview.rawItems];
  while (padded.length < 54) padded.push(null);

  const list: CustomList = {
    id: newId,
    name: preview.name,
    items: padded.slice(0, 54),
  };
  if (preview.houseRules?.length) list.houseRules = preview.houseRules;
  return list;
};
