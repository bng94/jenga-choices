import { type DragEventHandler, type HTMLAttributes } from "react";
import "./SpicyFieldRow.css";

interface SpicyFieldRowProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  spicyVisible: boolean;
  dragHandleProps: HTMLAttributes<HTMLDivElement>;
  dropProps: {
    onDragOver: DragEventHandler<HTMLDivElement>;
    onDragLeave: DragEventHandler<HTMLDivElement>;
    onDrop: DragEventHandler<HTMLDivElement>;
  };
}

/**
 * A spicy input row with a drag handle.
 * When spicyVisible=false, renders as a zero-height hidden div
 * that still accepts drops — the spicy toggle is the gate, not
 * the individual row.
 */
export default function SpicyFieldRow({
  value,
  onChange,
  placeholder,
  spicyVisible,
  dragHandleProps,
  dropProps,
}: SpicyFieldRowProps) {
  // If a value is dropped in from outside, auto-open
  if (!spicyVisible) {
    return <div className="spicy-field spicy-field-hidden" {...dropProps} />;
  }

  const hasValue = value.trim().length > 0;

  if (hasValue) {
    return (
      <div className="spicy-field">
        <div className="spicy-input-row" {...dropProps}>
          <div
            className="spicy-drag-handle"
            title="Drag to move spicy text — can also swap with main text"
            {...dragHandleProps}
          >
            <span className="spicy-badge">🔥</span>
            <span className="spicy-dots">⠿</span>
          </div>
          <input
            className="item-input spicy-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={350}
            placeholder={placeholder}
          />
          <button
            className="half-delete"
            style={{
              opacity: 1,
              color: "#dc505066",
            }}
            type="button"
            onClick={() => onChange("")}
            title="Clear spicy version"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  // Empty slot — inline editable + drop target
  return (
    <div className="spicy-field">
      <div
        className="spicy-drop-closed"
        {...dropProps}
        title="Type a spicy version, or drag spicy text here"
      >
        <span className="spicy-add-icon">🔥</span>
        <input
          className="spicy-inline-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={350}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
