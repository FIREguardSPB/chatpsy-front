import { useState } from 'react';
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
          <h2 className={styles.title}>⚠️ Ошибка обработки</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.warningBox}>
            <strong className={styles.warningText}>
              Представленный анализ не является действительным результатом работы сервиса.
            </strong>
          </div>

          <p className={styles.message}>
            При обработке информации произошёл сбой. Приносим свои извинения.
            Попробуйте позже или свяжитесь с нами. Ваш запрос не был учтён, и вы можете повторить анализ.
          </p>

          {errorMessage && (
            <div className={styles.technicalSection}>
              <button
                className={styles.spoilerBtn}
                onClick={() => setShowTechnical(!showTechnical)}
              >
                {showTechnical ? '▼' : '▶'} Техническая информация об ошибке
              </button>

              {showTechnical && (
                <div className={styles.technicalContent}>
                  <pre className={styles.errorText}>{errorMessage}</pre>
                  <button className={styles.copyBtn} onClick={handleCopyError}>
                    📋 Скопировать
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.okBtn} onClick={onClose}>
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
