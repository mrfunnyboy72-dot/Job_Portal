import React from 'react';
import { ShieldAlert, ArrowLeft, LogIn, User, Building2, Home } from 'lucide-react';

export function UnauthorizedPage({ requiredRole, onLoginClick, onHomeClick }) {
  return (
    <div style={{ 
      minHeight: '75vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px 20px',
      background: 'var(--bg-main)'
    }}>
      <div className="card" style={{ 
        maxWidth: '520px', 
        width: '100%', 
        padding: '36px 32px', 
        textAlign: 'center', 
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.06)'
      }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          background: '#fee2e2', 
          color: '#dc2626', 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: '20px' 
        }}>
          <ShieldAlert size={32} />
        </div>

        <span style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          color: '#dc2626', 
          padding: '3px 12px', 
          borderRadius: '9999px', 
          fontSize: '0.75rem', 
          fontWeight: 800, 
          letterSpacing: '0.04em' 
        }}>
          UNAUTHORIZED ACCESS
        </span>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '10px', marginBottom: '8px' }}>
          Authentication Required
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
          {requiredRole === 'recruiter' && 'You must be signed in with an active Recruiter account to manage jobs, applicants, and interview schedules.'}
          {requiredRole === 'candidate' && 'You must be signed in as a Candidate to submit applications, track review progression, and view saved jobs.'}
          {!requiredRole && 'This portal is restricted to authorized platform users. Please sign in or register to continue.'}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            onClick={onLoginClick}
            className="btn btn-primary"
            style={{ 
              padding: '12px', 
              fontWeight: 800, 
              fontSize: '0.95rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              borderRadius: '8px' 
            }}>
            <LogIn size={18} /> Sign In to Continue &rarr;
          </button>

          <button 
            onClick={onHomeClick}
            className="btn btn-secondary"
            style={{ 
              padding: '11px', 
              fontSize: '0.88rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px',
              borderRadius: '8px' 
            }}>
            <Home size={16} /> Return to Home Page
          </button>
        </div>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Don't have an account yet? Click Sign In above to create a new <strong>Candidate</strong> or <strong>Recruiter</strong> account with instant OTP verification.
        </div>
      </div>
    </div>
  );
}
