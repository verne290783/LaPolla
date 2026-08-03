import LoginForm from '@/components/LoginForm';
import styles from '@/components/login.module.css';

export default function LoginPage() {
  return (
    <main className={styles.container}>
      <div className={`glass-panel ${styles.loginCard}`}>
        <LoginForm />
      </div>
    </main>
  );
}
