import { useState, type FormEvent } from 'react';

import { httpClient } from '../../api';
import { APP_TEXT } from '../../constants';
import styles from './FeedbackForm.module.css';

interface FeedbackFormProps {
  onSent?: (granted: number) => void;
  initialOpen?: boolean;
}

interface FeedbackResponse {
  ok: boolean;
  granted?: number;
  already_used?: boolean;
  new_limit?: number;
  used?: number;
}

export const FeedbackForm = ({ onSent, initialOpen = false }: FeedbackFormProps) => {
  const [text, setText] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(initialOpen);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      setError(APP_TEXT.FEEDBACK_ERROR);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const resp = await httpClient.post<FeedbackResponse>("/feedback", {
        text,
        contact,
      });

      const granted = resp.data?.granted ?? 0;

      // Сообщаем родителю — он спрячем форму и обновит сообщение
      if (onSent) {
        onSent(granted);
      }
    } catch (err) {
      console.error(err);
      setError(APP_TEXT.FEEDBACK_ERROR_SUBMIT);
    } finally {
      setSubmitting(false);
    }
  };
  // Пока форма закрыта — показываем только ссылку
  if (!open) {
    return (
      <section className="card feedback-card">
        <button
          type="button"
          className={styles.feedbackBtn}
          onClick={() => setOpen(true)}
        >
          {APP_TEXT.FEEDBACK_BUTTON}
        </button>
      </section>
    );
  }

  return (
    <section className="card feedback-card">
      <h2 className="card__title">{APP_TEXT.FEEDBACK_TITLE}</h2>
      <p className="card__text">
        {APP_TEXT.FEEDBACK_DESCRIPTION}
      </p>

      <form onSubmit={handleSubmit} className={styles.feedbackForm}>
        <label className={styles.feedbackField}>
          <span className={styles.feedbackLabel}>{APP_TEXT.FEEDBACK_LABEL_TEXT}</span>
          <textarea
            className={styles.feedbackTextarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder={APP_TEXT.FEEDBACK_PLACEHOLDER}
          />
        </label>

        <label className={styles.feedbackField}>
          <span className={styles.feedbackLabel}>
            {APP_TEXT.FEEDBACK_LABEL_CONTACT}
          </span>
          <input
            type="text"
            className={styles.feedbackInput}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={APP_TEXT.FEEDBACK_CONTACT_PLACEHOLDER}
          />
        </label>

        {error && <p className="text-error">{error}</p>}

        <div className={styles.feedbackForm__actions}>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? APP_TEXT.FEEDBACK_SUBMITTING : APP_TEXT.FEEDBACK_SUBMIT}
          </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              {APP_TEXT.FEEDBACK_CANCEL}
            </button>
        </div>

        <p className={styles.feedbackHint}>
          {APP_TEXT.FEEDBACK_HINT}
        </p>
      </form>
    </section>
  );
}
