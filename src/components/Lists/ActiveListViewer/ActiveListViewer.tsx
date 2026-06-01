import { useState } from "react";
import type {
  EditorItem,
  EditorSingleItem,
  EditorTDItem,
} from "../../../types";
import styles from "./ActiveListViewer.module.css";

interface ActiveListViewerProps {
  listName: string;
  shuffledMap: EditorItem[];
  usedPositions: Set<number>;
  onClose: () => void;
  houseRules?: string;
}

export default function ActiveListViewer({
  listName,
  shuffledMap,
  usedPositions,
  onClose,
  houseRules,
}: ActiveListViewerProps) {
  const remaining = shuffledMap.length - usedPositions.size;
  const [houseRulesOpen, setHouseRulesOpen] = useState(false);

  const renderItem = (item: EditorItem) => {
    if (item.type === "single") {
      return (
        <span className={styles["alv-single"]}>
          {(item as EditorSingleItem).value}
        </span>
      );
    }
    const td = item as EditorTDItem;
    return (
      <div className={styles["alv-td"]}>
        <div className={styles["alv-td-row"]}>
          <span className={styles["alv-badge truth"]}>T</span>
          <span>{td.truth}</span>
        </div>
        <div className={styles["alv-td-row"]}>
          <span className={styles["alv-badge dare"]}>D</span>
          <span>{td.dare}</span>
        </div>
      </div>
    );
  };

  return (
    <div
      className={styles["alv-overlay"]}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className={styles["alv-modal"]} onClick={(e) => e.stopPropagation()}>
        <div className={styles["alv-header"]}>
          <div>
            <div className={styles["alv-title"]}>{listName}</div>
            <div className={styles["alv-subtitle"]}>
              <span className={styles["alv-stat remaining"]}>
                {remaining} remaining
              </span>
              <span className={styles["alv-dot"]}>·</span>
              <span className={styles["alv-stat pulled"]}>
                {usedPositions.size} pulled
              </span>
            </div>
          </div>
          <button className={styles["alv-close"]} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles["alv-legend"]}>
          <span className={styles["alv-legend-item"]}>
            <span className={styles["alv-legend-dot remaining"]} />
            Remaining
          </span>
          <span className={styles["alv-legend-item"]}>
            <span className={styles["alv-legend-dot pulled"]} />
            Pulled
          </span>
        </div>

        {houseRules?.trim() && (
          <div className={styles["alv-house-rules"]}>
            <button
              type="button"
              className={[styles["alv-house-rules-toggle"], houseRulesOpen ? styles["alv-house-rules-toggle--open"] : ""].join(" ")}
              onClick={() => setHouseRulesOpen((v) => !v)}
            >
              <span>House Rules</span>
              <span className={[styles["alv-house-rules-arrow"], houseRulesOpen ? styles["alv-house-rules-arrow--open"] : ""].join(" ")}>▶</span>
            </button>
            {houseRulesOpen && (
              <div className={styles["alv-house-rules-body"]}>
                <p className={styles["alv-house-rules-text"]}>{houseRules}</p>
              </div>
            )}
          </div>
        )}

        <div className={styles["alv-list"]}>
          {shuffledMap.map((item, pos) => {
            const isPulled = usedPositions.has(pos);
            return (
              <div
                key={pos}
                className={`${styles["alv-item"]} ${isPulled ? styles["alv-item--pulled"] : styles["alv-item--remaining"]}`}
              >
                <span className={styles["alv-pos"]}>{pos + 1}</span>
                <div className={styles["alv-content"]}>{renderItem(item)}</div>
                {isPulled && <span className={styles["alv-check"]}>✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
