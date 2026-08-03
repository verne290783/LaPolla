'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import styles from './profile.module.css';

export default function ProfilePage() {
  const tNav = useTranslations('Nav');
  const tRules = useTranslations('Rules');
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <Link href="/hub" className={styles.backBtn}>← Hub</Link>
        <h1 className="glow-text">{tNav('profile')}</h1>
        <div style={{ width: 60 }}></div>
      </nav>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>👤</div>
          <button className={styles.uploadBtn}>+</button>
        </div>
        <h2>Alex F1</h2>
        <p className={styles.subtitle}>Pro Predictor</p>
      </section>

      {/* Stats Grid */}
      <section className={styles.statsGrid}>
        <div className={`glass-panel ${styles.statCard}`}>
          <h3>1540</h3>
          <p>Puntos Totales</p>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <h3>68%</h3>
          <p>Win-Rate</p>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <h3>3</h3>
          <p>Insignias</p>
        </div>
      </section>

      {/* Rules Accordion */}
      <section className={styles.rulesSection}>
        <div 
          className={`glass-panel ${styles.accordionHeader}`}
          onClick={() => setRulesOpen(!rulesOpen)}
        >
          <h3>{tRules('title')}</h3>
          <span>{rulesOpen ? '−' : '+'}</span>
        </div>
        
        {rulesOpen && (
          <div className={`glass-panel ${styles.accordionContent}`}>
            <p className={styles.explicitNote}>
              <strong>NOTA IMPORTANTE:</strong> {tRules('poleNote')}
            </p>
            <ul>
              <li>1er Lugar: 25 pts</li>
              <li>2do Lugar: 18 pts</li>
              <li>3er Lugar: 15 pts</li>
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
