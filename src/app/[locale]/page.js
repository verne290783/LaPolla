import LoginForm from '@/components/LoginForm';
import styles from '@/components/login.module.css';

export default function LoginPage() {
  return (
    <main className={styles.container}>
      <div className={styles.loginLayout}>
        <div className={styles.header}>
          <img src="/images/logo-default.jpg" alt="La Polla Elite Prediction Club" className={styles.logoImage} />
        </div>
        <div className={`glass-panel ${styles.loginCard}`}>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
