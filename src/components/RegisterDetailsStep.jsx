import { useState } from 'react';
import { verifyOtpRegister } from '../api/auth';
import styles from './Auth.module.css';

export default function RegisterDetailsStep({ phone, otp, onSuccess }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setError('Username can only contain letters and numbers.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await verifyOtpRegister(phone, otp, username, email);
      onSuccess(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <p className={styles.hint}>Almost there! Set up your FoodieGo profile.</p>

      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="username">Username <span className={styles.required}>*</span></label>
        <input
          id="username"
          type="text"
          placeholder="e.g. hungrydiner42"
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 30))}
          className={styles.input}
          autoFocus
          autoComplete="username"
        />
        <span className={styles.fieldHint}>3–30 characters, letters and numbers only.</span>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="email">
          Email <span className={styles.optional}>(optional)</span>
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          autoComplete="email"
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.btn} disabled={loading}>
        {loading ? <span className={styles.spinner} /> : 'Create Account'}
      </button>
    </form>
  );
}
