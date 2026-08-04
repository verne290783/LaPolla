'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import LanguageSelector from '@/components/LanguageSelector';
import styles from './login.module.css';

function SearchParamsHandler({ onError }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlError = searchParams?.get('error');
    const urlErrorDesc = searchParams?.get('error_description');
    if (urlError || urlErrorDesc) {
      onError(urlErrorDesc || urlError);
    }
  }, [searchParams, onError]);

  return null;
}

export default function LoginForm() {
  const t = useTranslations('Login');
  const locale = useLocale();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSent, setIsSent] = useState(false);

  const formatErrorMessage = useCallback((err) => {
    if (!err) return null;
    const msg = typeof err === 'string' ? err : err.message || '';
    
    if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
      return 'Correo o contraseña incorrectos. Por favor verifica tus datos.';
    }
    if (msg.includes('Email not confirmed')) {
      return 'Debes confirmar tu correo electrónico antes de iniciar sesión.';
    }
    if (msg.includes('User already registered') || msg.includes('already exists') || msg.includes('user_already_exists')) {
      return 'Ya existe una cuenta registrada con este correo electrónico.';
    }
    if (msg.includes('Password should be at least') || msg.includes('weak_password')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (msg.includes('invalid email') || msg.includes('Unable to validate email')) {
      return 'Por favor ingresa un correo electrónico válido.';
    }
    if (msg.includes('provider_not_enabled') || msg.includes('Unsupported provider') || msg.includes('provider_disabled')) {
      return 'El inicio de sesión con Google no está habilitado en la configuración de Supabase.';
    }
    if (msg.includes('access_denied') || msg.includes('popup_closed_by_user') || msg.includes('user_cancelled')) {
      return 'El inicio de sesión con Google fue cancelado o denegado.';
    }
    if (msg.includes('missing_code') || msg.includes('auth_exchange_failed')) {
      return 'No se pudo completar la autenticación con Google. Intenta de nuevo.';
    }
    return msg || 'Ocurrió un error durante la autenticación. Intenta de nuevo.';
  }, []);

  const handleUrlError = useCallback((rawErr) => {
    if (rawErr) {
      setError(formatErrorMessage(rawErr));
    }
  }, [formatErrorMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setGoogleLoading(false);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const cleanEmail = (email || '').trim();

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (authError) {
          setError(formatErrorMessage(authError));
          setLoading(false);
          return;
        }

        setMessage('¡Inicio de sesión exitoso! Redirigiendo...');
        setTimeout(() => {
          try {
            router.push('/hub');
          } catch (navErr) {
            console.error('Navigation error, using fallback:', navErr);
            window.location.href = `/${locale || 'es'}/hub`;
          }
        }, 400);

      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

        if (authError) {
          setError(formatErrorMessage(authError));
          setLoading(false);
          return;
        }

        if (data?.session) {
          setMessage('¡Registro exitoso! Redirigiendo...');
          setTimeout(() => {
            try {
              router.push('/hub');
            } catch (navErr) {
              console.error('Navigation error, using fallback:', navErr);
              window.location.href = `/${locale || 'es'}/hub`;
            }
          }, 400);
        } else {
          setIsSent(true);
          setLoading(false);
        }
      }
    } catch (err) {
      setError(formatErrorMessage(err));
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (loading) return;
    setLoading(true);
    setGoogleLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/${locale || 'es'}/auth/callback`,
        },
      });

      if (googleError) {
        setError(formatErrorMessage(googleError));
        setLoading(false);
        setGoogleLoading(false);
      }
    } catch (err) {
      setError(formatErrorMessage(err));
      setLoading(false);
      setGoogleLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setError(null);
    setMessage(null);
  };

  if (isSent) {
    return (
      <div className={styles.successState}>
        <div className={styles.checkIcon}>✓</div>
        <h2>{t('emailSent')}</h2>
        <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: 'var(--font-small)' }}>
          Revisa tu bandeja de entrada para continuar con la confirmación de tu cuenta.
        </p>
        <button
          type="button"
          className="btn-primary"
          style={{ marginTop: '1.5rem', width: '100%', minHeight: '44px' }}
          onClick={() => {
            setIsSent(false);
            setIsLogin(true);
          }}
        >
          Volver a Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsHandler onError={handleUrlError} />
      </Suspense>

      <form className={styles.form} onSubmit={handleSubmit}>
        <button 
          type="button" 
          className={`btn-primary ${styles.googleBtn}`}
          onClick={handleGoogleAuth}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {googleLoading ? (
            <>
              <svg width="20" height="20" viewBox="0 0 50 50">
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray="80"
                  strokeDashoffset="60"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 25 25"
                    to="360 25 25"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
              <span>Iniciando con Google...</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              {t('google')}
            </>
          )}
        </button>

        <div className={styles.divider}>
          <span>O</span>
        </div>

        {error && (
          <div 
            role="alert" 
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#fca5a5',
              fontSize: 'var(--font-small, 0.875rem)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              lineHeight: '1.4'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div 
            role="status"
            style={{
              background: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: 'var(--accent-color, #00f0ff)',
              fontSize: 'var(--font-small, 0.875rem)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              lineHeight: '1.4'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>✓</span>
            <span>{message}</span>
          </div>
        )}

        <div className={styles.inputGroup}>
          <input 
            type="email" 
            className="input-field" 
            placeholder={t('emailPlaceholder')} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required 
            aria-label={t('emailLabel')}
          />
        </div>

        <div className={styles.inputGroup}>
          <input 
            type="password" 
            className="input-field" 
            placeholder={t('passwordPlaceholder')} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required 
            aria-label={t('passwordLabel')}
          />
        </div>

        <button 
          type="submit" 
          className={`btn-primary ${styles.submitBtn}`}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading && !googleLoading ? (
            <>
              <svg width="20" height="20" viewBox="0 0 50 50">
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray="80"
                  strokeDashoffset="60"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 25 25"
                    to="360 25 25"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
              <span>{isLogin ? 'Iniciando sesión...' : 'Registrando...'}</span>
            </>
          ) : (
            isLogin ? t('loginButton') : 'Registrarse'
          )}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={toggleMode}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-color, #00f0ff)',
              fontSize: 'var(--font-small, 0.875rem)',
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? '¿No tienes cuenta? Registrarse' : '¿Ya tienes cuenta? Iniciar sesión'}
          </button>

          {isLogin && (
            <a href="#" className={styles.forgot}>
              {t('forgotPassword')}
            </a>
          )}
        </div>

        <div className={styles.langWrapper}>
          <LanguageSelector />
        </div>
      </form>
    </>
  );
}

