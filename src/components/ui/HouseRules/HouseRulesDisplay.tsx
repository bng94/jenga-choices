import type { HouseRule } from "@types";
import styles from "./HouseRulesDisplay.module.css";

interface HouseRulesDisplayProps {
  rules: HouseRule[];
}

/**
 * Renders house rules as cause → effect. Rules without a trigger
 * (e.g. migrated from the old free-text format) show only their text.
 */
const HouseRulesDisplay = ({ rules }: HouseRulesDisplayProps) => {
  return (
    <ul className={styles.rules}>
      {rules.map((rule, i) => (
        <li key={i} className={styles.rule}>
          {rule.when.trim() && (
            <span className={styles.when}>When {rule.when}</span>
          )}
          <span className={styles.then}>{rule.then}</span>
        </li>
      ))}
    </ul>
  );
};

export default HouseRulesDisplay;
