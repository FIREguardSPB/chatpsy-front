import { useTheme } from '../../hooks';
import styles from './ThemeToggle.module.css';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className={styles.themeToggle}
      onClick={toggleTheme}
      aria-label="Переключить тему"
      type="button"
    >
      <div className={`${styles.themeToggle__slider} ${theme === 'dark' ? styles['themeToggle__slider--dark'] : styles['themeToggle__slider--light']}`}>
        {theme === 'dark' ? '🌙' : '☀️'}
      </div>
    </button>
  );
};
