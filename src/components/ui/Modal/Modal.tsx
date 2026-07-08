import { type ReactNode, type Ref } from "react";
import styles from "./Modal.module.css";

interface ModalProps {
  /** "panel" = large editor shell; "dialog" = small centered confirm box. */
  variant?: "panel" | "dialog";
  /** Called when the backdrop is clicked. Consumers decide what "close" means
   *  (e.g. confirm first when there are unsaved changes). */
  onRequestClose: () => void;
  /** Forwarded to the panel so callers can focus it programmatically. */
  panelRef?: Ref<HTMLDivElement>;
  /** id of the element that labels the dialog, for aria-labelledby. */
  ariaLabelledBy?: string;
  /** Extra classes for the panel (viewer/editor-specific layout tweaks). */
  panelClassName?: string;
  children: ReactNode;
}

const Modal = ({
  variant = "panel",
  onRequestClose,
  panelRef,
  ariaLabelledBy,
  panelClassName,
  children,
}: ModalProps) => {
  const overlayClass =
    variant === "dialog" ? styles.overlayDialog : styles.overlay;
  const shellClass = variant === "dialog" ? styles.box : styles.panel;

  return (
    <div
      className={overlayClass}
      onClick={(e) => {
        e.stopPropagation();
        onRequestClose();
      }}
    >
      <div
        ref={panelRef}
        className={
          panelClassName ? `${shellClass} ${panelClassName}` : shellClass
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
