import { useState, useRef, type DragEvent, useMemo } from "react";
import type {
  CustomList,
  EditorItem,
  EditorSingleItem,
  EditorTDItem,
} from "../../types";
import { deserializeItem, itemHasSpicy } from "../../utils/itemModel";
import SpicyToggle from "../SpicyToggle/SpicyToggle";
import { exportList } from "../../utils/exportList";
import "./ListViewer.css";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";

interface ListViewerProps {
  list: CustomList & { isDefault: boolean };
  onClose: () => void;
  onSave: (updated: CustomList) => void;
}

export default function ListViewer({ list, onClose, onSave }: ListViewerProps) {
  const isDefault = list.isDefault;

  const [spicyMode, setSpicyMode] = useState(false);
  const [houseRulesOpen, setHouseRulesOpen] = useState(false);
  const originalRaw = useMemo(() => list.items, [list.id]);
  const [orderedRaw, setOrderedRaw] = useState(() => list.items);

  const dirty = orderedRaw.some((item, i) => item !== originalRaw[i]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const dragIdx = useRef<number | null>(null);
  const dragOverIdx = useRef<number | null>(null);

  // Derive filled items for display
  const deserialized = orderedRaw.map((raw, rawIdx) => ({
    item: deserializeItem(raw),
    rawIdx,
  }));

  const filled = deserialized.filter(({ item }) =>
    item.type === "td"
      ? (item as EditorTDItem).truth.trim() ||
        (item as EditorTDItem).dare.trim()
      : (item as EditorSingleItem).value.trim(),
  );

  const anySpicy = filled.some(({ item }) => itemHasSpicy(item));

  const clearOver = () =>
    document
      .querySelectorAll(".viewer-item.drag-over")
      .forEach((el) => el.classList.remove("drag-over"));

  const onDragStart = (e: DragEvent, visIdx: number) => {
    dragIdx.current = visIdx;
    e.dataTransfer.effectAllowed = "move";
    (e.currentTarget as HTMLElement).classList.add("dragging");
  };

  const onDragEnd = (e: DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove("dragging");
    clearOver();
    dragIdx.current = null;
    dragOverIdx.current = null;
  };

  const onDragOver = (e: DragEvent, visIdx: number) => {
    e.preventDefault();
    if (dragOverIdx.current !== visIdx) {
      clearOver();
      dragOverIdx.current = visIdx;
      (e.currentTarget as HTMLElement).classList.add("drag-over");
    }
  };

  const onDragLeave = (e: DragEvent) => {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node))
      (e.currentTarget as HTMLElement).classList.remove("drag-over");
  };

  const onDrop = (e: DragEvent, dropVisIdx: number) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.remove("drag-over");
    const fromVis = dragIdx.current;
    if (fromVis === null || fromVis === dropVisIdx) return;

    const fromActual = filled[fromVis].rawIdx;
    const dropActual = filled[dropVisIdx].rawIdx;

    setOrderedRaw((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromActual, 1);
      next.splice(dropActual, 0, moved);
      return next;
    });
    dragIdx.current = null;
    dragOverIdx.current = null;
  };

  const handleSave = () => {
    if (isDefault || !onSave) return;
    onSave({ ...list, items: orderedRaw });
    onClose();
  };

  const renderContent = (item: EditorItem) => {
    if (item.type === "single") {
      const s = item as EditorSingleItem;
      const hasSpicy = !!s.spicy.trim();
      const showSpicy = spicyMode && hasSpicy;

      return (
        <div className="viewer-single-wrap">
          <span className={`viewer-single ${showSpicy ? "spicy-text" : ""}`}>
            {showSpicy ? s.spicy : s.value}
          </span>
          {hasSpicy && (
            <span className="viewer-spicy-dot" title="Has spicy version">
              🔥
            </span>
          )}
        </div>
      );
    }

    const td = item as EditorTDItem;
    const hasTruthSpicy = !!td.spicyTruth.trim();
    const hasDareSpicy = !!td.spicyDare.trim();

    return (
      <>
        <div className="viewer-td-row truth">
          <span className="viewer-td-label truth">T</span>
          <span className={spicyMode && hasTruthSpicy ? "spicy-text" : ""}>
            {spicyMode && hasTruthSpicy ? td.spicyTruth : td.truth}
          </span>
          {hasTruthSpicy && <span className="viewer-spicy-dot">🔥</span>}
        </div>
        <div className="viewer-td-row dare">
          <span className="viewer-td-label dare">D</span>
          <span className={spicyMode && hasDareSpicy ? "spicy-text" : ""}>
            {spicyMode && hasDareSpicy ? td.spicyDare : td.dare}
          </span>
          {hasDareSpicy && <span className="viewer-spicy-dot">🔥</span>}
        </div>
      </>
    );
  };

  return (
    <div
      className="editor-overlay"
      onClick={(e) => {
        e.stopPropagation();
        if (dirty) {
          setShowExitConfirm(true);
          return;
        }
        onClose();
      }}
    >
      <div className="editor-panel" onClick={(e) => e.stopPropagation()}>
        <div className="editor-header">
          <div>
            <div className="editor-title">{list.name}</div>
            <div className="viewer-subtitle">
              {filled.length} items
              {isDefault ? " · read-only" : dirty ? " · unsaved changes" : ""}
            </div>
          </div>
          <div className="editor-header-actions">
            <button
              className="viewer-export-btn"
              onClick={() => exportList(list)}
              title="Download list as JSON"
            >
              ⬇ Export
            </button>
            {anySpicy && (
              <SpicyToggle
                enabled={spicyMode}
                onToggle={() => setSpicyMode((s) => !s)}
                variant="viewer"
              />
            )}
            <button className="editor-close" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {spicyMode && (
          <div className="spicy-mode-banner">
            🔥 Previewing spicy versions — items without spicy show their
            regular text
          </div>
        )}

        <div className="editor-body">
          {list.houseRules?.trim() && (
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
                  <p className="house-rules-text">{list.houseRules}</p>
                </div>
              )}
            </div>
          )}

          {!isDefault && (
            <p className="drag-hint">
              ☰ Drag rows to reorder — click Save to keep the new order
            </p>
          )}

          <div className="viewer-list">
            {filled.map(({ item, rawIdx }, visIdx) => {
              const draggable = !isDefault;
              return (
                <div
                  key={rawIdx}
                  className={`viewer-item ${draggable ? "draggable" : ""}`}
                  draggable={draggable}
                  onDragStart={
                    draggable ? (e) => onDragStart(e, visIdx) : undefined
                  }
                  onDragEnd={draggable ? onDragEnd : undefined}
                  onDragOver={
                    draggable ? (e) => onDragOver(e, visIdx) : undefined
                  }
                  onDragLeave={draggable ? onDragLeave : undefined}
                  onDrop={draggable ? (e) => onDrop(e, visIdx) : undefined}
                >
                  {draggable && (
                    <div className="drag-handle viewer-drag">⠿</div>
                  )}
                  <span className="viewer-num">{visIdx + 1}</span>
                  <div className="viewer-content">{renderContent(item)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="editor-footer">
          <button
            className="cancel-btn"
            onClick={() => {
              if (dirty) {
                setShowExitConfirm(true);
                return;
              }
              onClose();
            }}
          >
            {dirty ? "Discard" : "Close"}
          </button>
          {!isDefault && (
            <button className="save-btn" onClick={handleSave} disabled={!dirty}>
              Save Order
            </button>
          )}
        </div>

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
      </div>
    </div>
  );
}
