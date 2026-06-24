import { useState, useRef, useEffect } from 'react';
import { verifyOtpLogin } from '../api/auth';
import styles from './Auth.module.css';

export default function OtpStep({ mode, phone, expiresIn, onSuccess, onResend }) {
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(expiresIn ?? 600);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  function formatTimer(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  function handleDigitChange(index, value) {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    if (cleaned && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < 6) {
      setError('Enter the complete 6-digit OTP.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // For register mode the parent (App) handles the verify call after collecting details
      if (mode === 'login') {
        const res = await verifyOtpLogin(phone, otp);
        onSuccess(res);
      } else {
        onSuccess(otp);
      }
    } catch (err) {
      setError(err.message);
      setDigits(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setDigits(Array(6).fill(''));
    inputRefs.current[0]?.focus();
    const newExpiry = await onResend();
    setSeconds(newExpiry ?? 600);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <p className={styles.hint}>
        We sent a 6-digit OTP to <strong>+91 {phone}</strong>.
      </p>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Enter OTP</label>
        <div className={styles.otpRow} onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`${styles.otpInput} ${error ? styles.otpInputError : ''}`}
            />
          ))}
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <div className={styles.timerRow}>
        {seconds > 0 ? (
          <span className={styles.timer}>OTP expires in {formatTimer(seconds)}</span>
        ) : (
          <button type="button" className={styles.linkBtn} onClick={handleResend}>
            Resend OTP
          </button>
        )}
      </div>

      <button type="submit" className={styles.btn} disabled={loading || digits.join('').length < 6}>
        {loading ? <span className={styles.spinner} /> : mode === 'register' ? 'Continue' : 'Log In'}
      </button>
    </form>
  );
}
