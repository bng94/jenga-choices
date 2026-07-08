import styles from "./TDLabel.module.css";

interface TDLabelProps {
  type: "truth" | "dare";
}

/** The small "T" / "D" badge shown beside truth-or-dare prompts. */
const TDLabel = ({ type }: TDLabelProps) => (
  <span className={`${styles.label} ${styles[type]}`}>
    {type === "truth" ? "T" : "D"}
  </span>
);

export default TDLabel;
