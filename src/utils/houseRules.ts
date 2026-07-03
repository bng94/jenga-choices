import type { HouseRule } from "../types";

/**
 * Ready-made house rules: tap-to-add chips in the editor, and the format
 * example in the import help. One list so both surfaces stay in sync.
 */
export const EXAMPLE_HOUSE_RULES: HouseRule[] = [
  {
    when: "The tower falls",
    then: "The player who caused it rebuilds the tower and skips their next turn",
  },
  {
    when: "A player refuses a prompt",
    then: "They pull one extra block",
  },
  {
    when: "A chosen player refuses to participate in a prompt",
    then: "The active player pulls 2 blocks; the chosen player pulls 1 block",
  },
];

/** Trigger line, e.g. "The tower falls" — one short phrase. */
export const HOUSE_RULE_WHEN_MAX = 80;
/** Consequence text, e.g. "Rebuild it and do 10 jumping jacks". */
export const HOUSE_RULE_THEN_MAX = 200;
/** A consequence shorter than this can't describe anything actionable. */
export const HOUSE_RULE_THEN_MIN = 2;
/** Keeps the reveal pill readable on a phone. */
export const HOUSE_RULES_MAX = 6;

/**
 * Coerces any stored/imported houseRules value into valid HouseRule[].
 * - Legacy plain string → one rule with the text in the `then` slot
 *   (the `when` is left empty for the user to fill in later).
 * - Arrays are sanitized: non-objects dropped, fields trimmed and clamped
 *   to the length limits, rules without a usable `then` dropped.
 * - Anything else → [].
 */
export function normalizeHouseRules(raw: unknown): HouseRule[] {
  if (typeof raw === "string") {
    const then = raw.trim().slice(0, HOUSE_RULE_THEN_MAX);
    return then.length >= HOUSE_RULE_THEN_MIN ? [{ when: "", then }] : [];
  }
  if (!Array.isArray(raw)) return [];
  const rules: HouseRule[] = [];
  for (const entry of raw) {
    if (rules.length >= HOUSE_RULES_MAX) break;
    if (typeof entry !== "object" || entry === null) continue;
    const { when, then } = entry as Partial<HouseRule>;
    const cleanThen =
      typeof then === "string" ? then.trim().slice(0, HOUSE_RULE_THEN_MAX) : "";
    if (cleanThen.length < HOUSE_RULE_THEN_MIN) continue;
    const cleanWhen =
      typeof when === "string" ? when.trim().slice(0, HOUSE_RULE_WHEN_MAX) : "";
    rules.push({ when: cleanWhen, then: cleanThen });
  }
  return rules;
}
