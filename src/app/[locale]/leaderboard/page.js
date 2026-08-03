'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';
import styles from './leaderboard.module.css';

export default function LeaderboardPage() {
  const t = useTranslations('Leaderboard');
  const [activeTab, setActiveTab] = useState('general');
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock data
  const users = [
    { id: 1, name: 'Alex F1', points: 1540, avatar: '🏎️' },
    { id: 2, name: 'VettelFan', points: 1420, avatar: '🏁' },
    { id: 3, name: 'MaxWin', points: 1300, avatar: '🏆' },
  ];

  return (
    <div className={`theme-f1 ${styles.container}`}>
      <nav className={styles.navbar}>
        <Link href="/hub" className={styles.backBtn}>← Hub</Link>
        <h1 className="glow-text">{t('general')}</h1>
        <div style={{ width: 60 }}></div>
      </nav>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'groups' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          {t('groups')}
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'general' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('general')}
        >
          {t('general')}
        </button>
      </div>

      <main className={styles.tableContainer}>
        <div className={`glass-panel ${styles.tableWrapper}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('rank')}</th>
                <th>{t('user')}</th>
                <th>{t('points')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr key={u.id} onClick={() => setSelectedUser(u)} className={styles.row}>
                  <td className={styles.rank}>#{index + 1}</td>
                  <td className={styles.userInfo}>
                    <span className={styles.avatar}>{u.avatar}</span>
                    {u.name}
                  </td>
                  <td className={styles.points}>{u.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Slide-over / Bottom-sheet */}
      <div className={`${styles.bottomSheet} ${selectedUser ? styles.sheetOpen : ''}`}>
        {selectedUser && (
          <div className={styles.sheetContent}>
            <button className={styles.closeBtn} onClick={() => setSelectedUser(null)}>×</button>
            <div className={styles.sheetHeader}>
              <span className={styles.largeAvatar}>{selectedUser.avatar}</span>
              <h2>{selectedUser.name}</h2>
              <p className={styles.points}>{selectedUser.points} {t('points')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
