import { APP_TEXT } from '../constants';
import styles from './ErrorModal.module.css';

interface TimeoutErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimeoutErrorModal = ({ isOpen, onClose }: TimeoutErrorModalProps) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{APP_TEXT.TIMEOUT_ERROR_TITLE}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label={APP_TEXT.ERROR_MODAL_CLOSE}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.warningBox}>
            <strong className={styles.warningText}>
              {APP_TEXT.TIMEOUT_ERROR_WARNING}
            </strong>
          </div>

          <p className={styles.message}>
            {APP_TEXT.TIMEOUT_ERROR_MESSAGE}
          </p>
        </div>

        <div className={styles.footer}>
          <button className={styles.okBtn} onClick={onClose}>
            {APP_TEXT.TIMEOUT_ERROR_OK}
          </button>
        </div>
      </div>
    </div>
  );
};