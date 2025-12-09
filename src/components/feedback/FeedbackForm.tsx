import { useState, type FormEvent } from 'react';

import { httpClient } from '../../api';
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
      setError("Напишите пару слов, что вам понравилось или не понравилось.");
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
      setError("Не получилось отправить отзыв. Попробуйте чуть позже.");
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
          Оставить отзыв и получить ещё несколько анализов
        </button>
      </section>
    );
  }

  return (
    <section className="card feedback-card">
      <h2 className="card__title">Оставить отзыв</h2>
      <p className="card__text">
        Пара предложений о том, насколько полезен вам анализ, что понравилось
        или чего не хватает. За отзыв мы начислим вам ещё несколько анализов.
      </p>

      <form onSubmit={handleSubmit} className={styles.feedbackForm}>
        <label className={styles.feedbackField}>
          <span className={styles.feedbackLabel}>Ваш отзыв</span>
          <textarea
            className={styles.feedbackTextarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Например: «Понравилось, как подробно описаны участники, но хочется ещё больше конкретных рекомендаций…»"
          />
        </label>

        <label className={styles.feedbackField}>
          <span className={styles.feedbackLabel}>
            Контакт для связи (по желанию)
          </span>
          <input
            type="text"
            className={styles.feedbackInput}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="@ник в Telegram или e-mail"
          />
        </label>

        {error && <p className="text-error">{error}</p>}

        <div className={styles.feedbackForm__actions}>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? "Отправляем..." : "Отправить отзыв"}
          </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Отмена
            </button>
        </div>

        <p className={styles.feedbackHint}>
          Мы не передаём отзывы третьим лицам. Они нужны только для улучшения
          сервиса.
        </p>
      </form>
    </section>
  );
}
