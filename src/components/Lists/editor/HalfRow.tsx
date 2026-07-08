import type { DragEventHandler } from "react";
import "./HalfRow.css";

interface HalfRowProps {
  half: "truth" | "dare";
  value: string;
  onChange: (v: string) => void;
  onDelete?: () => void;
  // Drag events for the half-drag handle
  onDragStart: DragEventHandler<HTMLDivElement>;
  onDragEnd: DragEventHandler<HTMLDivElement>;
  // Drop zone events for the containing row
  onDragOver: DragEventHandler<HTMLDivElement>;
  onDragLeave: DragEventHandler<HTMLDivElement>;
  onDrop: DragEventHandler<HTMLDivElement>;
}

/**
 * A single truth or dare input row.
 * The ⠿T / ⠿D handle is draggable for re-pairing.
 * The × button deletes just this half, converting the item to a single.
 */
const HalfRow = ({
  half,
  value,
  onChange,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: HalfRowProps) => {
  const label = half === "truth" ? "T" : "D";
  const inputClass = half === "truth" ? "truth-input" : "dare-input";
  const handleClass = half === "truth" ? "truth-handle" : "dare-handle";
  const placeholder = half === "truth" ? "Truth prompt..." : "Dare prompt...";
  const dragTitle = `Drag to re-pair this ${half} (spicy moves with it)`;

  // const deleteClass = half === "truth" ? "truth-del" : "dare-del";
  // const delTitle =
  //   half === "truth"
  //     ? "Remove truth — keep dare as single"
  //     : "Remove dare — keep truth as single";

  return (
    <div
      className={`td-half ${half}-half`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div
        className={`half-drag-handle ${handleClass}`}
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        title={dragTitle}
      >
        <span className="half-handle-label">{label}</span>
        <span className="half-handle-dots">⠿</span>
      </div>

      <textarea
        className={`item-input ${inputClass}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={350}
        placeholder={placeholder}
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
      />
      {/* 
      <button
        className={`half-delete ${deleteClass}`}
        onClick={onDelete}
        title={delTitle}
        type="button"
      >
        ×
      </button> */}
    </div>
  );
};

export default HalfRow;
