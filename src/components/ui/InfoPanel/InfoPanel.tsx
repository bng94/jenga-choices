import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./InfoPanel.module.css";

interface InfoPanelProps {
  title: string;
  children: ReactNode;
}

const InfoPanel = ({ title, children }: InfoPanelProps) => {
  const [open, setOpen] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open === false]);

  return (
    <>
      <button
        className={styles.infoTrigger}
        onClick={() => setOpen(true)}
        title={`Help: ${title}`}
        type="button"
        aria-label={`Open help: ${title}`}
      >
        ?
      </button>

      {open && (
        <div className={styles.infoModalOverlay} onClick={() => setOpen(false)}>
          <div
            className={styles.infoModal}
            onClick={(e) => e.stopPropagation()}
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${title}-info-modal`}
            tabIndex={-1}
          >
            <div className={styles.infoModalHeader}>
              <div className={styles.infoModalTitle}>{title}</div>
              <button
                className={styles.infoModalClose}
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.infoModalBody}>{children}</div>
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
    <div className={styles.infoSection}>
      {heading && <div className={styles.infoSectionHeading}>{heading}</div>}
      {children}
    </div>
  );
};

const InfoGrid = ({ children }: { children: ReactNode }) => {
  return <div className={styles.infoGrid}>{children}</div>;
};

interface InfoCardProps {
  icon: string;
  label: string;
  text: string;
}

const InfoCard = ({ icon, label, text }: InfoCardProps) => {
  return (
    <div className={styles.infoCard}>
      <div className={styles.infoCardIcon}>{icon}</div>
      <div className={styles.infoCardLabel}>{label}</div>
      <div className={styles.infoCardText}>{text}</div>
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
      className={`${styles.infoRow} ${centered ? styles.infoRowCentered : ""}`}
    >
      <span className={styles.infoRowIcon}>{icon}</span>
      <span className={styles.infoRowText}>{children}</span>
    </div>
  );
};

export { InfoSection, InfoGrid, InfoCard, InfoRow };
