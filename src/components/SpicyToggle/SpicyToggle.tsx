import styles from "./SpicyToggle.module.css";

interface SpicyToggleProps {
  enabled: boolean;
  onToggle: () => void;
  variant?: "header" | "editor" | "viewer";
}

export default function SpicyToggle({
  enabled,
  onToggle,
  variant = "header",
}: SpicyToggleProps) {
  const label = "Spicy";
  const title = enabled ? "Click to disable spicy mode" : "Enable spicy mode";

  return (
    <button
      className={
        styles[`spicy-toggle`] +
        " " +
        styles[`spicy-toggle--${variant}`] +
        " " +
        (enabled ? styles[`spicy-toggle--on`] : "")
      }
      onClick={onToggle}
      title={title}
      type="button"
    >
      🔥 {label}
    </button>
  );
}
