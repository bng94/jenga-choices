import type { AppView } from "@types";
import styles from "./Header.module.css";

interface HeaderProps {
  view: AppView;
  onViewChange: (v: AppView) => void;
  onShowLists: () => void;
}

// view / onViewChange stay in HeaderProps for the future board-mode switch below
const Header = ({ onShowLists }: HeaderProps) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <h1 className={styles.appTitle}>
          <span className={styles.titleJenga}>JENGA</span>
          <span className={styles.titleChoices}>CHOICES</span>
        </h1>
      </div>

      <div className={styles.headerRight}>
        <nav className={styles.headerNav}>
          {/* <button
            className={`${styles.navBtn} ${styles.navBtnSwitch}`}
            onClick={() => onViewChange(view === "board" ? "classic" : "board")}
            title={
              view === "board"
                ? "Switch to Classic Mode"
                : "Switch to Board Mode"
            }
          >
            {view === "board" ? "Switch to Classic" : "Switch to Board"}
          </button> */}
          <button
            className={`${styles.navBtn} ${styles.navBtnLists}`}
            onClick={() => {
              onShowLists();
            }}
          >
            Lists
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
