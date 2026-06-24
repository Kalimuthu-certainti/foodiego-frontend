import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <span className={styles.brand}>FoodieGo</span>
        <div className={styles.links}>
          <a href="#" className={styles.link}>Restaurants</a>
          <a href="#" className={styles.link}>Offers</a>
          <a href="#" className={styles.link}>Help</a>
          <button className={styles.loginLink} onClick={() => navigate('/login')}>Login</button>
          <button className={styles.registerBtn} onClick={() => navigate('/register')}>Register</button>
        </div>
      </div>
    </nav>
  );
}
