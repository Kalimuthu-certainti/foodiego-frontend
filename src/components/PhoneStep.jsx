import { useState } from 'react';
import { sendOtp } from '../api/auth';
import styles from './Auth.module.css';

export default function PhoneStep({ mode, onSuccess }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await sendOtp(phone, mode === 'register' ? 'REGISTER' : 'LOGIN');
      onSuccess(phone, res.expiresIn);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <p className={styles.hint}>
        {mode === 'register'
          ? 'Enter your mobile number to create a FoodieGo account.'
          : 'Enter your registered mobile number to log in.'}
      </p>

      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="phone">Mobile Number</label>
        <div className={styles.phoneRow}>
          <span className={styles.phonePrefix}>+91</span>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            className={styles.input}
            autoFocus
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <button type="submit" className={styles.btn} disabled={loading}>
        {loading ? <span className={styles.spinner} /> : 'Send OTP'}
      </button>
    </form>
  );
}
