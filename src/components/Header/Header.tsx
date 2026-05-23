import type { AppView } from "../../types";
import styles from "./Header.module.css";

interface HeaderProps {
  view: AppView;
  onViewChange: (v: AppView) => void;
  onShowLists: () => void;
}

const Header = ({ view, onViewChange, onShowLists }: HeaderProps) => {
  return (
    <header className={styles["header"]}>
      <div className={styles["header-left"]}>
        <h1 className={styles["app-title"]}>
          <span className={styles["title-jenga"]}>JENGA</span>
          <span className={styles["title-choices"]}>CHOICES</span>
        </h1>
      </div>

      <div className={styles["header-right"]}>
        <nav className={styles["header-nav"]}>
          {/* <button
            className={`${styles["nav-btn"]} ${styles["nav-btn--switch"]}`}
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
            className={`${styles["nav-btn"]} ${styles["nav-btn--lists"]}`}
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
