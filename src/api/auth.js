const BASE = '/api/diner';

async function request(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

export const sendOtp = (phone, purpose) =>
  request('/auth/send-otp', { phone, purpose });

export const verifyOtpRegister = (phone, otp, username, email) =>
  request('/auth/verify-otp', { phone, otp, purpose: 'REGISTER', username, email: email || undefined });

export const verifyOtpLogin = (phone, otp) =>
  request('/auth/verify-otp', { phone, otp, purpose: 'LOGIN' });
