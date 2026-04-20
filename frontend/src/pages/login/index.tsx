import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth';
import { GoogleLoginButton } from '@/features/google-login';
import { Spinner } from '@/shared/ui';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/garage', { replace: true });
  }, [isAuthenticated, navigate]);

  if (isLoading) return <Spinner />;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>MTS</div>
        <p className={styles.tagline}>Motorcycle Tracker System</p>
        <div className={styles.loginWrap}>
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
}
