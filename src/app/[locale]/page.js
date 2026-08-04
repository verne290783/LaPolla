import { redirect } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginForm from '@/components/LoginForm';
import styles from '@/components/login.module.css';

export default async function LoginPage({ params }) {
  const { locale } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect({ href: '/hub', locale });
  }

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

