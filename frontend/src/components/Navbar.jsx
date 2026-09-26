import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, User, Shield, Building2, LogOut, CheckCircle, ChevronDown, Menu, X, Sparkles } from 'lucide-react';

export function Navbar({ activePage, setActivePage, openAuthModal }) {
  const { user, role, logout, quickLoginAs } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickSwitchOpen, setQuickSwitchOpen] = useState(false);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-color)' }}>
      {/* Top Demo Quick-Switch Bar for effortless testing */}
      <div style={{ backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '0.78rem', padding: '6px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
          <span style={{ color: '#f8fafc', fontWeight: 600 }}>TiDB Cloud Live</span> &bull; 
          <span>Role: <strong style={{ color: user ? '#38bdf8' : '#e2e8f0', textTransform: 'capitalize' }}>{user ? `${role} (${user.name})` : 'Public Visitor'}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#cbd5e1' }}>1-Click Role Switch:</span>
          <button 
            id="quick-candidate-btn"
            onClick={() => quickLoginAs('candidate')}
            style={{ background: role === 'candidate' ? '#2563eb' : '#334155', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
            Candidate
          </button>
          <button 
            id="quick-recruiter-btn"
            onClick={() => quickLoginAs('recruiter')}
            style={{ background: role === 'recruiter' ? '#7c3aed' : '#334155', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
            Recruiter
          </button>
          <button 
            id="quick-admin-btn"
            onClick={() => quickLoginAs('admin')}
            style={{ background: role === 'admin' ? '#059669' : '#334155', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
            Admin
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Brand */}
        <div 
          onClick={() => setActivePage('landing')} 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a', fontFamily: 'var(--font-display)' }}>
              Work<span style={{ color: '#4f46e5' }}>Pulse</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>
              POWERED BY TiDB
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button 
            onClick={() => setActivePage('landing')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: activePage === 'landing' ? 700 : 500, color: activePage === 'landing' ? 'var(--primary)' : 'var(--text-main)', fontSize: '0.95rem' }}>
            Home
          </button>
          
          <button 
            id="nav-jobs-btn"
            onClick={() => setActivePage('jobs')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: activePage === 'jobs' ? 700 : 500, color: activePage === 'jobs' ? 'var(--primary)' : 'var(--text-main)', fontSize: '0.95rem' }}>
            Find Jobs
          </button>

          {/* Role-Specific Links */}
          {role === 'candidate' && (
            <button 
              id="nav-candidate-dash-btn"
              onClick={() => setActivePage('candidate-dash')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: activePage === 'candidate-dash' ? 700 : 500, color: activePage === 'candidate-dash' ? 'var(--primary)' : 'var(--text-main)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} /> My Applications
            </button>
          )}

          {role === 'recruiter' && (
            <button 
              id="nav-recruiter-dash-btn"
              onClick={() => setActivePage('recruiter-dash')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: activePage === 'recruiter-dash' ? 700 : 500, color: activePage === 'recruiter-dash' ? 'var(--primary)' : 'var(--text-main)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} /> Recruiter Portal
            </button>
          )}

          {role === 'admin' && (
            <button 
              id="nav-admin-dash-btn"
              onClick={() => setActivePage('admin-dash')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: activePage === 'admin-dash' ? 700 : 500, color: '#059669', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={16} /> Admin Moderation
            </button>
          )}
        </nav>

        {/* User CTA / Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'capitalize' }}>{user.role}</div>
              </div>
              <button 
                id="logout-btn"
                onClick={logout}
                title="Logout"
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px 10px' }}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                id="login-btn"
                onClick={() => openAuthModal('login')} 
                className="btn btn-secondary btn-sm">
                Sign In
              </button>
              <button 
                id="register-btn"
                onClick={() => openAuthModal('register')} 
                className="btn btn-primary btn-sm">
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
