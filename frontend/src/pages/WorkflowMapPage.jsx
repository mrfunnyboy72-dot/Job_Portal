import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, Search, FileText, CheckCircle2, User, Building2, Shield, 
  ArrowRight, ExternalLink, Sparkles, Check, ChevronRight, Eye, Play, ListChecks
} from 'lucide-react';

export function WorkflowMapPage({ setActivePage, openAuthModal, onViewJob }) {
  const { role, quickLoginAs } = useAuth();
  const [activeSection, setActiveSection] = useState('master'); // 'master', 'public', 'auth', 'candidate', 'recruiter', 'admin', 'lifecycle', 'checklist'

  const sections = [
    { id: 'master', label: '01 • Master Flow' },
    { id: 'public', label: '02 • Public Website' },
    { id: 'auth', label: '03 • Authentication' },
    { id: 'candidate', label: '04 • Candidate Pages' },
    { id: 'recruiter', label: '05 • Recruiter Pages' },
    { id: 'admin', label: '06 • Admin Control' },
    { id: 'lifecycle', label: '07 • App Lifecycle' },
    { id: 'checklist', label: '10 • Sprint Checklist' },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '30px auto 90px', padding: '0 24px' }}>
      {/* Header Banner - Exact PDF Style */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0f2b48 0%, #1e3a5f 100%)', 
        color: '#ffffff', 
        borderRadius: '16px', 
        padding: '36px 32px', 
        marginBottom: '28px',
        boxShadow: '0 10px 25px rgba(15, 43, 72, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.12)', color: '#38bdf8', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <Sparkles size={14} /> Interactive Blueprint Navigator
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
              Job Portal &bull; Full Page-by-Page Workflow Map
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '1rem', marginTop: '4px' }}>
              Landing ➔ Candidate ➔ Recruiter ➔ Admin ➔ Application ➔ Hiring. Click any block to jump directly into the live page!
            </p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeSection === s.id ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.2)',
                background: activeSection === s.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                color: activeSection === s.id ? '#0f2b48' : '#ffffff',
                transition: 'all 0.15s ease'
              }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: MASTER FLOW (PDF Page 2) */}
      {activeSection === 'master' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Complete User Journey Row */}
          <div className="card" style={{ padding: '30px' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              The Complete User Journey (Click to Visit)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'stretch' }}>
              {[
                { title: 'LANDING', items: ['Search jobs', 'Login / Register'], page: 'landing', color: '#3b82f6' },
                { title: 'SEARCH', items: ['Keyword', 'Location', 'Experience'], page: 'jobs', color: '#0ea5e9' },
                { title: 'JOB DETAILS', items: ['Read job', 'Check requirements', 'AI Fit Match'], page: 'jobs', color: '#6366f1' },
                { title: 'APPLY', items: ['Resume upload', 'Cover note', 'Confirm apply'], page: 'jobs', color: '#8b5cf6' },
                { title: 'STATUS', items: ['Track application', 'Google Meet', 'Live pipeline'], page: 'candidate-dash', color: '#10b981' },
              ].map((step, idx) => (
                <div 
                  key={step.title}
                  onClick={() => {
                    if (step.page === 'candidate-dash') quickLoginAs('candidate');
                    setActivePage(step.page);
                  }}
                  className="card card-interactive"
                  style={{
                    padding: '20px',
                    border: `2px solid ${step.color}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: 'var(--bg-surface)'
                  }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800 }}>STEP 0{idx + 1}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: step.color, marginTop: '2px' }}>{step.title}</div>
                    <ul style={{ marginTop: '10px', fontSize: '0.82rem', color: 'var(--text-main)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {step.items.map(it => <li key={it}>{it}</li>)}
                    </ul>
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '0.78rem', color: step.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Open Live <ChevronRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Three Roles Row */}
          <div className="card" style={{ padding: '30px' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              Three Enterprise Roles (Click to Switch & Open Portal)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* Candidate */}
              <div 
                onClick={async () => {
                  await quickLoginAs('candidate');
                  setActivePage('candidate-dash');
                }}
                className="card card-interactive"
                style={{ padding: '24px', border: '2px solid #2563eb', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0e7ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2563eb' }}>CANDIDATE</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Job Seeker Experience</span>
                  </div>
                </div>
                <ul style={{ fontSize: '0.9rem', color: 'var(--text-main)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>Find jobs with search & filters</li>
                  <li>Upload resume & direct apply</li>
                  <li>Track live status (Applied ➔ Viewed ➔ Shortlisted ➔ Interview ➔ Selected)</li>
                </ul>
                <div style={{ marginTop: '18px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#2563eb' }}>
                  Switch to Candidate Portal <ArrowRight size={14} />
                </div>
              </div>

              {/* Recruiter */}
              <div 
                onClick={async () => {
                  await quickLoginAs('recruiter');
                  setActivePage('recruiter-dash');
                }}
                className="card card-interactive"
                style={{ padding: '24px', border: '2px solid #7c3aed', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7c3aed' }}>RECRUITER</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Employer & HR Space</span>
                  </div>
                </div>
                <ul style={{ fontSize: '0.9rem', color: 'var(--text-main)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>Create company profile & post jobs</li>
                  <li>Submit jobs for Admin Approval</li>
                  <li>Review candidates, shortlist & schedule Google Meet interviews</li>
                </ul>
                <div style={{ marginTop: '18px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#7c3aed' }}>
                  Switch to Recruiter Portal <ArrowRight size={14} />
                </div>
              </div>

              {/* Admin */}
              <div 
                onClick={async () => {
                  await quickLoginAs('admin');
                  setActivePage('admin-dash');
                }}
                className="card card-interactive"
                style={{ padding: '24px', border: '2px solid #059669', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>ADMIN</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Platform Governance</span>
                  </div>
                </div>
                <ul style={{ fontSize: '0.9rem', color: 'var(--text-main)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>Approve / Reject pending recruiter jobs</li>
                  <li>Manage users (Block / Unblock compliance)</li>
                  <li>Monitor all applications & platform analytics</li>
                </ul>
                <div style={{ marginTop: '18px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#059669' }}>
                  Switch to Admin Moderation <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Important Business Rule Box (Exact PDF Page 2) */}
          <div style={{ 
            background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)', 
            border: '2px solid #f59e0b', 
            borderRadius: '12px', 
            padding: '24px 28px', 
            color: '#92400e' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              ⚡ IMPORTANT BUSINESS RULE (FROM PDF)
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '6px', color: '#78350f' }}>
              Recruiter creates job ➔ Admin reviews ➔ Approved job becomes public ➔ Candidate can apply.
            </div>
            <p style={{ fontSize: '0.9rem', marginTop: '6px', color: '#92400e' }}>
              Jobs posted by recruiters are held in the admin queue until verified. Rejecting a job sends feedback to the recruiter to edit and resubmit.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 2: PUBLIC WEBSITE (PDF Page 3) */}
      {activeSection === 'public' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ padding: '24px', border: '1.5px solid #3b82f6' }}>
              <div style={{ fontWeight: 800, color: '#3b82f6', fontSize: '0.82rem' }}>PAGE 01</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '4px 0 10px' }}>LANDING</h3>
              <ul style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '18px' }}>
                <li>Logo / navigation</li>
                <li>Search Jobs hero form</li>
                <li>Categories grid with live counts</li>
                <li>Featured & recent approved jobs</li>
              </ul>
              <button onClick={() => setActivePage('landing')} className="btn btn-outline btn-sm" style={{ marginTop: '16px', width: '100%' }}>
                Visit Landing Page
              </button>
            </div>

            <div className="card" style={{ padding: '24px', border: '1.5px solid #0ea5e9' }}>
              <div style={{ fontWeight: 800, color: '#0ea5e9', fontSize: '0.82rem' }}>PAGE 02 & 03</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '4px 0 10px' }}>SEARCH & LISTING</h3>
              <ul style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '18px' }}>
                <li>Keyword + location filters</li>
                <li>Experience / salary / type filters</li>
                <li>Job cards with verified badges</li>
                <li>Pagination & sorting</li>
              </ul>
              <button onClick={() => setActivePage('jobs')} className="btn btn-outline btn-sm" style={{ marginTop: '16px', width: '100%' }}>
                Visit Search & Listings
              </button>
            </div>

            <div className="card" style={{ padding: '24px', border: '1.5px solid #6366f1' }}>
              <div style={{ fontWeight: 800, color: '#6366f1', fontSize: '0.82rem' }}>PAGE 04</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '4px 0 10px' }}>JOB DETAILS</h3>
              <ul style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '18px' }}>
                <li>Full job information & specifications</li>
                <li>Company profile & website</li>
                <li>AI ATS Resume Fit Score</li>
                <li>Direct Apply Now modal</li>
              </ul>
              <button onClick={() => onViewJob(1)} className="btn btn-outline btn-sm" style={{ marginTop: '16px', width: '100%' }}>
                View Sample Job Details
              </button>
            </div>
          </div>

          <div style={{ background: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: '12px', padding: '20px 24px', color: '#065f46' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>WHEN USER CLICKS APPLY (PDF Rule):</div>
            <div style={{ fontSize: '0.88rem', marginTop: '4px' }}>
              &bull; Not logged in ➔ Prompt Login / Register ➔ Return to Job Details ➔ Apply.<br />
              &bull; Logged in as Candidate ➔ Open Apply page directly (select resume + cover note).
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: AUTHENTICATION (PDF Page 4) */}
      {activeSection === 'auth' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2563eb', marginBottom: '8px' }}>LOGIN</h3>
              <ul style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '18px' }}>
                <li>Email / mobile</li>
                <li>Password / OTP options</li>
                <li>Forgot password simulation</li>
              </ul>
              <button onClick={() => openAuthModal('login')} className="btn btn-secondary btn-sm" style={{ marginTop: '14px', width: '100%' }}>
                Open Login Modal
              </button>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#7c3aed', marginBottom: '8px' }}>REGISTER</h3>
              <ul style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '18px' }}>
                <li>Role choice: Candidate vs Recruiter</li>
                <li>Candidate: Name + contact + password</li>
                <li>Recruiter: Company name + contact</li>
              </ul>
              <button onClick={() => openAuthModal('register')} className="btn btn-primary btn-sm" style={{ marginTop: '14px', width: '100%' }}>
                Open Register Modal
              </button>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669', marginBottom: '8px' }}>VERIFY & REDIRECT</h3>
              <ul style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '18px' }}>
                <li>4-digit OTP code verification</li>
                <li>Candidate ➔ Candidate Dashboard</li>
                <li>Recruiter ➔ Recruiter Dashboard</li>
              </ul>
              <div style={{ marginTop: '14px', fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
                Automatic role-based dashboard router active!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: CANDIDATE PAGES (PDF Page 5) */}
      {activeSection === 'candidate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {[
              { code: 'C01', name: 'DASHBOARD', desc: 'Recommended jobs, profile completion %, active count' },
              { code: 'C02', name: 'PROFILE', desc: 'Personal details, education, experience, skills tags' },
              { code: 'C03', name: 'RESUME', desc: 'Upload, replace, view and download PDF resume' },
              { code: 'C04', name: 'FIND JOBS', desc: 'Real-time multi-filter and salary search' },
              { code: 'C05', name: 'JOB DETAILS', desc: 'Full job specifications and company background' },
              { code: 'C06', name: 'APPLY', desc: 'Choose resume, write cover note, confirm' },
              { code: 'C07', name: 'CONFIRM', desc: 'Success confetti & unique Application ID' },
              { code: 'C08', name: 'MY APPLICATIONS', desc: 'Live status pipeline tracking & interview dates' },
            ].map(c => (
              <div key={c.code} className="card" style={{ padding: '20px', borderLeft: '4px solid #2563eb' }}>
                <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 800 }}>{c.code}</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 6px' }}>{c.name}</div>
                <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{c.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#eff6ff', border: '1.5px solid #3b82f6', borderRadius: '12px', padding: '20px 24px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e40af' }}>CANDIDATE STATUS FLOW (FROM PDF PAGE 5):</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1d4ed8', margin: '8px 0' }}>
              Applied ➔ Viewed ➔ Shortlisted ➔ Interview ➔ Selected / Rejected
            </div>
            <p style={{ fontSize: '0.85rem', color: '#3b82f6' }}>
              Candidate sees every status change inside My Applications, plus live Google Meet link when interview is scheduled!
            </p>
            <button 
              onClick={async () => {
                await quickLoginAs('candidate');
                setActivePage('candidate-dash');
              }}
              className="btn btn-primary btn-sm" style={{ marginTop: '10px' }}>
              Open Live Candidate Dashboard
            </button>
          </div>
        </div>
      )}

      {/* SECTION 5: RECRUITER PAGES (PDF Page 6) */}
      {activeSection === 'recruiter' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {[
              { code: 'R01', name: 'DASHBOARD', desc: 'Active jobs count, applications count, shortlisted' },
              { code: 'R02', name: 'COMPANY', desc: 'Company name, logo URL, about, website, industry' },
              { code: 'R03', name: 'POST JOB', desc: 'Title, category, type, exp, salary, skills, description' },
              { code: 'R04', name: 'SUBMIT', desc: 'Save draft vs Submit for Admin approval' },
              { code: 'R05', name: 'PUBLISHED', desc: 'Approved jobs list live on the public website' },
              { code: 'R06', name: 'APPLICANTS', desc: 'Candidate list, filters, resume viewer' },
              { code: 'R07', name: 'CANDIDATE VIEW', desc: 'Profile details, education, experience, skills' },
              { code: 'R08', name: 'HIRING PIPELINE', desc: 'Shortlist, Google Meet interview, Select / Reject' },
            ].map(r => (
              <div key={r.code} className="card" style={{ padding: '20px', borderLeft: '4px solid #7c3aed' }}>
                <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 800 }}>{r.code}</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 6px' }}>{r.name}</div>
                <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{r.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#f5f3ff', border: '1.5px solid #7c3aed', borderRadius: '12px', padding: '20px 24px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#5b21b6' }}>RECRUITER CORE FLOW (FROM PDF PAGE 6):</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#6d28d9', margin: '8px 0' }}>
              Company Profile ➔ Post Job ➔ Admin Approval ➔ Publish ➔ Applications ➔ Review ➔ Shortlist ➔ Interview ➔ Hire
            </div>
            <button 
              onClick={async () => {
                await quickLoginAs('recruiter');
                setActivePage('recruiter-dash');
              }}
              className="btn btn-primary btn-sm" style={{ background: '#7c3aed', borderColor: '#7c3aed', marginTop: '10px' }}>
              Open Live Recruiter Dashboard
            </button>
          </div>
        </div>
      )}

      {/* SECTION 6: ADMIN PAGES (PDF Page 7) */}
      {activeSection === 'admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {[
              { code: 'A01', name: 'LOGIN', desc: 'Secure admin authentication credentials' },
              { code: 'A02', name: 'DASHBOARD', desc: 'Total users, recruiters, pending jobs, applications' },
              { code: 'A03', name: 'USERS', desc: 'Candidate & Recruiter management with Block/Unblock' },
              { code: 'A04', name: 'JOBS MODERATION', desc: 'Pending jobs queue: One-click Approve or Reject' },
              { code: 'A05', name: 'APPLICATIONS', desc: 'Platform-wide application monitoring and reports' },
              { code: 'A06', name: 'ANALYTICS', desc: 'Category breakdown and recruitment funnel charts' },
            ].map(a => (
              <div key={a.code} className="card" style={{ padding: '20px', borderLeft: '4px solid #059669' }}>
                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 800 }}>{a.code}</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 6px' }}>{a.name}</div>
                <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{a.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#ecfdf5', border: '1.5px solid #059669', borderRadius: '12px', padding: '20px 24px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#065f46' }}>JOB APPROVAL FLOW (FROM PDF PAGE 7):</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#047857', margin: '8px 0' }}>
              Recruiter submits ➔ Pending ➔ Admin reviews ➔ Approve = Published / Reject = Recruiter edits & resubmits
            </div>
            <button 
              onClick={async () => {
                await quickLoginAs('admin');
                setActivePage('admin-dash');
              }}
              className="btn btn-primary btn-sm" style={{ background: '#059669', borderColor: '#059669', marginTop: '10px' }}>
              Open Live Admin Moderation
            </button>
          </div>
        </div>
      )}

      {/* SECTION 7: APPLICATION LIFECYCLE (PDF Page 8) */}
      {activeSection === 'lifecycle' && (
        <div className="card" style={{ padding: '30px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            07 &bull; Application Lifecycle (One Application From Start to Finish)
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
            Tracing how an application moves step-by-step between candidate and recruiter.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {[
              { num: '01', title: 'JOB', sub: 'Approved, Public' },
              { num: '02', title: 'APPLY', sub: 'Candidate + Resume' },
              { num: '03', title: 'SAVE', sub: 'App ID + TiDB DB' },
              { num: '04', title: 'REVIEW', sub: 'Recruiter reviews profile' },
              { num: '05', title: 'SHORTLIST', sub: 'Move forward in pipeline' },
              { num: '06', title: 'INTERVIEW', sub: 'Schedule Google Meet' },
              { num: '07', title: 'FINAL', sub: 'Selected / Rejected' },
            ].map((step, idx) => (
              <div key={step.num} style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>{step.num}</div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', margin: '4px 0' }}>{step.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{step.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontWeight: 800, color: '#1e40af', fontSize: '0.88rem' }}>WHAT CANDIDATE SEES:</div>
              <div style={{ fontSize: '0.85rem', color: '#2563eb', marginTop: '4px' }}>
                My Applications + real-time status tracker + scheduled Google Meet button + Add to Calendar.
              </div>
            </div>

            <div style={{ padding: '16px', background: '#f5f3ff', borderRadius: '10px', border: '1px solid #ddd6fe' }}>
              <div style={{ fontWeight: 800, color: '#5b21b6', fontSize: '0.88rem' }}>WHAT RECRUITER SEES:</div>
              <div style={{ fontSize: '0.85rem', color: '#7c3aed', marginTop: '4px' }}>
                Applicant card + resume link + shortlist / schedule interview with auto Google Meet link + hire status.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 8: SPRINT CHECKLIST (PDF Page 11) */}
      {activeSection === 'checklist' && (
        <div className="card" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                10 &bull; Final Developer Checklist (All Sprint Blocks Verified)
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
                Every single block tested and working with TiDB Cloud.
              </p>
            </div>
            <span className="badge badge-approved" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
              ✅ 10 / 10 BLOCKS DONE = MVP READY
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: '01', name: 'Landing', desc: 'Header, search, categories, featured jobs', page: 'landing' },
              { id: '02', name: 'Search / Listing', desc: 'Filters, sorting, pagination, job cards', page: 'jobs' },
              { id: '03', name: 'Job Details', desc: 'Job info, company, requirements, Apply', page: 'jobs' },
              { id: '04', name: 'Authentication', desc: 'Login, register, OTP, forgot password', page: 'landing', action: () => openAuthModal('login') },
              { id: '05', name: 'Candidate', desc: 'Dashboard, profile, resume upload', page: 'candidate-dash', role: 'candidate' },
              { id: '06', name: 'Application', desc: 'Apply, confirmation, application history', page: 'candidate-dash', role: 'candidate' },
              { id: '07', name: 'Recruiter', desc: 'Company, post job, applicants', page: 'recruiter-dash', role: 'recruiter' },
              { id: '08', name: 'Hiring', desc: 'Shortlist, interview, select / reject', page: 'recruiter-dash', role: 'recruiter' },
              { id: '09', name: 'Admin', desc: 'Users, jobs, approvals, reports', page: 'admin-dash', role: 'admin' },
              { id: '10', name: 'System', desc: 'Notifications, validation, permissions, TiDB SSL', page: 'landing' },
            ].map(item => (
              <div 
                key={item.id}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px 18px', 
                  background: 'var(--bg-subtle)', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                    ✓
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginRight: '8px' }}>
                      {item.id} {item.name}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {item.desc}
                    </span>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (item.action) {
                      item.action();
                    } else {
                      if (item.role) await quickLoginAs(item.role);
                      setActivePage(item.page);
                    }
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ gap: '4px' }}>
                  <Play size={13} /> Test Live
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
