import type { CustomList, StoredItem } from "../../types";
import { itemHasContent, itemHasSpicyContent } from "../../utils/itemModel";
import "./ListCard.css";

function detectListType(
  items: StoredItem[],
): "singles" | "truth-dare" | "mixed" | "empty" {
  if (!items || items.length === 0) return "empty";
  const isTD = (i: StoredItem) =>
    i &&
    typeof i === "object" &&
    !Array.isArray(i) &&
    ("t" in (i as object) || "d" in (i as object));
  const isSingle = (i: StoredItem) =>
    (typeof i === "string" && (i as string).trim().length > 0) ||
    (i && typeof i === "object" && "v" in (i as object));

  const hasTD = items.some(isTD);
  const hasSingle = items.some(isSingle);
  if (hasTD && hasSingle) return "mixed";
  if (hasTD) return "truth-dare";
  return "singles";
}

interface ListCardProps {
  card: CustomList & { isDefault: boolean };
  activeForClassic: boolean;
  activeForBoard: boolean;
  onUseClassic: () => void;
  onUseBoard: () => void;
  onView: () => void;
  onCopyAndEdit?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ListCard = ({
  card,
  activeForClassic,
  activeForBoard,
  onUseClassic,
  onUseBoard,
  onView,
  onCopyAndEdit,
  onEdit,
  onDelete,
}: ListCardProps) => {
  const count = card.items.filter(itemHasContent).length;
  const listType = detectListType(card.items);
  const hasSpicyContent = card.items.some(itemHasSpicyContent);

  /**
   * TODO: SETUP BOARD MODE
   * Set activeForBoard to false by default
   */
  activeForBoard = false;
  /**
   * A list is "locked" if it's currently active for either mode
   */
  const isLocked = activeForClassic || activeForBoard;

  return (
    <div
      className={`list-card ${isLocked ? "is-active" : ""} ${card.isDefault ? "is-default" : ""}`}
    >
      <div className="list-card-header">
        <p className="list-card-name">{card.name}</p>
        <p className="list-card-meta">{count} items</p>
      </div>

      <div className="list-card-tags">
        {card.isDefault && <span className="tag tag-default">Default</span>}
        {!card.isDefault && <span className="tag tag-custom">Custom</span>}
        {activeForClassic && <span className="tag tag-active">Classic</span>}
        {activeForBoard && <span className="tag tag-board">Board</span>}
        {listType === "truth-dare" && (
          <span className="tag tag-td">Truth/Dare</span>
        )}
        {listType === "mixed" && <span className="tag tag-mixed">Mixed</span>}
        {hasSpicyContent && <span className="tag tag-spicy">Spicy</span>}
      </div>

      <div className="list-card-mode-row">
        <div className="mode-use-group">
          <span className="mode-use-label">Classic</span>
          <button
            className={`card-btn ${activeForClassic ? "mode-active" : "primary-sm"}`}
            onClick={activeForClassic ? undefined : onUseClassic}
            disabled={activeForClassic}
            title={
              activeForClassic
                ? "Already active for Classic"
                : "Use for Classic mode"
            }
          >
            {activeForClassic ? "Active" : "Use"}
          </button>
        </div>
        {false && (
          <div className="mode-use-group">
            <span className="mode-use-label">Block Board</span>
            <button
              className={`card-btn ${activeForBoard ? "mode-active" : "primary-sm"}`}
              onClick={activeForBoard ? undefined : onUseBoard}
              disabled={activeForBoard}
              title={
                activeForBoard
                  ? "Already active for Block Board"
                  : "Use for Block Board mode"
              }
            >
              {activeForBoard ? "Active" : "Use"}
            </button>
          </div>
        )}
      </div>

      <div className="list-card-actions">
        <button className="card-btn" onClick={onView}>
          View
        </button>

        {card.isDefault ? (
          <button className="card-btn" onClick={onCopyAndEdit}>
            Copy &amp; Edit
          </button>
        ) : (
          <>
            <button
              className="card-btn"
              onClick={isLocked ? undefined : onEdit}
              disabled={isLocked}
              title={
                isLocked ? "Can't edit an active list mid-game" : "Edit list"
              }
              style={isLocked ? { opacity: 0.4, cursor: "not-allowed" } : {}}
            >
              Edit
            </button>
            <button
              className="card-btn danger"
              onClick={onDelete}
              disabled={isLocked}
              title={
                isLocked
                  ? "Can't delete an active list mid-game"
                  : "Delete list"
              }
              style={isLocked ? { opacity: 0.4, cursor: "not-allowed" } : {}}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ListCard;
