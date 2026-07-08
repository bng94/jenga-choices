import type { CustomList, StoredItem } from "@types";
import { itemHasContent, itemHasSpicyContent } from "@utils/itemModel";
import styles from "./ListCard.module.css";

const detectListType = (
  items: StoredItem[],
): "singles" | "truth-dare" | "mixed" | "empty" => {
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
};

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

// onUseBoard stays in ListCardProps for the future board mode
const ListCard = ({
  card,
  activeForClassic,
  activeForBoard,
  onUseClassic,
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
      className={`${styles.listCard} ${isLocked ? styles.isActive : ""} ${card.isDefault ? styles.isDefault : ""}`}
    >
      <div className={styles.listCardHeader}>
        <p className={styles.listCardName}>{card.name}</p>
        <p className={styles.listCardMeta}>{count} items</p>
      </div>

      <div className={styles.listCardTags}>
        {/* Future: when Board mode is live, change ": Active" → ": Classic" and handle Board separately */}
        <span
          className={`${styles.tag} ${
            activeForClassic
              ? styles.tagActive
              : card.isDefault
                ? styles.tagDefault
                : styles.tagCustom
          }`}
        >
          {card.isDefault ? "Default" : "Custom"}
          {activeForClassic ? ": Active" : ""}
        </span>
        {activeForBoard && (
          <span className={`${styles.tag} ${styles.tagBoard}`}>Active: Board</span>
        )}
        {listType === "truth-dare" && (
          <span className={`${styles.tag} ${styles.tagTd}`}>Truth/Dare</span>
        )}
        {listType === "mixed" && (
          <span className={`${styles.tag} ${styles.tagMixed}`}>Mixed</span>
        )}
        {hasSpicyContent && (
          <span className={`${styles.tag} ${styles.tagSpicy}`}>Spicy</span>
        )}
      </div>

      <div className={styles.listCardActions}>
        {!activeForClassic && (
          <button
            className={`${styles.cardBtn} ${styles.primarySm}`}
            onClick={onUseClassic}
            title="Use for Classic mode"
          >
            Use
          </button>
        )}
        <button className={styles.cardBtn} onClick={onView}>
          View
        </button>

        {card.isDefault ? (
          <button
            className={styles.cardBtn}
            onClick={onCopyAndEdit}
            title="Default lists can't be changed; this edits a copy"
          >
            Edit a Copy
          </button>
        ) : (
          <>
            <button
              className={styles.cardBtn}
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
              className={`${styles.cardBtn} ${styles.danger}`}
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
