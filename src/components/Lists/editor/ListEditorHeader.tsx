import SpicyToggle from "@components/ui/SpicyToggle/SpicyToggle";
import ListEditorInfoPanel from "../ListEditorInfoPanel";

interface ListEditorHeaderProps {
  isNew: boolean;
  filledCount: number;
  unSavedChanges: boolean;
  spicyVisible: boolean;
  onToggleSpicy: () => void;
  onShowPaste: () => void;
  onClose: () => void;
}

const ListEditorHeader = ({
  isNew,
  filledCount,
  unSavedChanges,
  spicyVisible,
  onToggleSpicy,
  onShowPaste,
  onClose,
}: ListEditorHeaderProps) => {
  return (
    <div className="editor-header">
      <div className="editor-title-block">
        <div className="editor-title-content">
          <div className="editor-title" id="editor-title">
            {isNew ? "Create List" : "Edit List"}
          </div>
          <ListEditorInfoPanel />
        </div>
        <div className="editor-subtitle">
          {filledCount !== 54 ? `${filledCount} / 54 items` : "54 items"}
          {unSavedChanges ? " · unsaved changes" : ""}
        </div>
      </div>
      <div className="editor-header-actions">
        <button
          className="editor-paste-btn"
          onClick={onShowPaste}
          title="Paste prompts in bulk"
        >
          📋 Paste
        </button>
        <SpicyToggle
          enabled={spicyVisible}
          onToggle={onToggleSpicy}
          variant="editor"
        />
        <button className="editor-close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default ListEditorHeader;
