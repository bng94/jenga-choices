import styles from "./SpicyToggle.module.css";

interface SpicyToggleProps {
  enabled: boolean;
  onToggle: () => void;
  variant?: "header" | "editor" | "viewer";
}

const SpicyToggle = ({
  enabled,
  onToggle,
  variant = "header",
}: SpicyToggleProps) => {
  const label = "Spicy";
  const title = enabled ? "Click to disable spicy mode" : "Enable spicy mode";

  return (
    <button
      className={
        styles.spicyToggle +
        " " +
        styles[`spicyToggle--${variant}`] +
        " " +
        (enabled ? styles.spicyToggleOn : "")
      }
      onClick={onToggle}
      title={title}
      type="button"
    >
      🔥 {label}
    </button>
  );
};

export default SpicyToggle;
