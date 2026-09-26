import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, KeyRound, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';

export function LoginPage({ onNavigate, onAuthSuccess }) {
  const { login, loginWithOtp, sendOtp, resetPassword } = useAuth();
  
  // Login method: 'password' | 'otp'
  const [loginMethod, setLoginMethod] = useState('password');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSentNotice, setOtpSentNotice] = useState('');

  // Forgot password flow
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let data;
      if (loginMethod === 'password') {
        data = await login(identifier.trim(), password);
      } else {
        data = await loginWithOtp(identifier.trim(), otp.trim());
      }

      setSuccess('Login successful! Redirecting to Dashboard...');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(data.user.role);
      }, 700);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Send Login OTP
  const handleSendLoginOtp = async () => {
    if (!identifier.trim()) {
      setError('Please enter your email or mobile number first.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await sendOtp(identifier.trim());
      setOtpSentNotice(res.message);
      setOtp('1234'); // Demo OTP for seamless testing
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password: Step 1 (Send OTP)
  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setError('Please enter your registered email or mobile number.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await sendOtp(forgotIdentifier.trim());
      setSuccess(res.message);
      setForgotOtp('1234');
      setForgotStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password: Step 2 (Reset Password)
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await resetPassword(forgotIdentifier.trim(), forgotOtp.trim(), newPassword);
      setSuccess(res.message);
      setTimeout(() => {
        setShowForgot(false);
        setForgotStep(1);
        setIdentifier(forgotIdentifier);
        setSuccess('Password updated! You can now log in with your new password.');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg-main)' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        
        {/* Return to Home link */}
        <button 
          onClick={() => onNavigate('landing', '/')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '16px', padding: 0 }}>
          <ArrowLeft size={16} /> Return to Home
        </button>

        {/* Login Card */}
        <div className="card" style={{ padding: '36px 32px', borderRadius: '16px', boxShadow: '0 12px 35px rgba(0,0,0,0.08)' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '8px' }}>
              SECURE PORTAL ACCESS
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              {showForgot ? 'RESET PASSWORD' : 'LOGIN'}
            </h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {showForgot 
                ? '• Forgot password → OTP → New password → Login' 
                : '• Email / mobile  • Password / OTP  • Forgot password'}
            </div>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
              {success}
            </div>
          )}

          {/* Regular Login Form */}
          {!showForgot && (
            <div>
              {/* Method Selector: Password vs OTP */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                <button
                  type="button"
                  onClick={() => setLoginMethod('password')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: loginMethod === 'password' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    background: loginMethod === 'password' ? 'var(--primary-light)' : 'transparent',
                    color: loginMethod === 'password' ? 'var(--primary)' : 'var(--text-muted)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                  🔒 Password Login
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('otp')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: loginMethod === 'otp' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    background: loginMethod === 'otp' ? 'var(--primary-light)' : 'transparent',
                    color: loginMethod === 'otp' ? 'var(--primary)' : 'var(--text-muted)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                  📲 Login with OTP
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* • Email / mobile */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                    • Email or Mobile Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. candidate@example.com or 9876543212"
                      required
                      className="form-control"
                      style={{ paddingLeft: '38px' }}
                    />
                  </div>
                </div>

                {/* Password input */}
                {loginMethod === 'password' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        • Password
                      </label>
                      <button 
                        type="button"
                        onClick={() => { setShowForgot(true); setError(''); setSuccess(''); setForgotIdentifier(identifier); }}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                        • Forgot password?
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="form-control"
                        style={{ paddingLeft: '38px' }}
                      />
                    </div>
                  </div>
                )}

                {/* OTP input */}
                {loginMethod === 'otp' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        • 4-Digit OTP Code
                      </label>
                      <button 
                        type="button"
                        onClick={handleSendLoginOtp}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                        Send OTP 📩
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 4-digit code (Demo: 1234)"
                        maxLength={6}
                        required
                        className="form-control"
                        style={{ paddingLeft: '38px', letterSpacing: '0.15em', fontWeight: 700 }}
                      />
                    </div>
                    {otpSentNotice && (
                      <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
                        {otpSentNotice}
                      </div>
                    )}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ padding: '12px', fontWeight: 800, fontSize: '0.95rem', marginTop: '6px', borderRadius: '8px' }}>
                  {loading ? 'Authenticating...' : (loginMethod === 'password' ? 'Sign In &rarr;' : 'Verify OTP & Sign In &rarr;')}
                </button>
              </form>

              {/* Link to Registration Page */}
              <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Don't have an account yet?{' '}
                <button 
                  onClick={() => onNavigate('register', '/register')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                  Create an account &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Forgot Password Flow */}
          {showForgot && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowForgot(false); setForgotStep(1); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>
                  &larr; Back to Login
                </button>
              </div>

              {forgotStep === 1 ? (
                <form onSubmit={handleForgotSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      • Registered Email or Mobile Number
                    </label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. candidate@example.com or 9876543212"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      required
                    />
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      We will send a 4-digit verification code to reset your password.
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ padding: '12px', fontWeight: 700, borderRadius: '8px' }}>
                    {loading ? 'Sending Code...' : 'Step 1: Send Reset OTP &rarr;'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      • Enter 4-Digit OTP Code (Demo: 1234)
                    </label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="1234"
                      maxLength={6}
                      required
                      style={{ letterSpacing: '0.15em', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      • New Password
                    </label>
                    <input 
                      type="password" 
                      className="form-control"
                      placeholder="Min 6 characters"
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ padding: '12px', fontWeight: 700, borderRadius: '8px' }}>
                    {loading ? 'Updating Password...' : 'Step 2: Set New Password &rarr;'}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
