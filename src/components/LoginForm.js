'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import LanguageSelector from '@/components/LanguageSelector';
import styles from './login.module.css';

export default function LoginForm() {
  const t = useTranslations('Login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate auth
    if(email) setIsSent(true);
  };

  if (isSent) {
    return (
      <div className={styles.successState}>
        <div className={styles.checkIcon}>✓</div>
        <h2>{t('emailSent')}</h2>
        <p>Revisa tu bandeja de entrada para continuar.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <img src="/images/logo-default.jpg" alt="La Polla Elite Prediction Club" className={styles.logoImage} />
      </div>
      
      <button type="button" className={`btn-primary ${styles.googleBtn}`}>
        {t('google')}
      </button>

      <div className={styles.divider}>
        <span>O</span>
      </div>

      <div className={styles.inputGroup}>
        <input 
          type="email" 
          className="input-field" 
          placeholder={t('emailPlaceholder')} 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
      </div>

      <div className={styles.inputGroup}>
        <input 
          type="password" 
          className="input-field" 
          placeholder={t('passwordPlaceholder')} 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
      </div>

      <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
        {t('loginButton')}
      </button>

      <a href="#" className={styles.forgot}>
        {t('forgotPassword')}
      </a>

      <div className={styles.langWrapper}>
        <LanguageSelector />
      </div>
    </form>
  );
}
