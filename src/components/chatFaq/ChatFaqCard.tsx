import { APP_TEXT } from '../../constants';
import styles from './ChatFaqCard.module.css';
import { useState, useRef, useEffect } from 'react';

export const ChatFaqCard = () => {
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [height, setHeight] = useState<number | undefined>(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInstructionsOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isInstructionsOpen]);

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

      {/* Раздел с инструкцией, который показывается/скрывается с анимацией */}
      <div 
        className={styles.instructionsContainer}
        style={{ height }}
      >
        <div ref={contentRef} className={styles.instructionsContent}>
          {/* Новая подробная инструкция */}
          <div className={styles.detailedInstructions}>
            <h3 className={styles.instructionTitle}>
              {APP_TEXT.DETAILED_INSTRUCTIONS_TITLE}
            </h3>
            
            <div className={styles.instructionSection}>
              <h4 className={styles.instructionStep}>{APP_TEXT.DETAILED_INSTRUCTIONS_STEP_1_TITLE}</h4>
              
              <div className={styles.messengerInstructions}>
                <h5 className={styles.messengerTitle}>{APP_TEXT.DETAILED_INSTRUCTIONS_TELEGRAM_TITLE}</h5>
                <ol className={styles.instructionList}>
                  {APP_TEXT.DETAILED_INSTRUCTIONS_TELEGRAM_STEPS.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
              
              <div className={styles.messengerInstructions}>
                <h5 className={styles.messengerTitle}>{APP_TEXT.DETAILED_INSTRUCTIONS_WHATSAPP_TITLE}</h5>
                <ol className={styles.instructionList}>
                  {APP_TEXT.DETAILED_INSTRUCTIONS_WHATSAPP_STEPS.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
            
            <div className={styles.instructionSection}>
              <h4 className={styles.instructionStep}>{APP_TEXT.DETAILED_INSTRUCTIONS_STEP_2_TITLE}</h4>
              <ol className={styles.instructionList}>
                {APP_TEXT.DETAILED_INSTRUCTIONS_STEP_2_CONTENT.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
                <li>{APP_TEXT.DETAILED_INSTRUCTIONS_STEP_2_CONTENT[3]}
                  <ul className={styles.subItemList}>
                    {APP_TEXT.DETAILED_INSTRUCTIONS_STEP_2_SUBCONTENT.map((subItem, subIndex) => (
                      <li key={subIndex}>{subItem}</li>
                    ))}
                  </ul>
                </li>
              </ol>
            </div>
            
            <div className={styles.instructionSection}>
              <h4 className={styles.instructionStep}>{APP_TEXT.DETAILED_INSTRUCTIONS_STEP_3_TITLE}</h4>
              <p className={styles.instructionText}>
                {APP_TEXT.DETAILED_INSTRUCTIONS_STEP_3_CONTENT_1}
              </p>
              <p className={styles.instructionText}>{APP_TEXT.DETAILED_INSTRUCTIONS_STEP_3_CONTENT_2}</p>
              <ol className={styles.instructionList}>
                {APP_TEXT.DETAILED_INSTRUCTIONS_STEP_3_LIST.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
                <li>{APP_TEXT.DETAILED_INSTRUCTIONS_STEP_3_LIST[1]}
                  <ul className={styles.subItemList}>
                    <li>{APP_TEXT.DETAILED_INSTRUCTIONS_STEP_3_SUBCONTENT}</li>
                  </ul>
                </li>
                <li>{APP_TEXT.DETAILED_INSTRUCTIONS_STEP_3_LIST[2]}</li>
              </ol>
            </div>
            
            <div className={styles.instructionSection}>
              <h4 className={styles.instructionStep}>{APP_TEXT.DETAILED_INSTRUCTIONS_STEP_4_TITLE}</h4>
              <ol className={styles.instructionList}>
                <li>{APP_TEXT.DETAILED_INSTRUCTIONS_STEP_4_LIST[0]}
                  <ul className={styles.subItemList}>
                    {APP_TEXT.DETAILED_INSTRUCTIONS_STEP_4_SUBCONTENT.map((subItem, subIndex) => (
                      <li key={subIndex}>{subItem}</li>
                    ))}
                  </ul>
                </li>
                <li>{APP_TEXT.DETAILED_INSTRUCTIONS_STEP_4_LIST[1]}</li>
                <li>{APP_TEXT.DETAILED_INSTRUCTIONS_STEP_4_LIST[2]}</li>
              </ol>
            </div>
            
            <div className={styles.instructionSection}>
              <h4 className={styles.instructionStep}>{APP_TEXT.DETAILED_INSTRUCTIONS_STEP_5_TITLE}</h4>
              <p className={styles.instructionText}>{APP_TEXT.DETAILED_INSTRUCTIONS_STEP_5_CONTENT}</p>
              <ul className={styles.bulletList}>
                {APP_TEXT.DETAILED_INSTRUCTIONS_STEP_5_LIST.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div className={styles.instructionSection}>
              <h4 className={styles.instructionStep}>{APP_TEXT.DETAILED_INSTRUCTIONS_TIPS_TITLE}</h4>
              <ul className={styles.bulletList}>
                {APP_TEXT.DETAILED_INSTRUCTIONS_TIPS_LIST.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Кнопка сворачивания внизу инструкции - отображается только когда инструкция открыта */}
      {isInstructionsOpen && (
        <div className={styles.bottomCollapse}>
          <button 
            className={styles.collapseButton} 
            onClick={toggleInstructions}
          >
            <span>Свернуть инструкцию</span>
            <span className={`${styles.arrow} ${styles.arrowUp}`}></span>
          </button>
        </div>
      )}
    </section>
  );
};