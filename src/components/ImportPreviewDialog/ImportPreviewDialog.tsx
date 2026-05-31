import { useEffect, useRef } from "react";

import { ImportPreview } from "../../types";
import styles from "./ImportPreviewDialog.module.css";

interface ImportPreviewDialogProps {
  preview: ImportPreview;
  onConfirm: () => void;
  onCancel: () => void;
}

const ImportPreviewDialog = ({
  preview,
  onConfirm,
  onCancel,
}: ImportPreviewDialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        e.stopPropagation();
        onCancel();
      }}
    >
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-preview-title"
        tabIndex={-1}
      >
        <h3 className={styles.title}>Import List</h3>

        <div className={styles.previewBox}>
          <div className={styles.previewRow}>
            <span className={styles.previewLabel}>Name</span>
            <span className={styles.previewValue}>{preview.name}</span>
          </div>
          <div className={styles.previewRow}>
            <span className={styles.previewLabel}>Total prompts</span>
            <span className={styles.previewValue}>{preview.totalItems}</span>
          </div>
          {preview.singles > 0 && (
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Singles</span>
              <span className={styles.previewValue}>{preview.singles}</span>
            </div>
          )}
          {preview.tdPairs > 0 && (
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Truth / Dare pairs</span>
              <span className={styles.previewValue}>{preview.tdPairs}</span>
            </div>
          )}
          {preview.spicyCount > 0 && (
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>🔥 Spicy versions</span>
              <span className={styles.previewValue}>{preview.spicyCount}</span>
            </div>
          )}
          {preview.totalItems < 54 && (
            <p className={styles.padNote}>
              {54 - preview.totalItems} empty slots will be added to reach 54
              blocks.
            </p>
          )}
          {preview.totalItems > 54 && (
            <p className={styles.truncateNote}>
              Only the first 54 prompts will be imported.
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportPreviewDialog;
