import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Building2, Lock, Mail, Phone, CheckCircle, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';

export function RegisterPage({ onNavigate, onAuthSuccess }) {
  const { register } = useAuth();
  
  // Choose role: 'candidate' | 'recruiter' (NO Admin)
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

  // Verification step state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyOtpCode, setVerifyOtpCode] = useState('');
  const [pendingUser, setPendingUser] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Submit registration form
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
      setVerifyOtpCode('1234'); // Pre-fill demo OTP code
      setIsVerifying(true);
      setSuccess('Verification OTP sent! Enter code to activate your account.');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Submit OTP Verification
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

      setSuccess('✅ Account verified & active! Redirecting to Dashboard...');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(pendingUser?.role || role);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Invalid verification OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg-main)' }}>
      <div style={{ maxWidth: '540px', width: '100%' }}>
        
        {/* Return to Home link */}
        <button 
          onClick={() => onNavigate('landing', '/')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '16px', padding: 0 }}>
          <ArrowLeft size={16} /> Return to Home
        </button>

        {/* Register Card */}
        <div className="card" style={{ padding: '36px 32px', borderRadius: '16px', boxShadow: '0 12px 35px rgba(0,0,0,0.08)' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '8px' }}>
              CREATE NEW ACCOUNT
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              {isVerifying ? 'VERIFY ACCOUNT' : 'REGISTER'}
            </h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {isVerifying ? (
                '• Email / mobile  • OTP  • Account active'
              ) : role === 'candidate' ? (
                '• Name + contact  • Password / OTP  • Verification  • Candidate Dashboard'
              ) : (
                '• Recruiter details  • Company details  • Verification  • Recruiter Dashboard'
              )}
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

          {/* STEP 1: REGISTRATION FORM */}
          {!isVerifying && (
            <div>
              {/* • Choose role: Candidate / Recruiter */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  • CHOOSE YOUR ACCOUNT ROLE:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div 
                    onClick={() => setRole('candidate')}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      border: role === 'candidate' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: role === 'candidate' ? 'var(--primary-light)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}>
                    <User size={24} color={role === 'candidate' ? 'var(--primary)' : '#64748b'} style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: role === 'candidate' ? 'var(--primary)' : 'var(--text-main)' }}>• Candidate</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Seeking jobs & internships</div>
                  </div>

                  <div 
                    onClick={() => setRole('recruiter')}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      border: role === 'recruiter' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: role === 'recruiter' ? 'var(--primary-light)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}>
                    <Building2 size={24} color={role === 'recruiter' ? 'var(--primary)' : '#64748b'} style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: role === 'recruiter' ? 'var(--primary)' : 'var(--text-main)' }}>• Recruiter</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Hiring talent & posting jobs</div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                    {role === 'candidate' ? '• Full Name' : '• Recruiter Full Name'}
                  </label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder={role === 'candidate' ? 'e.g. Arun Kumar' : 'e.g. Sarah Connor'}
                    value={role === 'candidate' ? candidateForm.name : recruiterForm.name}
                    onChange={(e) => role === 'candidate' 
                      ? setCandidateForm({ ...candidateForm, name: e.target.value })
                      : setRecruiterForm({ ...recruiterForm, name: e.target.value })}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
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

                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                    • Mobile Phone Number (for OTP verification)
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
                  <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                      • COMPANY DETAILS
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '3px' }}>Company Name *</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="e.g. Acme Technologies Inc."
                        value={recruiterForm.company_name}
                        onChange={(e) => setRecruiterForm({ ...recruiterForm, company_name: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '3px' }}>Industry</label>
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="Information Tech"
                          value={recruiterForm.company_industry}
                          onChange={(e) => setRecruiterForm({ ...recruiterForm, company_industry: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '3px' }}>Location</label>
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="Bangalore, India"
                          value={recruiterForm.company_location}
                          onChange={(e) => setRecruiterForm({ ...recruiterForm, company_location: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '3px' }}>Company Website</label>
                      <input 
                        type="url" 
                        className="form-control"
                        placeholder="https://company.example.com"
                        value={recruiterForm.company_website}
                        onChange={(e) => setRecruiterForm({ ...recruiterForm, company_website: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
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
                  style={{ padding: '12px', fontWeight: 800, fontSize: '0.95rem', marginTop: '6px', borderRadius: '8px' }}>
                  {loading ? 'Submitting Details...' : `Continue to Verification (OTP) &rarr;`}
                </button>
              </form>

              {/* Link to Login Page */}
              <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <button 
                  onClick={() => onNavigate('login', '/login')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                  Sign in &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VERIFICATION OTP SCREEN */}
          {isVerifying && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#d1fae5', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <CheckCircle size={28} />
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                  • VERIFY ACCOUNT
                </h2>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  We sent a 4-digit code to <strong>{pendingUser?.email || 'your email'}</strong>
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
                    style={{ textAlign: 'center', fontSize: '1.6rem', letterSpacing: '0.3em', fontWeight: 800 }}
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: '#059669', textAlign: 'center', marginTop: '6px', fontWeight: 600 }}>
                    ⚡ Demo OTP is 1234
                  </div>
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  <div>• Email & Mobile will be marked verified</div>
                  <div>• Account status transitions to <strong>Active</strong></div>
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

        </div>
      </div>
    </div>
  );
}
