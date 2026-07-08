import { useEffect, useState } from "react";
import styles from "./ThemePicker.module.css";

const THEMES = [
  { id: "wood", label: "Wood", color: "#c9933a" },
  { id: "party", label: "Party", color: "#4868e0" },
  { id: "velvet", label: "Velvet", color: "#9e3060" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];
const STORAGE_KEY = "jc-theme";

const ThemePicker = () => {
  const [active, setActive] = useState<ThemeId>(
    () => (localStorage.getItem(STORAGE_KEY) as ThemeId) ?? "wood",
  );

  useEffect(() => {
    if (active === "wood") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", active);
    }
    localStorage.setItem(STORAGE_KEY, active);
  }, [active]);

  return (
    <div className={styles.picker} aria-label="Theme picker">
      {THEMES.map((t) => (
        <button
          key={t.id}
          className={`${styles.swatch} ${active === t.id ? styles.active : ""}`}
          style={{ "--c": t.color } as React.CSSProperties}
          onClick={() => setActive(t.id)}
          title={t.label}
          aria-label={`${t.label} theme${active === t.id ? " (active)" : ""}`}
        />
      ))}
    </div>
  );
};

export default ThemePicker;
