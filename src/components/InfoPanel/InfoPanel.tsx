import { useState, type ReactNode } from "react";
import styles from "./InfoPanel.module.css";

interface InfoPanelProps {
  title: string;
  children: ReactNode;
}

const InfoPanel = ({ title, children }: InfoPanelProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={styles["info-trigger"]}
        onClick={() => setOpen(true)}
        title={`Help: ${title}`}
        type="button"
        aria-label={`Open help: ${title}`}
      >
        ?
      </button>

      {open && (
        <div
          className={styles["info-modal-overlay"]}
          onClick={() => setOpen(false)}
        >
          <div
            className={styles["info-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["info-modal-header"]}>
              <div className={styles["info-modal-title"]}>{title}</div>
              <button
                className={styles["info-modal-close"]}
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles["info-modal-body"]}>{children}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfoPanel;

interface InfoSectionProps {
  heading?: string;
  children: ReactNode;
}

const InfoSection = ({ heading, children }: InfoSectionProps) => {
  return (
    <div className={styles["info-section"]}>
      {heading && (
        <div className={styles["info-section-heading"]}>{heading}</div>
      )}
      {children}
    </div>
  );
};

const InfoGrid = ({ children }: { children: ReactNode }) => {
  return <div className={styles["info-grid"]}>{children}</div>;
};

interface InfoCardProps {
  icon: string;
  label: string;
  text: string;
}

const InfoCard = ({ icon, label, text }: InfoCardProps) => {
  return (
    <div className={styles["info-card"]}>
      <div className={styles["info-card-icon"]}>{icon}</div>
      <div className={styles["info-card-label"]}>{label}</div>
      <div className={styles["info-card-text"]}>{text}</div>
    </div>
  );
};

interface InfoRowProps {
  icon: string;
  centered?: boolean;
  children: ReactNode;
}

const InfoRow = ({ icon, centered, children }: InfoRowProps) => {
  return (
    <div
      className={`${styles["info-row"]} ${centered ? styles["info-row-centered"] : ""}`}
    >
      <span className={styles["info-row-icon"]}>{icon}</span>
      <span className={styles["info-row-text"]}>{children}</span>
    </div>
  );
};

export { InfoSection, InfoGrid, InfoCard, InfoRow };
