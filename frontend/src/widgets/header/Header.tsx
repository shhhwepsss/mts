import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import styles from './Header.module.css';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <Link to="/garage" className={styles.logo}>
        MTS
      </Link>
      <div className={styles.actions}>
        {user && (
          <>
            <Link to="/profile" className={styles.userLink}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className={styles.avatar} />
              ) : (
                <span className={styles.avatarFallback}>{user.name.charAt(0)}</span>
              )}
              <span className={styles.userName}>{user.name}</span>
            </Link>
            <button className={styles.logout} onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
