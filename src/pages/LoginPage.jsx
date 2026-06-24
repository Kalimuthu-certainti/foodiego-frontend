import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtpLogin } from '../api/auth';
import styles from './LoginPage.module.css';

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.38 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16l.92.92z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

function useTimer(initial) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);
  const reset = (val) => setSeconds(val ?? initial);
  const fmt = () => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  return { seconds, fmt, reset };
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const otpRefs = useRef([]);
  const { seconds, fmt, reset } = useTimer(59);

  async function handleSendOtp() {
    if (phone.length !== 10) { setError('Enter a valid 10-digit phone number.'); return; }
    setError('');
    setSending(true);
    try {
      await sendOtp(phone, 'LOGIN');
      setStep('otp');
      reset(59);
      setTimeout(() => otpRefs.current[0]?.focus(), 120);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleResend() {
    setError('');
    setOtpDigits(Array(6).fill(''));
    try {
      await sendOtp(phone, 'LOGIN');
      reset(59);
      setTimeout(() => otpRefs.current[0]?.focus(), 120);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleVerify() {
    const otp = otpDigits.join('');
    if (otp.length < 6) { setError('Enter the complete 6-digit OTP.'); return; }
    setError('');
    setVerifying(true);
    try {
      const data = await verifyOtpLogin(phone, otp);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  }

  function handleOtpChange(i, val) {
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[i] = cleaned;
    setOtpDigits(next);
    if (cleaned && i < 5) otpRefs.current[i + 1]?.focus();
  }

  function handleOtpKeyDown(i, e) {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === 'Enter') handleVerify();
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = Array(6).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtpDigits(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>

        <div className={styles.card}>
          <h1 className={styles.brand}>FoodieGo</h1>

          {step === 'phone' ? (
            <>
              <p className={styles.subtitle}>Enter your phone number to get an OTP</p>
              <div className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>Phone Number</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.prefix}>+91</span>
                    <span className={styles.inputIcon}><PhoneIcon /></span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                      className={`${styles.input} ${styles.inputWithPrefix}`}
                      autoFocus
                    />
                  </div>
                </div>
                {error && <p className={styles.error}>{error}</p>}
                <button
                  className={styles.loginBtn}
                  onClick={handleSendOtp}
                  disabled={phone.length !== 10 || sending}
                >
                  {sending ? <span className={styles.spinner} /> : 'Get OTP'}
                </button>
              </div>
            </>
          ) : (
            <>
              <button className={styles.backBtn} onClick={() => { setStep('phone'); setError(''); setOtpDigits(Array(6).fill('')); setDevOtp(''); }}>
                <ArrowLeftIcon /> Change number
              </button>
              <p className={styles.subtitle}>OTP sent to <strong>+91 {phone}</strong></p>
              <div className={styles.form}>
                <div className={styles.otpSection}>
                  <div className={styles.otpHeader}>
                    <span className={styles.otpLabel}>Enter 6-digit OTP</span>
                    {seconds > 0
                      ? <span className={styles.otpTimer}>Resend in {fmt()}</span>
                      : <button type="button" className={styles.resendBtn} onClick={handleResend}>Resend OTP</button>
                    }
                  </div>
                  <div className={styles.otpBoxes} onPaste={handleOtpPaste}>
                    {otpDigits.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="tel"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={styles.otpBox}
                      />
                    ))}
                  </div>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <button
                  className={styles.loginBtn}
                  onClick={handleVerify}
                  disabled={otpDigits.join('').length < 6 || verifying}
                >
                  {verifying ? <span className={styles.spinner} /> : 'Verify & Login'}
                </button>
              </div>
            </>
          )}
        </div>

        <p className={styles.noAccount}>
          New here?{' '}
          <button className={styles.registerLink} onClick={() => navigate('/register')}>
            Create an account
          </button>
        </p>

      </div>
    </div>
  );
}
