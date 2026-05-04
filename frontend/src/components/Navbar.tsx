import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>✓</span>
        <span className={styles.brandName}>TodoPro</span>
      </div>
      <div className={styles.actions}>
        <button onClick={toggleTheme} className={styles.themeBtn} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className={styles.userInfo}>
          <span className={styles.avatar}>{user?.name.charAt(0).toUpperCase()}</span>
          <span className={styles.userName}>{user?.name}</span>
        </div>
        <button onClick={logout} className={styles.logoutBtn}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
