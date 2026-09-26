import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, User, Building2, Lock, Mail, Phone, CheckCircle, 
  ArrowRight, KeyRound, Sparkles, Shield, RotateCcw, Check, ExternalLink
} from 'lucide-react';

export function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
  const { login, loginWithOtp, sendOtp, resetPassword, register } = useAuth();
  
  // Modes: 'login', 'register', 'verify', 'forgot'
  const [mode, setMode] = useState(initialMode);
  
  // Login method: 'password' | 'otp'
  const [loginMethod, setLoginMethod] = useState('password');

  // Register Role: 'candidate' | 'recruiter'
  const [role, setRole] = useState('candidate');

  // Candidate Registration form
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  // Recruiter Registration form
  const [recruiterForm, setRecruiterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    company_name: '',
    company_industry: 'Information Technology',
    company_location: 'Bangalore, India',
    company_website: ''
  });

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [otpSentNotice, setOtpSentNotice] = useState('');

  // Verify Step (after registration)
  const [verifyOtpCode, setVerifyOtpCode] = useState('');
  const [pendingUser, setPendingUser] = useState(null);

  // Forgot password flow: Step 1 (Request OTP) -> Step 2 (Enter OTP + New Password)
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError('');
    setSuccess('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  // 1. LOGIN HANDLER
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let data;
      if (loginMethod === 'password') {
        data = await login(loginIdentifier.trim(), loginPassword);
      } else {
        data = await loginWithOtp(loginIdentifier.trim(), loginOtp.trim());
      }

      setSuccess('Login successful! Redirecting to Dashboard...');
      setTimeout(() => {
        onClose();
        if (onAuthSuccess) onAuthSuccess(data.user.role);
      }, 700);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 2. SEND OTP FOR LOGIN
  const handleSendLoginOtp = async () => {
    if (!loginIdentifier.trim()) {
      setError('Please enter your email address or mobile number first.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await sendOtp(loginIdentifier.trim());
      setOtpSentNotice(res.message);
      setLoginOtp('1234'); // Pre-fill demo OTP for effortless testing
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 3. REGISTRATION HANDLER
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = role === 'candidate' 
        ? { ...candidateForm, role: 'candidate' }
        : { ...recruiterForm, role: 'recruiter' };

      const data = await register(payload);
      setPendingUser(data.user);
      setVerifyOtpCode('1234'); // Auto-fill demo OTP
      setMode('verify');
      setSuccess('Verification OTP sent to your email & mobile! Enter code to activate account.');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // 4. VERIFY ACCOUNT OTP
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: verifyOtpCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess('✅ Account verified & active! Redirecting to your Dashboard...');
      setTimeout(() => {
        onClose();
        if (onAuthSuccess) onAuthSuccess(pendingUser?.role || role);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Invalid verification OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 5. FORGOT PASSWORD HANDLER
  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setError('Please enter your registered email or mobile.');
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
      setError(err.message || 'Failed to send password reset OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await resetPassword(forgotIdentifier.trim(), forgotOtp.trim(), newPassword);
      setSuccess(res.message);
      setTimeout(() => {
        setMode('login');
        setForgotStep(1);
        setLoginIdentifier(forgotIdentifier);
        setSuccess('Password updated! You can now log in with your new password.');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '500px', width: '100%', padding: '32px 30px', borderRadius: '16px', maxHeight: '92vh', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em' }}>
              WORKPULSE AUTHENTICATION
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 0' }}>
              {mode === 'login' && 'LOGIN'}
              {mode === 'register' && 'REGISTER'}
              {mode === 'verify' && 'VERIFY ACCOUNT'}
              {mode === 'forgot' && 'RESET PASSWORD'}
            </h2>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {mode === 'login' && '• Email / mobile  • Password / OTP  • Forgot password'}
              {mode === 'register' && (role === 'candidate' 
                ? '• Name + contact  • Password / OTP  • Verification  • Candidate Dashboard' 
                : '• Recruiter details  • Company details  • Verification  • Recruiter Dashboard')}
              {mode === 'verify' && '• Email / mobile  • OTP  • Account active'}
              {mode === 'forgot' && '• Forgot password → OTP → New password → Login'}
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher: LOGIN vs REGISTER */}
        {(mode === 'login' || mode === 'register') && (
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '8px',
                border: 'none',
                background: mode === 'login' ? 'var(--primary)' : 'transparent',
                color: mode === 'login' ? '#fff' : 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
              LOGIN
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '8px',
                border: 'none',
                background: mode === 'register' ? 'var(--primary)' : 'transparent',
                color: mode === 'register' ? '#fff' : 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
              REGISTER
            </button>
          </div>
        )}

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

        {/* =======================================================
            1. LOGIN FORM
            • Email / mobile
            • Password / OTP
            • Forgot password
            ======================================================= */}
        {mode === 'login' && (
          <div>
            {/* Password vs OTP Mode Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setLoginMethod('password')}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: loginMethod === 'password' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: loginMethod === 'password' ? 'var(--primary-light)' : 'transparent',
                  color: loginMethod === 'password' ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.8rem',
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
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: loginMethod === 'otp' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: loginMethod === 'otp' ? 'var(--primary-light)' : 'transparent',
                  color: loginMethod === 'otp' ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}>
                📲 Login with OTP
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* • Email / mobile */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                  • Email or Mobile Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. candidate@example.com or 9876543212"
                    required
                    className="form-control"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>

              {/* Password option */}
              {loginMethod === 'password' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      • Password
                    </label>
                    <button 
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); setSuccess(''); setForgotIdentifier(loginIdentifier); }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                      • Forgot password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="password" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="form-control"
                      style={{ paddingLeft: '36px' }}
                    />
                  </div>
                </div>
              )}

              {/* OTP option */}
              {loginMethod === 'otp' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
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
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value)}
                      placeholder="Enter 4-digit OTP (Demo: 1234)"
                      maxLength={6}
                      required
                      className="form-control"
                      style={{ paddingLeft: '36px', letterSpacing: '0.15em', fontWeight: 700 }}
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
                style={{ padding: '12px', fontWeight: 700, fontSize: '0.92rem', marginTop: '6px', borderRadius: '8px' }}>
                {loading ? 'Authenticating...' : (loginMethod === 'password' ? 'Sign In &rarr;' : 'Verify OTP & Sign In &rarr;')}
              </button>
            </form>
          </div>
        )}

        {/* =======================================================
            2. REGISTER FORM
            • Choose role (Candidate / Recruiter)
            • CANDIDATE REGISTER (Name, contact, password, OTP, Candidate Dashboard)
            • RECRUITER REGISTER (Recruiter details, Company details, Verification, Recruiter Dashboard)
            ======================================================= */}
        {mode === 'register' && (
          <div>
            {/* • Choose role */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                • CHOOSE ROLE:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div 
                  onClick={() => setRole('candidate')}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: role === 'candidate' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: role === 'candidate' ? 'var(--primary-light)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}>
                  <User size={22} color={role === 'candidate' ? 'var(--primary)' : '#64748b'} style={{ margin: '0 auto 4px' }} />
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: role === 'candidate' ? 'var(--primary)' : 'var(--text-main)' }}>• Candidate</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Seeking jobs & internships</div>
                </div>

                <div 
                  onClick={() => setRole('recruiter')}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: role === 'recruiter' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: role === 'recruiter' ? 'var(--primary-light)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}>
                  <Building2 size={22} color={role === 'recruiter' ? 'var(--primary)' : '#64748b'} style={{ margin: '0 auto 4px' }} />
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: role === 'recruiter' ? 'var(--primary)' : 'var(--text-main)' }}>• Recruiter</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Posting jobs & hiring</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Common Candidate / Recruiter Contact Info */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  {role === 'candidate' ? '• Full Name' : '• Recruiter Full Name'}
                </label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder={role === 'candidate' ? 'e.g. Arun Kumar' : 'e.g. Sarah Connor (HR Lead)'}
                  value={role === 'candidate' ? candidateForm.name : recruiterForm.name}
                  onChange={(e) => role === 'candidate' 
                    ? setCandidateForm({ ...candidateForm, name: e.target.value })
                    : setRecruiterForm({ ...recruiterForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  {role === 'candidate' ? '• Email Address' : '• Work Email Address'}
                </label>
                <input 
                  type="email" 
                  className="form-control"
                  placeholder={role === 'candidate' ? 'arun@example.com' : 'recruiter@company.com'}
                  value={role === 'candidate' ? candidateForm.email : recruiterForm.email}
                  onChange={(e) => role === 'candidate' 
                    ? setCandidateForm({ ...candidateForm, email: e.target.value })
                    : setRecruiterForm({ ...recruiterForm, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  • Mobile Phone Number (for OTP)
                </label>
                <input 
                  type="tel" 
                  className="form-control"
                  placeholder="+91 9876543210"
                  value={role === 'candidate' ? candidateForm.phone : recruiterForm.phone}
                  onChange={(e) => role === 'candidate' 
                    ? setCandidateForm({ ...candidateForm, phone: e.target.value })
                    : setRecruiterForm({ ...recruiterForm, phone: e.target.value })}
                  required
                />
              </div>

              {/* RECRUITER SPECIFIC: Company Details */}
              {role === 'recruiter' && (
                <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)' }}>
                    • COMPANY DETAILS
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '3px' }}>Company Name *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. Acme Innovations Inc."
                      value={recruiterForm.company_name}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, company_name: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '3px' }}>Industry</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="Information Tech"
                        value={recruiterForm.company_industry}
                        onChange={(e) => setRecruiterForm({ ...recruiterForm, company_industry: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '3px' }}>Location</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="Bangalore, India"
                        value={recruiterForm.company_location}
                        onChange={(e) => setRecruiterForm({ ...recruiterForm, company_location: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  • Create Password
                </label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="Min 6 characters"
                  minLength={6}
                  value={role === 'candidate' ? candidateForm.password : recruiterForm.password}
                  onChange={(e) => role === 'candidate' 
                    ? setCandidateForm({ ...candidateForm, password: e.target.value })
                    : setRecruiterForm({ ...recruiterForm, password: e.target.value })}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary"
                style={{ padding: '12px', fontWeight: 700, fontSize: '0.92rem', marginTop: '6px', borderRadius: '8px' }}>
                {loading ? 'Submitting Details...' : `Continue to Verification (OTP) &rarr;`}
              </button>
            </form>
          </div>
        )}

        {/* =======================================================
            3. VERIFY SCREEN (After Register)
            • Email / mobile
            • OTP
            • Account active
            • REDIRECT: Candidate -> Dashboard / Recruiter -> Dashboard
            ======================================================= */}
        {mode === 'verify' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#d1fae5', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <CheckCircle size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                • VERIFY ACCOUNT
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Sent verification code to: <strong>{pendingUser?.email || 'your email'}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', textAlign: 'center' }}>
                  • Enter 4-Digit Verification OTP:
                </label>
                <input 
                  type="text" 
                  className="form-control"
                  value={verifyOtpCode}
                  onChange={(e) => setVerifyOtpCode(e.target.value)}
                  placeholder="1234"
                  maxLength={6}
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3em', fontWeight: 800 }}
                  required
                />
                <div style={{ fontSize: '0.75rem', color: '#059669', textAlign: 'center', marginTop: '6px', fontWeight: 600 }}>
                  ⚡ Demo OTP is 1234
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <div>• Email & Mobile will be marked verified</div>
                <div>• Account Status will transition to <strong>Active</strong></div>
                <div>• Automatic redirect to <strong>{role === 'recruiter' ? 'Recruiter Dashboard' : 'Candidate Dashboard'}</strong></div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary"
                style={{ padding: '12px', fontWeight: 800, fontSize: '0.95rem', borderRadius: '8px' }}>
                {loading ? 'Activating Account...' : '• Activate Account & Enter Dashboard &rarr;'}
              </button>
            </form>
          </div>
        )}

        {/* =======================================================
            4. FORGOT PASSWORD FLOW
            • Forgot password → OTP → New password → Login
            ======================================================= */}
        {mode === 'forgot' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
              <button 
                type="button" 
                onClick={() => setMode('login')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>
                &larr; Back to Login
              </button>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px' }}>
                    • Registered Email Address or Mobile Number
                  </label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. candidate@example.com or 9876543212"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    We will send a 4-digit verification code to reset your password.
                  </span>
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
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px' }}>
                    • Enter OTP (Demo: 1234)
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
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px' }}>
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
  );
}
