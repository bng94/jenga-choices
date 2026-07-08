import type { DragEventHandler, HTMLAttributes } from "react";
import type {
  EditorItem,
  EditorSingleItem,
  EditorTDItem,
  HalfDragHalf,
  SpicySlot,
} from "@types";
import HalfRow from "./HalfRow";
import SpicyFieldRow from "./SpicyFieldRow";

interface HalfDropResult {
  onDragOver: DragEventHandler<HTMLDivElement>;
  onDragLeave: DragEventHandler<HTMLDivElement>;
  onDrop: DragEventHandler<HTMLDivElement>;
}

export interface EditorItemHandlers {
  onChangeField: (field: string, val: string) => void;
  onToTD: () => void;
  onToSingle: () => void;
  onDeleteHalf: (half: "truth" | "dare") => void;
  onClear: () => void;
  rowDrag: {
    onDragStart: DragEventHandler<HTMLDivElement>;
    onDragEnd: DragEventHandler<HTMLDivElement>;
    onDragOver: DragEventHandler<HTMLDivElement>;
    onDragLeave: DragEventHandler<HTMLDivElement>;
    onDrop: DragEventHandler<HTMLDivElement>;
  };
  halfDrag: {
    onStart: (e: React.DragEvent<HTMLDivElement>, half: HalfDragHalf) => void;
    onEnd: DragEventHandler<HTMLDivElement>;
    dropProps: (half: HalfDragHalf) => HalfDropResult;
    singleDropProps: () => HalfDropResult;
  };
  spicyDrag: {
    handleProps: (slot: SpicySlot) => HTMLAttributes<HTMLDivElement>;
    dropProps: (slot: SpicySlot) => HalfDropResult;
  };
}

interface ListEditorItemProps {
  item: EditorItem;
  idx: number;
  isWarning: boolean;
  spicyVisible: boolean;
  handlers: EditorItemHandlers;
}
const ListEditorItem = ({
  item,
  idx,
  isWarning,
  spicyVisible,
  handlers,
}: ListEditorItemProps) => {
  const isTD = item.type === "td";
  const single = item as EditorSingleItem;
  const td = item as EditorTDItem;

  return (
    <div
      className={`editor-item ${isWarning ? "item-warning" : ""}`}
      data-idx={idx}
      onDragOver={handlers.rowDrag.onDragOver}
      onDragLeave={handlers.rowDrag.onDragLeave}
      onDrop={handlers.rowDrag.onDrop}
    >
      <div
        className="drag-handle"
        draggable
        title="Drag to reorder this row"
        onDragStart={handlers.rowDrag.onDragStart}
        onDragEnd={handlers.rowDrag.onDragEnd}
      >
        ☰
      </div>

      <div className="item-num">{idx + 1}</div>

      <div className="item-inputs">
        <div className="item-type-toggle">
          <button
            className={`type-btn ${!isTD ? "active single" : ""}`}
            onClick={() => isTD && handlers.onToSingle()}
          >
            Single
          </button>
          <button
            className={`type-btn ${isTD ? "active td" : ""}`}
            onClick={() => !isTD && handlers.onToTD()}
          >
            Truth/Dare
          </button>
        </div>

        {!isTD ? (
          <>
            <div
              className="td-half single-drop-target"
              {...handlers.halfDrag.singleDropProps()}
            >
              <div
                className="half-drag-handle single-handle"
                draggable
                title="Drag to swap this single with any slot"
                onDragStart={(e) => handlers.halfDrag.onStart(e, "truth")}
                onDragEnd={handlers.halfDrag.onEnd}
              >
                <span className="half-handle-label">S</span>
                <span className="half-handle-dots">⠿</span>
              </div>
              <textarea
                className="item-input"
                value={single.value}
                onChange={(e) =>
                  handlers.onChangeField("value", e.target.value)
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
              onChange={(v) => handlers.onChangeField("spicy", v)}
              placeholder="Spicy version..."
              spicyVisible={spicyVisible}
              dragHandleProps={handlers.spicyDrag.handleProps("spicy")}
              dropProps={handlers.spicyDrag.dropProps("spicy")}
            />
          </>
        ) : (
          <div className="td-halves">
            <HalfRow
              half="truth"
              value={td.truth}
              onChange={(v) => handlers.onChangeField("truth", v)}
              onDelete={() => handlers.onDeleteHalf("truth")}
              onDragStart={(e) => handlers.halfDrag.onStart(e, "truth")}
              onDragEnd={handlers.halfDrag.onEnd}
              {...handlers.halfDrag.dropProps("truth")}
            />
            <SpicyFieldRow
              value={td.spicyTruth}
              onChange={(v) => handlers.onChangeField("spicyTruth", v)}
              placeholder="Spicy truth..."
              spicyVisible={spicyVisible}
              dragHandleProps={handlers.spicyDrag.handleProps("spicyTruth")}
              dropProps={handlers.spicyDrag.dropProps("spicyTruth")}
            />
            <HalfRow
              half="dare"
              value={td.dare}
              onChange={(v) => handlers.onChangeField("dare", v)}
              onDelete={() => handlers.onDeleteHalf("dare")}
              onDragStart={(e) => handlers.halfDrag.onStart(e, "dare")}
              onDragEnd={handlers.halfDrag.onEnd}
              {...handlers.halfDrag.dropProps("dare")}
            />
            <SpicyFieldRow
              value={td.spicyDare}
              onChange={(v) => handlers.onChangeField("spicyDare", v)}
              placeholder="Spicy dare..."
              spicyVisible={spicyVisible}
              dragHandleProps={handlers.spicyDrag.handleProps("spicyDare")}
              dropProps={handlers.spicyDrag.dropProps("spicyDare")}
            />
          </div>
        )}
      </div>

      <button
        className="item-delete"
        onClick={handlers.onClear}
        title="Clear this slot"
        aria-label={`Clear slot ${idx + 1}`}
      >
        ×
      </button>
    </div>
  );
};

export default ListEditorItem;
