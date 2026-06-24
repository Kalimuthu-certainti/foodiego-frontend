import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.brand}>FoodieGo</span>
        <div className={styles.links}>
          <a href="#">About Us</a>
          <a href="#">Contact</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
        <span className={styles.copy}>© 2024 FoodieGo. All rights reserved.</span>
      </div>
    </footer>
  );
}
