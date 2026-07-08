import { useState, useRef, useEffect } from "react";
import { CustomList, GameMode, ImportPreview } from "@types";
import { generateListId } from "@utils/listHelpers";
import { DEFAULT_LISTS } from "@data/defaults";
import ListCard from "./ListCard";
import styles from "./ListManager.module.css";
import ConfirmDialog from "@components/ui/ConfirmDialog/ConfirmDialog";
import { saveCustomLists } from "@utils/storage";
import ListViewer from "./ListViewer";
import ListEditor from "./ListEditor";
import {
  buildImportedList,
  exampleImportCode,
  parseImportFile,
} from "@utils/importList";
import ImportPreviewDialog from "@components/ImportPreviewDialog/ImportPreviewDialog";
import ListManagerInfoPanel from "./ListManagerInfoPanel";

interface ListManagerProps {
  customLists: CustomList[];
  setCustomLists: React.Dispatch<React.SetStateAction<CustomList[]>>;
  classicListId: string;
  boardListId: string;
  onSetActive: (id: string, forMode: GameMode) => void;
  onClose: () => void;
  classicInProgress: boolean;
}

type EditorState = { list: CustomList; isNew: boolean } | null;
type ViewerState = { list: CustomList & { isDefault: boolean } } | null;

const ListManager = ({
  customLists,
  setCustomLists,
  classicListId,
  boardListId,
  onSetActive,
  onClose,
  classicInProgress,
}: ListManagerProps) => {
  const [editing, setEditing] = useState<EditorState>(null);
  const [viewing, setViewing] = useState<ViewerState>(null);
  const [deletingListId, setDeletingListId] = useState<string | null>(null);
  const [pendingUseId, setPendingUseId] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(
    null,
  );
  const [importError, setImportError] = useState<string | null>(null);
  const [showImportHelp, setShowImportHelp] = useState(false);

  const lmModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lmModalRef.current?.focus();
  }, []);

  const handleImportHelpConfirm = () => {
    setShowImportHelp(false);
    document.getElementById("lm-file-input")?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      setImportError(
        "Wrong file type. Please select a .json file exported from Jenga Choices.",
      );
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseImportFile(text);
      if (result.ok) setImportPreview(result.preview);
      else setImportError(result.error.message);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImportConfirm = () => {
    if (!importPreview) return;
    const newList = buildImportedList(importPreview, generateListId());
    setCustomLists((prev) => {
      const next = [...prev, newList];
      saveCustomLists(next);
      return next;
    });
    setImportPreview(null);
  };

  const handleCreateNew = () => {
    const newList: CustomList = {
      id: generateListId(),
      name: "",
      items: Array.from({ length: 54 }, () => ({ v: "" })),
    };
    setEditing({ list: newList, isNew: true });
  };

  const handleCopyDefault = (source: CustomList) => {
    const newList: CustomList = {
      id: generateListId(),
      name: `Copy of ${source.name}`,
      items: source.items.map((it) =>
        it && typeof it === "object" ? { ...it } : it,
      ),
    };
    // The copy only becomes a real list on Save — canceling the editor
    // must leave nothing behind (handleSave appends unknown ids).
    setEditing({ list: newList, isNew: false });
  };

  const handleSave = (updated: CustomList) => {
    setCustomLists((prev) => {
      const next = prev.find((l) => l.id === updated.id)
        ? prev.map((l) => (l.id === updated.id ? updated : l))
        : [...prev, updated];
      saveCustomLists(next);
      return next;
    });
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setDeletingListId(id);
  };

  const handleDeleteConfirm = () => {
    if (!deletingListId) return;
    const updated = customLists.filter((l) => l.id !== deletingListId);
    setCustomLists(updated);
    saveCustomLists(updated);
    if (classicListId === deletingListId)
      onSetActive(DEFAULT_LISTS[0].id, "classic");
    if (boardListId === deletingListId)
      onSetActive(DEFAULT_LISTS[0].id, "board");
    setDeletingListId(null);
  };

  const handleSaveOrder = (updated: CustomList) => {
    setCustomLists((prev) => {
      const next = prev.map((l) => (l.id === updated.id ? updated : l));
      saveCustomLists(next);
      return next;
    });
    setViewing(null);
  };

  const defaultCards = DEFAULT_LISTS.map((l) => ({ ...l, isDefault: true }));

  const allCards = [
    ...defaultCards,
    ...customLists.map((l) => ({ ...l, isDefault: false })),
  ];

  return (
    <div className={styles.lmOverlay} onClick={onClose}>
      <div
        ref={lmModalRef}
        className={styles.lmModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lm-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.lmHeader}>
          <div className={styles.lmHeaderLeft}>
            <div className={styles.lmTitleWrap}>
              <div className={styles.lmTitle} id="lm-modal-title">
                YOUR LISTS
              </div>
              <ListManagerInfoPanel />
            </div>
            <div className={styles.lmSub}>
              Each list holds up to 54 items, one item per Jenga block.
            </div>
          </div>

          <div className={styles.lmHeaderActions}>
            <button className={styles.lmClose} onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className={styles.lmBody}>
          <div className={styles.lmToolbar}>
            <button
              className={styles.lmImportBtn}
              onClick={() => setShowImportHelp(true)}
            >
              ⬆ Import
            </button>
            <input
              id="lm-file-input"
              type="file"
              accept=".json"
              onChange={handleImportFile}
              hidden
            />
            <button className={styles.lmCreateBtn} onClick={handleCreateNew}>
              + New List
            </button>
          </div>

          <div className={styles.listsGrid}>
            {allCards.map((card) => (
              <ListCard
                key={card.id}
                card={card}
                activeForClassic={classicListId === card.id}
                activeForBoard={boardListId === card.id}
                onUseClassic={() => {
                  if (classicInProgress) {
                    setPendingUseId(card.id);
                  } else {
                    onSetActive(card.id, "classic");
                  }
                }}
                onUseBoard={() => onSetActive(card.id, "board")}
                onView={() => setViewing({ list: card })}
                onCopyAndEdit={
                  card.isDefault ? () => handleCopyDefault(card) : undefined
                }
                onEdit={
                  !card.isDefault
                    ? () => setEditing({ list: card, isNew: false })
                    : undefined
                }
                onDelete={
                  !card.isDefault ? () => handleDelete(card.id) : undefined
                }
              />
            ))}
          </div>
        </div>
      </div>

      {showImportHelp && (
        <div
          className={styles.lmImportHelpOverlay}
          onClick={(e) => {
            e.stopPropagation();
            setShowImportHelp(false);
          }}
        >
          <div
            className={styles.lmImportHelpDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.lmImportHelpTitle}>Import a List</h3>
            <p className={styles.lmImportHelpDesc}>
              Import a <strong>.json</strong> file previously exported from
              Jenga Choices.
            </p>
            <div className={styles.lmImportHelpFormat}>
              <p className={styles.lmImportHelpFormatLabel}>Expected format:</p>
              <pre className={styles.lmImportHelpCode}>{exampleImportCode}</pre>
            </div>
            <p className={styles.lmImportHelpHint}>
              You can export any list using the <strong>Export</strong> button
              inside the list viewer.
            </p>
            <div className={styles.lmImportHelpActions}>
              <button
                className={styles.lmImportHelpCancel}
                onClick={() => setShowImportHelp(false)}
              >
                Cancel
              </button>
              <button
                className={styles.lmImportHelpConfirm}
                onClick={handleImportHelpConfirm}
              >
                Choose File
              </button>
            </div>
          </div>
        </div>
      )}

      {importError && (
        <ConfirmDialog
          title="Import Failed"
          message={importError}
          confirmLabel="Cancel"
          cancelLabel="Try Again"
          onConfirm={() => setImportError(null)}
          onCancel={() => {
            setImportError(null);
            setShowImportHelp(true);
          }}
        />
      )}

      {importPreview && (
        <ImportPreviewDialog
          preview={importPreview}
          onConfirm={handleImportConfirm}
          onCancel={() => setImportPreview(null)}
        />
      )}

      {pendingUseId && (
        <ConfirmDialog
          title="Switch List"
          message="Switching lists will reset your current game and any progress will be lost. Continue?"
          confirmLabel="Switch"
          cancelLabel="Cancel"
          onConfirm={() => {
            onSetActive(pendingUseId, "classic");
            setPendingUseId(null);
          }}
          onCancel={() => setPendingUseId(null)}
        />
      )}

      {deletingListId && (
        <ConfirmDialog
          title="Delete List"
          message="Are you sure? This cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingListId(null)}
        />
      )}

      {viewing && (
        <ListViewer
          list={viewing.list}
          onClose={() => setViewing(null)}
          onSave={handleSaveOrder}
        />
      )}

      {editing && (
        <ListEditor
          list={editing.list}
          isNew={editing.isNew}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};

export default ListManager;
