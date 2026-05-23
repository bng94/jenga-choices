import type { HalfEmptyEntry } from "../../../types";
import "./SaveWarningDialog.css";

interface SaveWarningDialogProps {
  halfEmpty: HalfEmptyEntry[];
  onFixThem: () => void;
  onSaveAndConvert: () => void;
  onCancel: () => void;
}

export default function SaveWarningDialog({
  halfEmpty,
  onFixThem,
  onSaveAndConvert,
  onCancel,
}: SaveWarningDialogProps) {
  const count = halfEmpty.length;

  return (
    <div
      className="keep-which-overlay"
      onClick={(e) => {
        e.stopPropagation();
        onCancel();
      }}
    >
      <div
        className="keep-which-box save-warning-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="save-warning-icon">⚠️</div>

        <div className="keep-which-title">
          {count === 1
            ? "1 Truth/Dare item has an empty half"
            : `${count} Truth/Dare items have an empty half`}
        </div>

        <p className="save-warning-sub">
          Each Truth/Dare block needs both a truth and a dare. The following{" "}
          {count === 1 ? "row is" : "rows are"} incomplete:
        </p>

        <div className="save-warning-list">
          {halfEmpty.map(({ item, idx }) => {
            const hasTruth = item.truth.trim();
            const hasDare = item.dare.trim();
            return (
              <div key={idx} className="save-warning-row">
                <span className="save-warning-num">#{idx + 1}</span>
                <div className="save-warning-halves">
                  <span
                    className={`sw-half ${hasTruth ? "has-content" : "is-empty"}`}
                  >
                    <span className="viewer-td-label truth">T</span>
                    {hasTruth || <em>empty</em>}
                  </span>
                  <span
                    className={`sw-half ${hasDare ? "has-content" : "is-empty"}`}
                  >
                    <span className="viewer-td-label dare">D</span>
                    {hasDare || <em>empty</em>}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="save-warning-choice-label">What would you like to do?</p>

        <div className="save-warning-actions">
          <button className="keep-btn save-warning-fix" onClick={onFixThem}>
            <span className="save-warning-btn-icon">✏️</span>
            <div>
              <div className="save-warning-btn-title">
                Go back &amp; fill them in
              </div>
              <div className="save-warning-btn-sub">
                Return to the editor with the empty slots highlighted
              </div>
            </div>
          </button>

          <button
            className="keep-btn save-warning-convert"
            onClick={onSaveAndConvert}
          >
            <span className="save-warning-btn-icon">💬</span>
            <div>
              <div className="save-warning-btn-title">
                Save &amp; convert to Single
              </div>
              <div className="save-warning-btn-sub">
                Each incomplete item becomes a single choice using its filled
                half
              </div>
            </div>
          </button>
        </div>

        <button className="keep-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
