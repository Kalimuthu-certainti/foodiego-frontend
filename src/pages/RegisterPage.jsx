import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { sendOtp, verifyOtpRegister } from '../api/auth';
import styles from './RegisterPage.module.css';

/* ── Icons ─────────────────────────────────────────────── */
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 8 10-8" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.38 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16l.92.92z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

/* ── OTP timer hook ────────────────────────────────────── */
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

/* ── Component ─────────────────────────────────────────── */
export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
  const [error, setError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const otpRefs = useRef([]);
  const usernameTimer = useRef(null);
  const { seconds, fmt, reset } = useTimer(59);

  /* ── Username availability debounce ────────────────────── */
  useEffect(() => {
    clearTimeout(usernameTimer.current);
    if (!username) { setUsernameStatus(null); return; }
    if (username.length < 3) { setUsernameStatus('invalid'); return; }
    if (!/^[a-zA-Z0-9]+$/.test(username)) { setUsernameStatus('invalid'); return; }

    setUsernameStatus('checking');
    usernameTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/diner/auth/check-username?username=${username}`);
        const data = await res.json();
        setUsernameStatus(data.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus(null);
      }
    }, 500);

    return () => clearTimeout(usernameTimer.current);
  }, [username]);

  async function handleSendOtp() {
    if (phone.length !== 10) { setError('Enter a valid 10-digit phone number.'); return; }
    setError('');
    setSendingOtp(true);
    try {
      await sendOtp(phone, 'REGISTER');
      setOtpSent(true);
      reset(59);
      setTimeout(() => otpRefs.current[0]?.focus(), 120);
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleResend() {
    setError('');
    setOtpDigits(Array(6).fill(''));
    try {
      await sendOtp(phone, 'REGISTER');
      reset(59);
      setTimeout(() => otpRefs.current[0]?.focus(), 120);
    } catch (err) {
      setError(err.message);
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
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = Array(6).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtpDigits(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (!username.trim()) { setError('Username is required.'); return; }
    if (username.length < 3) { setError('Username must be at least 3 characters.'); return; }
    if (!/^[a-zA-Z0-9]+$/.test(username)) { setError('Username can only contain letters and numbers.'); return; }
    if (usernameStatus === 'taken') { setError('This username is already taken.'); return; }
    if (!otpSent) { setError('Please verify your phone number with an OTP.'); return; }
    if (otp.length < 6) { setError('Enter the complete 6-digit OTP.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const data = await verifyOtpRegister(phone, otp, username.trim(), email || undefined);
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.wrap}>

          <div className={styles.card}>
            <h1 className={styles.heading}>Create Account</h1>
            <p className={styles.subheading}>Join FoodieGo to discover the best local flavors</p>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>

              {/* Username */}
              <div className={styles.field}>
                <label className={styles.label}>Username</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><UserIcon /></span>
                  <input
                    type="text"
                    placeholder="johndoe123"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 30)); setError(''); }}
                    className={`${styles.input} ${usernameStatus === 'taken' ? styles.inputError : usernameStatus === 'available' ? styles.inputOk : ''}`}
                    autoComplete="username"
                  />
                  {usernameStatus === 'checking' && <span className={styles.fieldSpinner} />}
                  {usernameStatus === 'available' && <span className={styles.fieldOk}><CheckIcon /></span>}
                </div>
                {usernameStatus === 'taken' && <p className={styles.fieldErr}>This username is already taken.</p>}
                {usernameStatus === 'invalid' && username.length > 0 && <p className={styles.fieldErr}>3–30 letters and numbers only.</p>}
              </div>

              {/* Email (optional) */}
              <div className={styles.field}>
                <label className={styles.label}>Email Address <span className={styles.optional}>(optional)</span></label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><EmailIcon /></span>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Phone + Send OTP */}
              <div className={styles.field}>
                <label className={styles.label}>Phone Number</label>
                <div className={styles.phoneRow}>
                  <div className={styles.phoneInputWrap}>
                    <span className={styles.prefix}>+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                      className={`${styles.input} ${styles.inputWithPrefix}`}
                      autoComplete="tel"
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.sendOtpBtn}
                    onClick={handleSendOtp}
                    disabled={sendingOtp || phone.length !== 10}
                  >
                    {sendingOtp ? <span className={styles.spinner} /> : otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {/* OTP boxes */}
              {otpSent && (
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
              )}

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.submitBtn} disabled={submitting || !otpSent || otpDigits.join('').length < 6}>
                {submitting ? <span className={styles.spinner} /> : 'Create Account'}
              </button>

              <p className={styles.loginRow}>
                Already have an account?{' '}
                <button type="button" className={styles.loginLink} onClick={() => navigate('/login')}>
                  Login here
                </button>
              </p>
            </form>
          </div>

          <div className={styles.badges}>
            <span className={styles.badge}><ShieldIcon /> Secure Data</span>
            <span className={styles.badge}><ClockIcon /> Quick Setup</span>
          </div>

        </div>
      </main>
    </div>
  );
}
