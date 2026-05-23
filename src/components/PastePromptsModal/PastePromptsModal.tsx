import { useState, useMemo } from "react";
import type { StoredItem, StoredSingle, StoredTD } from "../../types";
import { parseImportFile } from "../../utils/importList";
import styles from "./PastePromptsModal.module.css";

interface PastePromptsModalProps {
  emptySlots: number;
  onConfirm: (items: StoredItem[]) => void;
  onCancel: () => void;
}

function parseLine(line: string): StoredItem {
  const trimmed = line.trim().slice(0, 350);
  if (!trimmed || trimmed.toLowerCase() === "blank") {
    return { v: "" } as StoredSingle;
  }
  const pipeIdx = trimmed.indexOf("|");
  if (pipeIdx !== -1) {
    const truth = trimmed.slice(0, pipeIdx).trim();
    const dare = trimmed.slice(pipeIdx + 1).trim();
    return { t: truth, d: dare } as StoredTD;
  }
  return { v: trimmed } as StoredSingle;
}

function parseLines(text: string): StoredItem[] {
  return text.split("\n").map(parseLine);
}

const PastePromptsModal = ({
  emptySlots,
  onConfirm,
  onCancel,
}: PastePromptsModalProps) => {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  /**
   * Parsed items derived from the current textarea value.
   * Auto-detects JSON vs plain text.
   */
  const parsed = useMemo<StoredItem[] | null>(() => {
    const trimmed = text.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("{")) {
      const result = parseImportFile(trimmed);
      if (!result.ok) return null;
      return result.preview.rawItems;
    }

    const lines = parseLines(trimmed);
    return lines.length > 0 ? lines : null;
  }, [text]);

  const detectedCount = parsed?.length ?? 0;
  const isJSON = text.trim().startsWith("{");
  const willTruncate = detectedCount > emptySlots;
  const finalCount = Math.min(detectedCount, emptySlots);

  const handleConfirm = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (isJSON) {
      const result = parseImportFile(trimmed);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      onConfirm(result.preview.rawItems.slice(0, emptySlots));
      return;
    }

    const lines = parseLines(trimmed);
    onConfirm(lines.slice(0, emptySlots));
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        e.stopPropagation();
        onCancel();
      }}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Paste Prompts</h3>

        <div className={styles.instructions}>
          <p className={styles.instructionLine}>
            One prompt per line — or paste an exported Jenga Choices JSON file
            directly.
          </p>
          <div className={styles.formatExamples}>
            <span className={styles.exampleRow}>Do 10 push-ups</span>
            <span className={styles.exampleRow}>
              What is your fear?
              <span className={styles.pipe}> | </span>
              Run around the room
            </span>
          </div>
        </div>

        <textarea
          className={styles.textarea}
          placeholder={isJSON ? "JSON detected…" : "Paste your prompts here…"}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          autoFocus
          spellCheck={false}
        />

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.footer}>
          <div className={styles.status}>
            {detectedCount > 0 ? (
              <>
                <span className={styles.statusCount}>{finalCount}</span>
                <span className={styles.statusLabel}>
                  {isJSON ? " prompts from JSON" : " prompts detected"}
                </span>
                {willTruncate && (
                  <span className={styles.statusWarn}>
                    {" "}
                    · {detectedCount - emptySlots} will be skipped (list full)
                  </span>
                )}
              </>
            ) : (
              <span className={styles.statusEmpty}>
                {text.trim()
                  ? "Nothing recognised yet"
                  : `${emptySlots} empty slot${emptySlots !== 1 ? "s" : ""} available`}
              </span>
            )}
          </div>

          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={onCancel}>
              Cancel
            </button>
            <button
              className={styles.confirmBtn}
              onClick={handleConfirm}
              disabled={detectedCount === 0}
            >
              Add to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastePromptsModal;
