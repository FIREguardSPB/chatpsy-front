import { APP_TEXT } from '../../constants';
import styles from './ChatFaqCard.module.css';
import { useState } from 'react';

export const ChatFaqCard = () => {
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  const toggleInstructions = () => {
    setIsInstructionsOpen(!isInstructionsOpen);
  };

  return (
    <section className={`card ${styles.faqCard}`}>
      <h2 className="card__title">{APP_TEXT.FAQ_TITLE}</h2>
      
      {/* Приветственный текст */}
      <p className={styles.welcomeText}>
        Добро пожаловать в ChatPsy! Здесь вы можете проанализировать переписку из WhatsApp или Telegram с помощью искусственного интеллекта.
      </p>
      
      {/* Кнопка для показа/скрытия инструкции */}
      <button 
        className={styles.instructionsToggle} 
        onClick={toggleInstructions}
        aria-expanded={isInstructionsOpen}
      >
        <span>{isInstructionsOpen ? 'Свернуть' : 'Инструкция'}</span>
        <span className={`${styles.arrow} ${isInstructionsOpen ? styles.arrowUp : styles.arrowDown}`}></span>
      </button>

      {/* Раздел с инструкцией, который показывается/скрывается */}
      {isInstructionsOpen && (
        <>
          <div className={styles.instructionsContent}>
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
          </div>
          
          {/* Кнопка сворачивания внизу инструкции */}
          <div className={styles.bottomCollapse}>
            <button 
              className={styles.collapseButton} 
              onClick={toggleInstructions}
            >
              <span>Свернуть инструкцию</span>
              <span className={`${styles.arrow} ${styles.arrowUp}`}></span>
            </button>
          </div>
        </>
      )}
    </section>
  );
};