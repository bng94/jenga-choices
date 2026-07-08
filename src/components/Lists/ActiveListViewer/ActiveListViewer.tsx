import { useState } from "react";
import type {
  EditorItem,
  EditorSingleItem,
  EditorTDItem,
  HouseRule,
} from "@types";
import HouseRulesDisplay from "@components/ui/HouseRules/HouseRulesDisplay";
import styles from "./ActiveListViewer.module.css";

interface ActiveListViewerProps {
  listName: string;
  shuffledMap: EditorItem[];
  usedPositions: Set<number>;
  onClose: () => void;
  houseRules?: HouseRule[];
}

const ActiveListViewer = ({
  listName,
  shuffledMap,
  usedPositions,
  onClose,
  houseRules,
}: ActiveListViewerProps) => {
  const remaining = shuffledMap.length - usedPositions.size;
  const [houseRulesOpen, setHouseRulesOpen] = useState(false);

  const renderItem = (item: EditorItem) => {
    if (item.type === "single") {
      return (
        <span className={styles.alvSingle}>
          {(item as EditorSingleItem).value}
        </span>
      );
    }
    const td = item as EditorTDItem;
    return (
      <div className={styles.alvTd}>
        <div className={styles.alvTdRow}>
          <span className={styles.alvBadgeTruth}>T</span>
          <span>{td.truth}</span>
        </div>
        <div className={styles.alvTdRow}>
          <span className={styles.alvBadgeDare}>D</span>
          <span>{td.dare}</span>
        </div>
      </div>
    );
  };

  return (
    <div
      className={styles.alvOverlay}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className={styles.alvModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.alvHeader}>
          <div>
            <div className={styles.alvTitle}>{listName}</div>
            <div className={styles.alvSubtitle}>
              <span className={styles.alvStatRRemaining}>
                {remaining} remaining
              </span>
              <span className={styles.alvDot}>·</span>
              <span className={styles.alvStatPulled}>
                {usedPositions.size} pulled
              </span>
            </div>
          </div>
          <button className={styles.alvClose} onClick={onClose}>
            ✕
          </button>
        </div>

        {(houseRules?.length ?? 0) > 0 && (
          <div className={styles.alvHouseRules}>
            <button
              type="button"
              className={[
                styles.alvHouseRulesToggle,
                houseRulesOpen ? styles.alvHouseRulesToggleOpen : "",
              ].join(" ")}
              onClick={() => setHouseRulesOpen((v) => !v)}
            >
              <span>House Rules</span>
              <span
                className={[
                  styles.alvHouseRulesArrow,
                  houseRulesOpen ? styles.alvHouseRulesArrowOpen : "",
                ].join(" ")}
              >
                ▶
              </span>
            </button>
            {houseRulesOpen && (
              <div className={styles.alvHouseRulesBody}>
                <HouseRulesDisplay rules={houseRules!} />
              </div>
            )}
          </div>
        )}

        <div className={styles.alvList}>
          {shuffledMap.map((item, pos) => {
            const isPulled = usedPositions.has(pos);
            return (
              <div
                key={pos}
                className={[
                  styles.alvItem,
                  isPulled ? styles.alvItemPulled : styles.alvItemRemaining,
                ].join(" ")}
              >
                <span className={styles.alvPos}>{pos + 1}</span>
                <div className={styles.alvContent}>{renderItem(item)}</div>
                {isPulled && <span className={styles.alvCheck}>✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActiveListViewer;
