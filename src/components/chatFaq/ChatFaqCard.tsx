import { APP_TEXT } from '../../constants';
import styles from './ChatFaqCard.module.css';

export const ChatFaqCard = () => {
  return (
    <section className={`card ${styles.faqCard}`}>
      <h2 className="card__title">{APP_TEXT.FAQ_TITLE}</h2>

      <div className={styles.faqColumns}>
        <div className={styles.faqBlock}>
          <h3 className={styles.faqTitle}>{APP_TEXT.FAQ_TELEGRAM_TITLE}</h3>
          <ol className={styles.faqSteps}>
            {APP_TEXT.FAQ_TELEGRAM_STEPS.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <div className={styles.faqImagePlaceholder}>
            {APP_TEXT.FAQ_IMAGE_PLACEHOLDER}
          </div>
        </div>

        <div className={styles.faqBlock}>
          <h3 className={styles.faqTitle}>{APP_TEXT.FAQ_WHATSAPP_TITLE}</h3>
          <ol className={styles.faqSteps}>
            {APP_TEXT.FAQ_WHATSAPP_STEPS.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <div className={styles.faqImagePlaceholder}>
            {APP_TEXT.FAQ_IMAGE_PLACEHOLDER}
          </div>
        </div>
      </div>
    </section>
  );
};
