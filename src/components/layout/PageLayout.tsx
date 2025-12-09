import type { ReactNode } from 'react';

import { APP_TEXT } from '../../constants';
import styles from './PageLayout.module.css';

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className={styles.appShell}>
      <div className={styles.appRoot}>
        <header className={styles.appTopbar}>
          <div className={styles.appTopbar__brand}>
            <div className={styles.appTopbar__logo}>ψ</div>
            <div className={styles.appTopbar__name}>
              {APP_TEXT.APP_NAME}{' '}
              <span className={styles.appTopbar__beta}>{APP_TEXT.APP_BETA}</span>
            </div>
          </div>
          <div className={styles.appTopbar__right}>
            {APP_TEXT.APP_TAGLINE}
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
