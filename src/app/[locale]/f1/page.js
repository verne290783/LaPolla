'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';
import styles from './f1.module.css';

export default function F1Page() {
  const t = useTranslations('Forecasts');
  const [activeTab, setActiveTab] = useState('live');

  return (
    <div className={`theme-f1 ${styles.container}`}>
      <nav className={styles.navbar}>
        <Link href="/hub" className={styles.backBtn}>← Hub</Link>
        <h1 className="glow-text">RACING CLUB</h1>
        <div style={{ width: 60 }}></div> {/* Spacer for balance */}
      </nav>

      {/* Segmented Control */}
      <div className={styles.segmentedControl}>
        <button 
          className={`${styles.segmentBtn} ${activeTab === 'global' ? styles.activeSegment : ''}`}
          onClick={() => setActiveTab('global')}
        >
          {t('global')}
        </button>
        <button 
          className={`${styles.segmentBtn} ${activeTab === 'live' ? styles.activeSegment : ''}`}
          onClick={() => setActiveTab('live')}
        >
          {t('live')}
        </button>
      </div>

      {/* Timer / Lock Feedback */}
      <div className={styles.timerBanner}>
        <span className={styles.timerIcon}>⏱️</span>
        <div>
          <p className={styles.timerLabel}>{t('locksin')}</p>
          <p className={styles.timerValue}>02d : 14h : 35m</p>
        </div>
      </div>

      <main className={styles.mainGrid}>
        {/* Pole Position - Highly highlighted */}
        <div className={`glass-panel ${styles.poleCard}`}>
          <div className={styles.poleHeader}>
            <h3>{t('polePosition')}</h3>
            <span className={styles.pointsBadge}>+10 PTS</span>
          </div>
          <div className={styles.slotEmpty}>
            <span className={styles.plusIcon}>+</span>
            <p>Seleccionar Piloto</p>
          </div>
        </div>

        {/* Other predictions grid */}
        <div className={styles.predictionsGrid}>
          {[1, 2, 3, 4, 5].map((pos) => (
            <div key={pos} className={`glass-panel ${styles.predictionCard}`}>
              <div className={styles.positionBadge}>P{pos}</div>
              <div className={styles.slotEmpty}>
                <span className={styles.plusIcon}>+</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
