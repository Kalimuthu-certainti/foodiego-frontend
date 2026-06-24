import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // also check OTP flow token (friend's auth stores it separately)
  const isLoggedIn = !!user || !!localStorage.getItem('accessToken');
  const displayName = user?.name || null;

  function handleLogout() {
    logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <span className={styles.brand} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          FoodieGo
        </span>
        <div className={styles.links}>
          <span className={styles.link} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Restaurants</span>
          <a href="#offers" className={styles.link}>Offers</a>
          <a href="#" className={styles.link}>Help</a>
          {isLoggedIn ? (
            <>
              {displayName && <span className={styles.link}>Hi, {displayName}</span>}
              <button className={styles.loginLink} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className={styles.loginLink} onClick={() => navigate('/login')}>Login</button>
              <button className={styles.registerBtn} onClick={() => navigate('/register')}>Register</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
