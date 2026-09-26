import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { Shield, Lock, Mail, ArrowLeft, KeyRound, Sparkles, CheckCircle, Database, LogOut, ExternalLink } from 'lucide-react';

export function AdminPortalPage({ onExit }) {
  const { user, role, token, login, quickLoginAs, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e?.preventDefault();
    setError('');

    if (email.trim().toLowerCase() !== 'admin321@admin.com') {
      setError('Access Denied: Only master administrator (admin321@admin.com) can access this portal.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      if (data.user.role !== 'admin' || data.user.email !== 'admin321@admin.com') {
        throw new Error('Access denied. Invalid administrator privileges.');
      }
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillAdmin = () => {
    setEmail('admin321@admin.com');
    setPassword('admin@321');
  };

  const handleQuickAdminLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('admin321@admin.com', 'admin@321');
    } catch (err) {
      setError(err.message || 'Failed to authenticate master admin');
    } finally {
      setLoading(false);
    }
  };

  // If user is authenticated as Admin, show Admin Dashboard with Dedicated Admin Header
  if (user && role === 'admin' && token) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
        {/* Dedicated Admin Navbar */}
        <header style={{ 
          backgroundColor: '#0f172a', 
          borderBottom: '1px solid #1e293b', 
          padding: '14px 24px', 
          position: 'sticky', 
          top: 0, 
          zIndex: 100,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }}>
                <Shield size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#fff' }}>
                    WorkPulse <span style={{ color: '#10b981' }}>Admin Console</span>
                  </span>
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                    SECURITY LEVEL 1
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                  TiDB Cloud Serverless &bull; Moderation & User Control
                </div>
              </div>
            </div>

            {/* Admin Profile & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>{user.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#6ee7b7' }}>Platform Administrator</div>
              </div>

              <button 
                onClick={onExit}
                className="btn btn-secondary btn-sm"
                style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
                title="View Public Candidate Site">
                <ExternalLink size={15} /> View Candidate Site
              </button>

              <button 
                onClick={logout}
                className="btn btn-secondary btn-sm"
                style={{ background: '#3b1d1d', border: '1px solid #7f1d1d', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
                title="Logout from Admin">
                <LogOut size={15} /> Logout
              </button>
            </div>
          </div>
        </header>

        {/* Admin Dashboard Component */}
        <main style={{ flex: 1, padding: '20px 0' }}>
          <AdminDashboard />
        </main>

        {/* Admin Dedicated Footer */}
        <footer style={{ backgroundColor: '#070b12', borderTop: '1px solid #1e293b', padding: '16px 24px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          WorkPulse Internal Governance System &bull; Restricted /admin Route &bull; Protected by JWT & TiDB Cloud SSL
        </footer>
      </div>
    );
  }

  // Otherwise, render Dedicated Standalone Admin Login Screen
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#090d16', 
      color: '#f8fafc',
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background ambient glow */}
      <div style={{ 
        position: 'absolute', 
        width: '500px', 
        height: '500px', 
        borderRadius: '50%', 
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(9, 13, 22, 0) 70%)', 
        top: '10%', 
        left: '50%', 
        transform: 'translateX(-50%)',
        pointerEvents: 'none'
      }}></div>

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* Top return link */}
        <button 
          onClick={onExit}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#94a3b8', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            marginBottom: '20px',
            padding: '6px 0',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#fff'}
          onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
          <ArrowLeft size={16} /> View Candidate Site
        </button>

        {/* Security Login Card */}
        <div style={{ 
          backgroundColor: '#0f172a', 
          border: '1px solid #1e293b', 
          borderRadius: '16px', 
          padding: '36px 32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(16, 185, 129, 0.3)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '14px', 
              background: 'linear-gradient(135deg, #059669, #10b981)', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#fff',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
              marginBottom: '16px'
            }}>
              <Shield size={28} />
            </div>
            <div style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '3px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '8px' }}>
              ADMIN ACCESS
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
              Admin Credentials
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px' }}>
              Secure access &bull; System Governance & Moderation
            </p>
          </div>

          {error && (
            <div style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.15)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              color: '#fca5a5', 
              padding: '10px 14px', 
              borderRadius: '8px', 
              fontSize: '0.85rem', 
              marginBottom: '20px' 
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Admin Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin321@admin.com"
                  required
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px 10px 38px', 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155', 
                    borderRadius: '8px', 
                    color: '#fff', 
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Master Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin@321"
                  required
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px 10px 38px', 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155', 
                    borderRadius: '8px', 
                    color: '#fff', 
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                marginTop: '10px',
                padding: '12px', 
                backgroundColor: '#059669', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                fontWeight: 700, 
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)',
                transition: 'background-color 0.2s'
              }}>
              {loading ? 'Authenticating...' : 'Sign In as Administrator'}
            </button>
          </form>

          {/* 1-Click Demo Login for Quick Verification */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #1e293b', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '10px' }}>
              MASTER ADMIN AUTHORIZATION:
            </div>
            <button 
              type="button" 
              onClick={handleQuickAdminLogin}
              disabled={loading}
              style={{ 
                width: '100%',
                padding: '10px', 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                color: '#34d399', 
                border: '1px dashed #059669', 
                borderRadius: '8px', 
                fontWeight: 700, 
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
              <KeyRound size={16} /> ⚡ 1-Click Master Admin Login
            </button>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '10px' }}>
              Required Email: <strong style={{ color: '#38bdf8' }}>admin321@admin.com</strong><br />
              Required Password: <strong style={{ color: '#34d399' }}>admin@321</strong>
            </div>
          </div>
        </div>

        {/* Security watermark */}
        <div style={{ textAlign: 'center', marginTop: '24px', color: '#475569', fontSize: '0.75rem' }}>
          WorkPulse Secure Governance &bull; URL: <code>/admin</code> &bull; TiDB SSL Encrypted
        </div>
      </div>
    </div>
  );
}
