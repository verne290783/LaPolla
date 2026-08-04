import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import styles from './hub.module.css';

export default function HubPage() {
  const t = useTranslations('Hub');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <img src="/images/logo-default.jpg" alt="La Polla Elite Prediction Club" className={styles.logoImage} />
      </header>

      <main className={styles.carouselContainer}>
        <div className={styles.carousel}>
          {/* F1 Card (Active) */}
          <Link href="/f1" className={`${styles.card} ${styles.cardActive} theme-f1`}>
            <div className={styles.badgeWrapper}>
              <span className={styles.badgeActive}>
                <span className={styles.dot}></span> {t('active')}
              </span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.iconPlaceholder}>
                🏎️
              </div>
              <h2>{t('f1')}</h2>
              <p>{t('f1Subtitle')}</p>
            </div>
          </Link>

          {/* Champions Card (Upcoming) */}
          <div className={`${styles.card} ${styles.cardUpcoming} theme-champions`}>
            <div className={styles.badgeWrapper}>
              <span className={styles.badgeUpcoming}>
                🔒 {t('upcoming')}
              </span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.iconPlaceholder}>
                ⚽
              </div>
              <h2>{t('champions')}</h2>
              <p>{t('championsSubtitle')}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
