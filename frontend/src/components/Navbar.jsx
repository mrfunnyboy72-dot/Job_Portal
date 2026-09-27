import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, User, Shield, Building2, LogOut, Sun, Moon, Bookmark, Sparkles, Map, Menu, X } from 'lucide-react';

export function Navbar({ activePage, setActivePage, openAuthModal, navigateTo }) {
  const { user, role, logout, theme, toggleTheme } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page, path) => {
    setMobileMenuOpen(false);
    if (navigateTo) {
      navigateTo(page, path);
    } else {
      setActivePage(page);
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-color)' }}>
      {/* Main Navbar */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Brand */}
        <div 
          onClick={() => handleNav('landing', '/')} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }}>
            <Briefcase size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
              Work<span style={{ color: 'var(--primary)' }}>Pulse</span>
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
              POWERED BY TiDB
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
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

          {role === 'candidate' && (
            <button 
              id="nav-candidate-dash-btn"
              onClick={() => handleNav('candidate-dash', '/applications')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: activePage === 'candidate-dash' ? 700 : 500, color: activePage === 'candidate-dash' ? 'var(--primary)' : 'var(--text-main)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} /> My Applications
            </button>
          )}

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

        {/* Right side controls: Theme toggle, user actions & mobile hamburger button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Dark / Light Mode Switcher */}
          <button 
            id="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="btn btn-secondary btn-sm"
            style={{ padding: '7px 10px', borderRadius: '8px' }}>
            {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#6366f1" />}
          </button>

          {/* Desktop User Status / Auth Buttons */}
          <div className="desktop-nav-links">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{user.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
                </div>
                <button 
                  id="logout-btn"
                  onClick={() => {
                    logout();
                    handleNav('landing', '/');
                  }}
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

          {/* Mobile Hamburger Toggle Button */}
          <button
            id="mobile-nav-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary btn-sm mobile-menu-btn"
            style={{ padding: '7px 9px', borderRadius: '8px' }}
            aria-label="Toggle Navigation Menu">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Visible when mobileMenuOpen is true) */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '2px solid var(--border-color)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.2s ease-out'
        }}>
          {user && (
            <div style={{ padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: '8px', marginBottom: '4px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>Role: <strong>{user.role}</strong></div>
            </div>
          )}

          <button 
            onClick={() => handleNav('landing', '/')}
            style={{ textAlign: 'left', background: 'none', border: 'none', padding: '10px 8px', fontSize: '1rem', fontWeight: activePage === 'landing' ? 700 : 500, color: activePage === 'landing' ? 'var(--primary)' : 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
            🏠 Home
          </button>

          <button 
            onClick={() => handleNav('jobs', '/jobs')}
            style={{ textAlign: 'left', background: 'none', border: 'none', padding: '10px 8px', fontSize: '1rem', fontWeight: activePage === 'jobs' ? 700 : 500, color: activePage === 'jobs' ? 'var(--primary)' : 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
            🔍 Find Jobs
          </button>

          {role === 'candidate' && (
            <button 
              onClick={() => handleNav('candidate-dash', '/applications')}
              style={{ textAlign: 'left', background: 'none', border: 'none', padding: '10px 8px', fontSize: '1rem', fontWeight: activePage === 'candidate-dash' ? 700 : 500, color: activePage === 'candidate-dash' ? 'var(--primary)' : 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
              👤 My Applications & Profile
            </button>
          )}

          {role === 'recruiter' && (
            <button 
              onClick={() => handleNav('recruiter-dash', '/recruiter')}
              style={{ textAlign: 'left', background: 'none', border: 'none', padding: '10px 8px', fontSize: '1rem', fontWeight: activePage === 'recruiter-dash' ? 700 : 500, color: activePage === 'recruiter-dash' ? 'var(--primary)' : 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
              🏢 Recruiter Portal
            </button>
          )}

          <button 
            onClick={() => handleNav('workflow-map', '/workflow-map')}
            style={{ textAlign: 'left', background: 'none', border: 'none', padding: '10px 8px', fontSize: '1rem', fontWeight: activePage === 'workflow-map' ? 700 : 500, color: activePage === 'workflow-map' ? 'var(--primary)' : 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
            📑 Workflow Map
          </button>

          {user ? (
            <button 
              onClick={() => {
                logout();
                handleNav('landing', '/');
              }}
              className="btn btn-danger btn-sm"
              style={{ marginTop: '8px', justifyContent: 'center' }}>
              <LogOut size={16} /> Sign Out
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <button 
                onClick={() => handleNav('login', '/login')} 
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}>
                Sign In
              </button>
              <button 
                onClick={() => handleNav('register', '/register')} 
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}>
                Get Started Free
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

