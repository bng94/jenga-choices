import { useEffect, useState } from "react";
import type {
  BlockType,
  CustomList,
  EditorItem,
  EditorSingleItem,
  EditorTDItem,
  GamePhase,
  LastReveal,
  NumberedOrder,
  RevealStep,
} from "../../types";
import { shuffle } from "../../utils/shuffle";
import { deserializeItem, itemHasSpicyContent } from "../../utils/itemModel";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import ActiveListViewer from "../Lists/ActiveListViewer/ActiveListViewer";
import styles from "./ClassicMode.module.css";
import ClassicModeInfoPanel from "./ClassModeInfoPanel";
import SetupScreen from "./SetupScreen";

const isBlankItem = (item: EditorItem): boolean =>
  item.type === "single" &&
  ((item as EditorSingleItem).value.trim() === "" ||
    (item as EditorSingleItem).value.trim().toLowerCase() === "blank" ||
    (item as EditorSingleItem).value.trim().toLowerCase() === "blanks");

const itemHalfHasSpicy = (
  item: EditorItem,
  half: "truth" | "dare" | null,
): boolean => {
  if (item.type === "single") return !!(item as EditorSingleItem).spicy.trim();
  const td = item as EditorTDItem;
  if (half === "truth") return !!td.spicyTruth.trim();
  if (half === "dare") return !!td.spicyDare.trim();
  return false;
};

const resolvePromptText = (
  item: EditorItem,
  half: "truth" | "dare" | null,
  useSpicy: boolean,
): string => {
  if (item.type === "single") {
    const s = item as EditorSingleItem;
    return useSpicy && s.spicy.trim() ? s.spicy : s.value;
  }
  const td = item as EditorTDItem;
  if (half === "truth")
    return useSpicy && td.spicyTruth.trim() ? td.spicyTruth : td.truth;
  if (half === "dare")
    return useSpicy && td.spicyDare.trim() ? td.spicyDare : td.dare;
  return "";
};

const padToFiftyFour = (items: EditorItem[]): EditorItem[] => {
  const blank: EditorSingleItem = { type: "single", value: "", spicy: "" };
  const padded = [...items];
  while (padded.length < 54) padded.push({ ...blank });
  return padded;
};

interface ClassicModeProps {
  activeList: CustomList;
}

const ClassicMode = ({ activeList }: ClassicModeProps) => {
  const [gamePhase, setGamePhase] = useState<GamePhase>("setup");
  const [blockType, setBlockType] = useState<BlockType | null>(null);

  const [shuffledList, setShuffledList] = useState<EditorItem[]>(() =>
    shuffle(padToFiftyFour(activeList.items.map(deserializeItem))),
  );
  const [listOrderList, setListOrderList] = useState<EditorItem[]>(() =>
    padToFiftyFour(activeList.items.map(deserializeItem)),
  );

  /** Controls whether numbered mode uses random or list order. Default is random. */
  const [numberedOrder, setNumberedOrder] = useState<NumberedOrder>("random");

  const [usedPositions, setUsedPositions] = useState<Set<number>>(new Set());
  const [spicyEnabled, setSpicyEnabled] = useState(false);
  const [revealedItem, setRevealedItem] = useState<EditorItem | null>(null);
  const [lastReveal, setLastReveal] = useState<LastReveal | null>(null);

  /**
   * The last completed reveal that had actual prompt content.
   * Separate from lastReveal so a blank pull doesn't erase it.
   */
  const [lastWrittenReveal, setLastWrittenReveal] = useState<LastReveal | null>(
    null,
  );

  const [revealStep, setRevealStep] = useState<RevealStep | null>(null);
  const [chosenHalf, setChosenHalf] = useState<"truth" | "dare" | null>(null);
  const [chosenSpicy, setChosenSpicy] = useState(false);
  const [numberInput, setNumberInput] = useState("");
  const [numberError, setNumberError] = useState("");
  const [showLast, setShowLast] = useState(false);
  const [showListViewer, setShowListViewer] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmSwitchBlockType, setShowConfirmSwitchBlockType] =
    useState(false);

  const activeList_ = numberedOrder === "random" ? shuffledList : listOrderList;
  const totalCount = activeList_.length;
  const revealedCount = usedPositions.size;
  const allRevealed = revealedCount >= totalCount;
  const activeListName = activeList.name;
  const listHasSpicy = activeList.items.some(itemHasSpicyContent);
  const filledCount = activeList.items
    .map(deserializeItem)
    .filter((it) => !isBlankItem(it)).length;
  const gameNotStarted = revealedCount === 0;

  useEffect(() => {
    const base = padToFiftyFour(activeList.items.map(deserializeItem));
    setShuffledList(shuffle([...base]));
    setListOrderList(base);
    setUsedPositions(new Set());
    setRevealedItem(null);
    setLastReveal(null);
    setLastWrittenReveal(null);
    setRevealStep(null);
    setChosenHalf(null);
    setChosenSpicy(false);
    setShowLast(false);
    setGamePhase("setup");
    setBlockType(null);
    setNumberInput("");
    setNumberError("");
    setSpicyEnabled(false);
    setNumberedOrder("random");
  }, [activeList.id]);

  const handleStartGame = () => {
    if (!blockType) return;
    setGamePhase("playing");
  };

  const openReveal = (item: EditorItem) => {
    setRevealedItem(item);
    setChosenHalf(null);
    setChosenSpicy(false);
    if (isBlankItem(item)) {
      setRevealStep("blank");
      return;
    }
    if (item.type === "td") {
      setRevealStep("td-choice");
      return;
    }
    if (spicyEnabled && itemHalfHasSpicy(item, null)) {
      setRevealStep("spicy-choice");
    } else {
      setRevealStep("prompt");
    }
  };

  const handlePickHalf = (half: "truth" | "dare") => {
    setChosenHalf(half);
    if (spicyEnabled && revealedItem && itemHalfHasSpicy(revealedItem, half)) {
      setRevealStep("spicy-choice");
    } else {
      setRevealStep("prompt");
    }
  };

  const handlePickSpicy = (wantsSpicy: boolean) => {
    setChosenSpicy(wantsSpicy);
    setRevealStep("prompt");
  };

  const handleDoneReveal = () => {
    if (revealedItem) {
      const reveal = {
        item: revealedItem,
        half: chosenHalf,
        useSpicy: chosenSpicy,
      };
      setLastReveal(reveal);
      if (!isBlankItem(revealedItem)) {
        setLastWrittenReveal(reveal);
      }
    }
    setRevealStep(null);
    setRevealedItem(null);
    setChosenHalf(null);
    setChosenSpicy(false);
  };

  const handleCloseReveal = () => {
    setRevealStep(null);
    setRevealedItem(null);
    setChosenHalf(null);
    setChosenSpicy(false);
  };

  const handleRevealRandom = () => {
    const available = [...Array(shuffledList.length).keys()].filter(
      (i) => !usedPositions.has(i),
    );
    if (available.length === 0) return;
    const pos = available[Math.floor(Math.random() * available.length)];
    setUsedPositions((prev) => new Set(prev).add(pos));
    openReveal(shuffledList[pos]);
  };

  const handleRevealByNumber = () => {
    const num = parseInt(numberInput, 10);
    if (isNaN(num) || num < 1 || num > activeList_.length) {
      setNumberError(`Enter a number between 1 and ${activeList_.length}.`);
      return;
    }
    const pos = num - 1;
    if (usedPositions.has(pos)) {
      setNumberError(`Block ${num} has already been revealed.`);
      return;
    }
    setUsedPositions((prev) => new Set(prev).add(pos));
    openReveal(activeList_[pos]);
    setNumberInput("");
    setNumberError("");
  };

  const handleReset = () => {
    const base = padToFiftyFour(activeList.items.map(deserializeItem));
    setShuffledList(shuffle([...base]));
    setListOrderList(base);
    setUsedPositions(new Set());
    setRevealedItem(null);
    setLastReveal(null);
    setLastWrittenReveal(null);
    setRevealStep(null);
    setChosenHalf(null);
    setChosenSpicy(false);
    setShowLast(false);
    setNumberInput("");
    setNumberError("");
    setShowConfirmReset(false);
    setNumberedOrder("random");
  };

  const handleConfirmSwitchBlockType = () => {
    if (revealedCount > 0) setShowConfirmSwitchBlockType(true);
    else doSwitchBlockType();
  };

  const doSwitchBlockType = () => {
    handleReset();
    setBlockType(blockType === "blank" ? "numbered" : "blank");
    setShowConfirmSwitchBlockType(false);
    setGamePhase("setup");
  };

  if (gamePhase === "setup") {
    return (
      <SetupScreen
        blockType={blockType}
        setBlockType={setBlockType}
        handleStartGame={handleStartGame}
        activeListName={activeListName}
      />
    );
  }

  return (
    <>
      <main className={styles.screen}>
        <div className={styles.container}>
          <div className={styles.helpFloat}>
            <ClassicModeInfoPanel />
          </div>

          <div className={styles.playingHeader}>
            <div className={styles.playingListName}>{activeListName}</div>
            {listHasSpicy && (
              <button
                className={`${styles.spicyToggle} ${spicyEnabled ? styles.spicyToggleOn : ""}`}
                onClick={() => setSpicyEnabled((v) => !v)}
                title={spicyEnabled ? "Spicy mode on" : "Spicy mode off"}
              >
                🔥 Spicy
              </button>
            )}
          </div>

          <div className={styles.statsRow}>
            <span>
              <strong>{revealedCount}</strong> revealed
            </span>
            <span className={styles.statSep}>·</span>
            <span>
              <strong>{totalCount - revealedCount}</strong> remaining
            </span>
            <span className={styles.statSep}>·</span>
            <span>
              <strong>{totalCount}</strong> total
            </span>
          </div>

          {allRevealed ? (
            <div className={styles.doneBox}>
              <span className={styles.doneIcon}>🎉</span>
              <p className={styles.doneText}>
                All {totalCount} blocks have been pulled!
              </p>
              <button
                className={styles.resetBtn}
                onClick={() => setShowConfirmReset(true)}
              >
                ↺ Reset Game
              </button>
            </div>
          ) : blockType === "numbered" ? (
            <div className={styles.numberedArea}>
              {gameNotStarted && (
                <div className={styles.orderToggleRow}>
                  <span className={styles.orderToggleLabel}>Block order:</span>
                  <div className={styles.orderToggleBtns}>
                    <button
                      className={`${styles.orderBtn} ${numberedOrder === "random" ? styles.orderBtnActive : ""}`}
                      onClick={() => setNumberedOrder("random")}
                    >
                      🔀 Random
                    </button>
                    <button
                      className={`${styles.orderBtn} ${numberedOrder === "list" ? styles.orderBtnActive : ""}`}
                      onClick={() => setNumberedOrder("list")}
                    >
                      📋 List Order
                    </button>
                  </div>
                  <span className={styles.orderToggleHint}>
                    {numberedOrder === "random"
                      ? "Each block number corresponds to a different prompt"
                      : "Each block number matches its position in your list"}
                  </span>
                </div>
              )}
              <label className={styles.numberLabel}>Enter Block Number:</label>
              <input
                className={`${styles.numberInput} ${numberError ? styles.numberInputError : ""}`}
                type="number"
                min={1}
                max={activeList_.length}
                value={numberInput}
                onChange={(e) => {
                  setNumberInput(e.target.value);
                  setNumberError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleRevealByNumber()}
                placeholder="e.g. 26"
                autoFocus
              />
              {numberError && (
                <p className={styles.numberError}>{numberError}</p>
              )}
              <button
                className={styles.revealBtn}
                onClick={handleRevealByNumber}
                disabled={!numberInput.trim()}
              >
                Reveal Prompt
              </button>
            </div>
          ) : (
            <div className={styles.blankArea}>
              <p className={styles.revealHint}>
                Pull a block from the tower, then tap to reveal.
              </p>
              <button className={styles.revealBtn} onClick={handleRevealRandom}>
                🎲 Reveal Prompt
              </button>
            </div>
          )}

          {lastReveal && (
            <button
              className={styles.secondaryBtn}
              onClick={() => setShowLast(true)}
            >
              ↩ View Last Prompt
            </button>
          )}
          <button
            className={styles.secondaryBtn}
            onClick={() => setShowListViewer(true)}
          >
            📋 View Active List
          </button>
          <button
            className={styles.switchBtn}
            onClick={handleConfirmSwitchBlockType}
          >
            ⇄ Switch Block Type
          </button>
          <button
            className={styles.resetDangerBtn}
            disabled={revealedCount === 0}
            onClick={() => setShowConfirmReset(true)}
          >
            ↺ Reset Game
          </button>
        </div>

        {showConfirmSwitchBlockType && (
          <ConfirmDialog
            title="Switch Block Type"
            message="Are you sure you want to switch the block type? All progress will be lost."
            confirmLabel="Switch"
            cancelLabel="Cancel"
            onConfirm={doSwitchBlockType}
            onCancel={() => setShowConfirmSwitchBlockType(false)}
          />
        )}
      </main>

      {revealStep !== null && revealedItem && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            if (revealStep === "td-choice" || revealStep === "spicy-choice")
              return;
            handleCloseReveal();
          }}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {revealStep === "blank" && (
              <>
                <h3 className={styles.modalTitle}>You pulled a blank</h3>
                <div className={styles.blankRevealIcon}>🧱</div>
                <p className={styles.blankRevealSub}>
                  This block has no prompt!
                  <br />
                  Perfect for a house rule or group choice.
                </p>
                <button
                  className={styles.modalClose}
                  onClick={handleDoneReveal}
                >
                  Done
                </button>
              </>
            )}

            {revealStep === "td-choice" && (
              <>
                <h3 className={styles.modalTitle}>Truth or Dare?</h3>
                <p className={styles.modalSub}>Choose one:</p>
                <div className={styles.tdChoiceRow}>
                  <button
                    className={styles.tdChoiceBtn}
                    onClick={() => handlePickHalf("truth")}
                  >
                    <span className={styles.tdBadgeTruth}>T</span>Truth
                  </button>
                  <button
                    className={`${styles.tdChoiceBtn} ${styles.tdChoiceBtnDare}`}
                    onClick={() => handlePickHalf("dare")}
                  >
                    <span className={styles.tdBadgeDare}>D</span>Dare
                  </button>
                </div>
              </>
            )}

            {revealStep === "spicy-choice" && (
              <>
                <div className={styles.spicyAskIcon}>🔥</div>
                <h3 className={styles.modalTitle}>Spicy Version Available</h3>
                <p className={styles.modalSub}>
                  This prompt has a spicier version. Do you want it?
                </p>
                <div className={styles.spicyChoiceRow}>
                  <button
                    className={styles.spicyYesBtn}
                    onClick={() => handlePickSpicy(true)}
                  >
                    Yes, Spicy 🔥
                  </button>
                  <button
                    className={styles.spicyNoBtn}
                    onClick={() => handlePickSpicy(false)}
                  >
                    No thanks
                  </button>
                </div>
              </>
            )}

            {revealStep === "prompt" && (
              <>
                <h3 className={styles.modalTitle}>
                  {revealedItem.type === "td"
                    ? chosenHalf === "truth"
                      ? "Truth"
                      : "Dare"
                    : "Your Prompt"}
                </h3>
                {chosenSpicy && (
                  <span className={styles.spicyBadge}>🔥 Spicy</span>
                )}
                <p className={styles.modalPrompt}>
                  {resolvePromptText(revealedItem, chosenHalf, chosenSpicy)}
                </p>
                <button
                  className={styles.modalClose}
                  onClick={handleDoneReveal}
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showLast && lastReveal && (
        <div className={styles.modalOverlay} onClick={() => setShowLast(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Last Prompt</h3>

            {isBlankItem(lastReveal.item) ? (
              <>
                <div className={styles.blankRevealIcon}>🧱</div>
                <p className={styles.blankRevealSub}>Last block was a blank.</p>
                {lastWrittenReveal && (
                  <div className={styles.lastWrittenBlock}>
                    <p className={styles.lastWrittenLabel}>
                      Last written prompt:
                    </p>
                    {lastWrittenReveal.item.type === "single" ? (
                      <div
                        className={`${styles.lastVersionRow} ${!lastWrittenReveal.useSpicy ? styles.lastVersionChosen : styles.lastVersionDim}`}
                      >
                        <p className={styles.lastVersionLabel}>Regular</p>
                        <p className={styles.lastVersionText}>
                          {(lastWrittenReveal.item as EditorSingleItem).value}
                        </p>
                      </div>
                    ) : (
                      <div className={styles.lastVersionRow}>
                        <p className={styles.lastVersionLabel}>
                          {lastWrittenReveal.half === "truth"
                            ? "Truth"
                            : "Dare"}
                        </p>
                        <p className={styles.lastVersionText}>
                          {resolvePromptText(
                            lastWrittenReveal.item,
                            lastWrittenReveal.half,
                            lastWrittenReveal.useSpicy,
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : lastReveal.item.type === "single" ? (
              (() => {
                const s = lastReveal.item as EditorSingleItem;
                const hasSpicy = !!s.spicy.trim();
                return (
                  <div className={styles.lastSingleBox}>
                    <div
                      className={`${styles.lastVersionRow} ${!lastReveal.useSpicy ? styles.lastVersionChosen : styles.lastVersionDim}`}
                    >
                      <p className={styles.lastVersionLabel}>Regular</p>
                      <p className={styles.lastVersionText}>{s.value}</p>
                    </div>
                    {hasSpicy && (
                      <div
                        className={`${styles.lastVersionRow} ${lastReveal.useSpicy ? styles.lastVersionSpicyChosen : styles.lastVersionDim}`}
                      >
                        <p
                          className={`${styles.lastVersionLabel} ${styles.lastSpicyLabel}`}
                        >
                          Spicy
                        </p>
                        <p className={styles.lastVersionText}>{s.spicy}</p>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              (() => {
                const td = lastReveal.item as EditorTDItem;
                const halves = [
                  {
                    key: "truth" as const,
                    label: "Truth",
                    main: td.truth,
                    spicy: td.spicyTruth,
                  },
                  {
                    key: "dare" as const,
                    label: "Dare",
                    main: td.dare,
                    spicy: td.spicyDare,
                  },
                ];
                return (
                  <div className={styles.lastTDBox}>
                    {halves.map(({ key, label, main, spicy }) => {
                      const isChosen = lastReveal.half === key;
                      const hasSpicy = !!spicy.trim();
                      return (
                        <div
                          key={key}
                          className={`${styles.lastHalfBlock} ${!isChosen ? styles.lastHalfDim : ""}`}
                        >
                          <div className={styles.lastHalfHeader}>
                            <span
                              className={
                                key === "truth"
                                  ? styles.tdBadgeTruth
                                  : styles.tdBadgeDare
                              }
                            >
                              {key === "truth" ? "T" : "D"}
                            </span>
                            <span className={styles.lastHalfLabel}>
                              {label}
                            </span>
                          </div>
                          {isChosen ? (
                            <div className={styles.lastVersionStack}>
                              <div
                                className={`${styles.lastVersionRow} ${!lastReveal.useSpicy ? styles.lastVersionChosen : styles.lastVersionDim}`}
                              >
                                <p className={styles.lastVersionLabel}>
                                  Regular
                                </p>
                                <p className={styles.lastVersionText}>{main}</p>
                              </div>
                              {hasSpicy && (
                                <div
                                  className={`${styles.lastVersionRow} ${lastReveal.useSpicy ? styles.lastVersionSpicyChosen : styles.lastVersionDim}`}
                                >
                                  <p
                                    className={`${styles.lastVersionLabel} ${styles.lastSpicyLabel}`}
                                  >
                                    Spicy
                                  </p>
                                  <p className={styles.lastVersionText}>
                                    {spicy}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className={styles.lastHalfDimText}>{main}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}

            <button
              className={styles.modalClose}
              onClick={() => setShowLast(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showConfirmReset && (
        <ConfirmDialog
          title="Reset Game"
          message="Are you sure you want to reset? All progress will be lost."
          confirmLabel="Reset"
          cancelLabel="Cancel"
          onConfirm={handleReset}
          onCancel={() => setShowConfirmReset(false)}
        />
      )}

      {showListViewer && (
        <ActiveListViewer
          listName={activeListName}
          shuffledMap={activeList_}
          usedPositions={usedPositions}
          onClose={() => setShowListViewer(false)}
        />
      )}
    </>
  );
};

export default ClassicMode;
