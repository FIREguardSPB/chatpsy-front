import { useState } from 'react';
import { APP_TEXT } from '../constants';
import styles from './ErrorModal.module.css';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage?: string;
}

export const ErrorModal = ({ isOpen, onClose, errorMessage }: ErrorModalProps) => {
  const [showTechnical, setShowTechnical] = useState(false);

  if (!isOpen) return null;

  const handleCopyError = () => {
    if (errorMessage) {
      navigator.clipboard.writeText(errorMessage);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{APP_TEXT.ERROR_MODAL_TITLE}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label={APP_TEXT.ERROR_MODAL_CLOSE}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.warningBox}>
            <strong className={styles.warningText}>
              {APP_TEXT.ERROR_MODAL_WARNING}
            </strong>
          </div>

          <p className={styles.message}>
            {APP_TEXT.ERROR_MODAL_MESSAGE}
          </p>

          {errorMessage && (
            <div className={styles.technicalSection}>
              <button
                className={styles.spoilerBtn}
                onClick={() => setShowTechnical(!showTechnical)}
              >
                {showTechnical ? '▼' : '▶'} {APP_TEXT.ERROR_MODAL_TECHNICAL_SHOW}
              </button>

              {showTechnical && (
                <div className={styles.technicalContent}>
                  <pre className={styles.errorText}>{errorMessage}</pre>
                  <button className={styles.copyBtn} onClick={handleCopyError}>
                    {APP_TEXT.ERROR_MODAL_COPY}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.okBtn} onClick={onClose}>
            {APP_TEXT.ERROR_MODAL_OK}
          </button>
        </div>
      </div>
    </div>
  );
};
