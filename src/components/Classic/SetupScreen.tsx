import styles from "./ClassicMode.module.css";
import type { BlockType } from "@types";

interface SetupScreenProps {
  blockType: BlockType | null;
  setBlockType: (blockType: BlockType | null) => void;
  handleStartGame: () => void;
  activeListName: string;
}
const SetupScreen = ({
  blockType,
  setBlockType,
  handleStartGame,
  activeListName,
}: SetupScreenProps) => {
  return (
    <main className={styles.screen}>
      <div className={styles.container}>
        <div className={styles.setupHeader}>
          <h1 className={styles.setupTitle}>Game Setup</h1>
          <p className={styles.setupDesc}>
            Build your physical tower, then choose how your Jenga blocks are
            labelled:
          </p>
        </div>

        <div className={styles.blockTypeGrid}>
          <button
            className={`${styles.blockCard} ${blockType === "blank" ? styles.blockCardActive : ""}`}
            onClick={() => setBlockType("blank")}
          >
            {blockType === "blank" && (
              <span className={styles.blockCardCheck}>✓</span>
            )}
            <span className={styles.blockCardIcon}>🎲</span>
            <span className={styles.blockCardLabel}>Blank Blocks</span>
            <span className={styles.blockCardDesc}>
              App will automatically reveal a random prompt each turn.
            </span>
          </button>

          <button
            className={`${styles.blockCard} ${blockType === "numbered" ? styles.blockCardActive : ""}`}
            onClick={() => setBlockType("numbered")}
          >
            {blockType === "numbered" && (
              <span className={styles.blockCardCheck}>✓</span>
            )}
            <span className={styles.blockCardIcon}>🔢</span>
            <span className={styles.blockCardLabel}>Numbered Blocks</span>
            <span className={styles.blockCardDesc}>
              You will enter the block number to reveal its specific prompt.
            </span>
          </button>
        </div>

        <button
          className={styles.startBtn}
          disabled={!blockType}
          onClick={handleStartGame}
        >
          Launch Game
        </button>

        <p className={styles.setupListNote}>
          Active list: <strong>{activeListName}</strong>
        </p>
      </div>
    </main>
  );
};

export default SetupScreen;
