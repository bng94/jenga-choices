import styles from "./ConfirmDialog.module.css";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <div
      className={styles["confirm-dialog-backdrop"]}
      onClick={(e) => {
        e.stopPropagation();
        onCancel();
      }}
    >
      <div
        className={styles["confirm-dialog"]}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{title}</h2>
        <p>{message}</p>
        <div className={styles["confirm-dialog-buttons"]}>
          <button className={styles["confirm-button"]} onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button className={styles["cancel-button"]} onClick={onCancel}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
