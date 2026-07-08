import type { EditorTDItem } from "@types";
import Modal from "@components/ui/Modal/Modal";
import "./KeepWhichDialog.css";

interface KeepWhichDialogProps {
  item: EditorTDItem;
  onKeep: (half: "truth" | "dare") => void;
  onCancel: () => void;
}

const KeepWhichDialog = ({
  item,
  onKeep,
  onCancel,
}: KeepWhichDialogProps) => {
  return (
    <Modal variant="dialog" onRequestClose={onCancel}>
      <div className="keep-which-title">
        Convert to Single — keep which text?
      </div>

        <div className="keep-which-options">
          <button
            className="keep-btn keep-truth"
            onClick={() => onKeep("truth")}
          >
            <span className="keep-label-badge truth">T</span>
            <span className="keep-text">
              {item.truth || <em>empty truth</em>}
            </span>
          </button>

          <button className="keep-btn keep-dare" onClick={() => onKeep("dare")}>
            <span className="keep-label-badge dare">D</span>
            <span className="keep-text">
              {item.dare || <em>empty dare</em>}
            </span>
          </button>
        </div>

        <button className="keep-cancel" onClick={onCancel}>
          Cancel
        </button>
    </Modal>
  );
};

export default KeepWhichDialog;
