import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Building2, Shield, Lock, Mail, Phone, CheckCircle, ArrowRight } from 'lucide-react';

export function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register, quickLoginAs } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login', 'register', 'otp', 'forgot'
  const [role, setRole] = useState('candidate'); // 'candidate' or 'recruiter'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company_name: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        onClose();
      } else if (mode === 'register') {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role,
          phone: formData.phone,
          company_name: formData.company_name
        });
        setMode('otp');
      } else if (mode === 'otp') {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp: formData.otp })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSuccess('Account verified and activated successfully!');
        setTimeout(() => onClose(), 1200);
      } else if (mode === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });
        const data = await res.json();
        setSuccess(data.message || 'Reset instructions sent.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleName) => {
    setLoading(true);
    try {
      await quickLoginAs(roleName);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {mode === 'login' && 'Sign in to WorkPulse'}
            {mode === 'register' && 'Create your account'}
            {mode === 'otp' && 'Verify Mobile / Email OTP'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
            {success}
          </div>
        )}

        {/* Register Role Selector */}
        {mode === 'register' && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div 
              onClick={() => setRole('candidate')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: role === 'candidate' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: role === 'candidate' ? 'var(--primary-light)' : '#fff',
                cursor: 'pointer',
                textAlign: 'center'
              }}>
              <User size={20} color={role === 'candidate' ? 'var(--primary)' : '#64748b'} style={{ margin: '0 auto 4px' }} />
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: role === 'candidate' ? 'var(--primary)' : '#334155' }}>Candidate</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Looking for jobs</div>
            </div>

            <div 
              onClick={() => setRole('recruiter')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: role === 'recruiter' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: role === 'recruiter' ? 'var(--primary-light)' : '#fff',
                cursor: 'pointer',
                textAlign: 'center'
              }}>
              <Building2 size={20} color={role === 'recruiter' ? 'var(--primary)' : '#64748b'} style={{ margin: '0 auto 4px' }} />
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: role === 'recruiter' ? 'var(--primary)' : '#334155' }}>Recruiter</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Hiring talent</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {role === 'recruiter' && (
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Acme Corp"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                  />
                </div>
              )}
            </>
          )}

          {mode !== 'otp' && (
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          )}

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="tel" 
                className="form-control"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Password</label>
                {mode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => setMode('forgot')}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer' }}>
                    Forgot?
                  </button>
                )}
              </div>
              <input 
                type="password" 
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          )}

          {mode === 'otp' && (
            <div className="form-group">
              <label className="form-label">Enter 4-digit Verification Code (or enter 1234)</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="1234"
                maxLength={6}
                style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '8px' }}
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Code sent to your email / SMS. Default demo code: 1234</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Please wait...' : (
              mode === 'login' ? 'Sign In' :
              mode === 'register' ? 'Continue' :
              mode === 'otp' ? 'Verify & Activate' : 'Send Reset Link'
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          {mode === 'login' ? (
            <div>
              Don't have an account?{' '}
              <button 
                onClick={() => setMode('register')} 
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>
                Sign up
              </button>
            </div>
          ) : (
            <div>
              Already have an account?{' '}
              <button 
                onClick={() => setMode('login')} 
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>
                Sign in
              </button>
            </div>
          )}
        </div>

        {/* Fast Demo Credentials helper */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', textAlign: 'center' }}>
            OR SIGN IN INSTANTLY WITH A DEMO ACCOUNT:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            <button 
              type="button" 
              onClick={() => handleQuickLogin('candidate')}
              style={{ padding: '9px 12px', fontSize: '0.82rem', border: '1px solid #3b82f6', borderRadius: '8px', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer', fontWeight: 700 }}>
              ⚡ 1-Click Candidate Demo Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
