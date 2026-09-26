import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RecruiterDashboard } from './RecruiterDashboard';
import { Building2, Lock, Mail, ArrowLeft, KeyRound, Sparkles, CheckCircle2, Video, BarChart2 } from 'lucide-react';

export function RecruiterPortalPage({ onExit, onViewJob }) {
  const { user, role, token, login, quickLoginAs, logout } = useAuth();
  const [email, setEmail] = useState('recruiter@techcorp.com');
  const [password, setPassword] = useState('recruiter123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRecruiterLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user.role !== 'recruiter') {
        throw new Error('Access denied. This account does not have Recruiter privileges.');
      }
    } catch (err) {
      setError(err.message || 'Invalid recruiter credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRecruiterLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await quickLoginAs('recruiter');
    } catch (err) {
      setError(err.message || 'Failed to authenticate as demo recruiter');
    } finally {
      setLoading(false);
    }
  };

  // If authenticated as Recruiter, render the Recruiter Dashboard
  if (user && role === 'recruiter' && token) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Logged in as:</span>
            <strong style={{ color: 'var(--primary)' }}>{user.name} ({user.company_name || 'TechCorp Inc.'})</strong>
          </div>
          <button 
            onClick={onExit}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={15} /> Back to Job Listings
          </button>
        </div>

        <RecruiterDashboard onViewJob={onViewJob} />
      </div>
    );
  }

  // Otherwise, render dedicated Recruiter Login Card
  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '40px 24px' 
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <button 
          onClick={onExit}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-muted)', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            marginBottom: '20px'
          }}>
          <ArrowLeft size={16} /> Return to Job Board
        </button>

        <div className="card" style={{ padding: '36px 32px', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '14px', 
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#fff',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.35)',
              marginBottom: '16px'
            }}>
              <Building2 size={28} />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
              Recruiter Portal
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
              Post openings, screen applicants, and manage your hiring pipeline
            </p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRecruiterLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                Employer Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recruiter@techcorp.com"
                  required
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px', padding: '12px' }}>
              {loading ? 'Signing In...' : 'Sign In as Recruiter'}
            </button>
          </form>

          {/* 1-Click Demo Login */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px' }}>
              OR INSTANT DEMO RECRUITER ACCESS:
            </div>
            <button 
              type="button" 
              onClick={handleQuickRecruiterLogin}
              disabled={loading}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '10px', fontSize: '0.85rem', fontWeight: 700, borderColor: '#6366f1', color: '#4f46e5' }}>
              <KeyRound size={16} /> ⚡ 1-Click Demo Recruiter Login
            </button>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Default: recruiter@techcorp.com / recruiter123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
