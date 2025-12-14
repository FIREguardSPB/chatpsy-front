import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

import { APP_TEXT } from '../../constants';
import { ThemeToggle } from './ThemeToggle';
import styles from './PageLayout.module.css';

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  const topbarRef = useRef<HTMLDivElement>(null);

  const createRipple = (container: HTMLDivElement, x: number, y: number) => {
    // Создаем элемент волны
    const ripple = document.createElement('div');
    ripple.className = styles.ripple;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    // Добавляем волну в контейнер
    container.appendChild(ripple);

    // Удаляем волну после завершения анимации
    setTimeout(() => {
      ripple.remove();
    }, 1500);
  };

  useEffect(() => {
    // Создаем волновой эффект при монтировании компонента
    if (topbarRef.current) {
      // Создаем волны от центра хедера
      const centerX = topbarRef.current.offsetWidth / 2;
      const centerY = topbarRef.current.offsetHeight / 2;

      // Создаем несколько волн от центра с небольшим интервалом
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          createRipple(topbarRef.current!, centerX, centerY);
        }, i * 400);
      }
    }
  }, []);

  return (
    <div className={styles.appShell}>
      <div className={styles.appRoot}>
        <header ref={topbarRef} className={styles.appTopbar}>
          <div className={styles.appTopbar__brand}>
            <a href="/" className={styles.appTopbar__logoLink}>
              <div className={styles.appTopbar__logo}>ψ</div>
            </a>
            <div className={styles.appTopbar__name}>
              {APP_TEXT.APP_NAME}{' '}
              <span className={styles.appTopbar__beta}>{APP_TEXT.APP_BETA}</span>
            </div>
          </div>
          <div className={styles.appTopbar__right}>
            <ThemeToggle />
          </div>
        </header>

        <header className={styles.heroBanner}>
          <div className={styles.heroText}>
            <div className={styles.heroTag}>{APP_TEXT.HERO_TAG}</div>
            <h1>{APP_TEXT.HERO_TITLE}</h1>
            <p>{APP_TEXT.HERO_DESCRIPTION}</p>
          </div>
          <div className={styles.heroAnimation}>
            <div className={styles.heroAnimation__orb1}></div>
            <div className={styles.heroAnimation__orb2}></div>
            <div className={styles.heroAnimation__orb3}></div>
          </div>
        </header>

        <main className={styles.appMain}>{children}</main>

        <footer className={styles.appFooter}>
          <p>{APP_TEXT.FOOTER_TEXT}</p>
        </footer>
      </div>
    </div>
  );
};
