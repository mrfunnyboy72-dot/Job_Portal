import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, User, Shield, Building2, LogOut, Sun, Moon, Bookmark, Sparkles, Map } from 'lucide-react';

export function Navbar({ activePage, setActivePage, openAuthModal, navigateTo }) {
  const { user, role, logout, theme, toggleTheme } = useAuth();

  const handleNav = (page, path) => {
    if (navigateTo) {
      navigateTo(page, path);
    } else {
      setActivePage(page);
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-color)' }}>
      {/* Main Navbar */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Brand */}
        <div 
          onClick={() => handleNav('landing', '/')} 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
              Work<span style={{ color: 'var(--primary)' }}>Pulse</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
              POWERED BY TiDB
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links (Candidate & Public only) */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <button 
            onClick={() => handleNav('landing', '/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: activePage === 'landing' ? 700 : 500, color: activePage === 'landing' ? 'var(--primary)' : 'var(--text-main)', fontSize: '0.95rem' }}>
            Home
          </button>
          
          <button 
            id="nav-jobs-btn"
            onClick={() => handleNav('jobs', '/jobs')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: activePage === 'jobs' ? 700 : 500, color: activePage === 'jobs' ? 'var(--primary)' : 'var(--text-main)', fontSize: '0.95rem' }}>
            Find Jobs
          </button>

          {/* Candidate-specific link: only shown when logged in as candidate */}
          {role === 'candidate' && (
            <button 
              id="nav-candidate-dash-btn"
              onClick={() => handleNav('candidate-dash', '/applications')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: activePage === 'candidate-dash' ? 700 : 500, color: activePage === 'candidate-dash' ? 'var(--primary)' : 'var(--text-main)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} /> My Applications
            </button>
          )}

          {/* Recruiter-only link: ONLY shown when explicitly logged in as recruiter */}
          {role === 'recruiter' && (
            <button 
              id="nav-recruiter-dash-btn"
              onClick={() => handleNav('recruiter-dash', '/recruiter')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: activePage === 'recruiter-dash' ? 700 : 500, color: activePage === 'recruiter-dash' ? 'var(--primary)' : 'var(--text-main)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} /> Recruiter Portal
            </button>
          )}

          <button 
            id="nav-workflow-map-btn"
            onClick={() => handleNav('workflow-map', '/workflow-map')}
            style={{ 
              background: activePage === 'workflow-map' ? 'rgba(79, 70, 229, 0.12)' : 'none', 
              border: activePage === 'workflow-map' ? '1px solid var(--primary)' : '1px solid rgba(79, 70, 229, 0.25)', 
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer', 
              fontWeight: 700, 
              color: 'var(--primary)', 
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}>
            <Map size={16} /> 📑 Workflow Map
          </button>
        </nav>

        {/* User Actions & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Dark / Light Mode Switcher */}
          <button 
            id="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="btn btn-secondary btn-sm"
            style={{ padding: '7px 10px', borderRadius: '8px' }}>
            {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#6366f1" />}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>{user.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
              </div>
              <button 
                id="logout-btn"
                onClick={() => {
                  logout();
                  handleNav('landing', '/');
                }}
                title="Logout & Return to Home"
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px 10px' }}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                id="login-btn"
                onClick={() => handleNav('login', '/login')} 
                className="btn btn-secondary btn-sm"
                style={{ fontWeight: activePage === 'login' ? 800 : 600 }}>
                Sign In
              </button>
              <button 
                id="register-btn"
                onClick={() => handleNav('register', '/register')} 
                className="btn btn-primary btn-sm"
                style={{ fontWeight: activePage === 'register' ? 800 : 700 }}>
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
