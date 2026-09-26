import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Building2, MapPin, Briefcase, Calendar, DollarSign, Share2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ApplyModal } from '../components/ApplyModal';

export function JobDetailsPage({ jobId, onBack, openAuthModal, onAppliedSuccess }) {
  const { user, role, token } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/jobs/${jobId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setJob(data);
      })
      .catch(err => setError('Failed to load job details.'))
      .finally(() => setLoading(false));

    // If logged in as candidate, check if already applied
    if (token && role === 'candidate') {
      fetch('/api/applications/candidate', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(apps => {
          if (Array.isArray(apps)) {
            const hasApplied = apps.some(a => a.job_id === parseInt(jobId, 10));
            setAlreadyApplied(hasApplied);
          }
        })
        .catch(err => console.error(err));
    }
  }, [jobId, token, role]);

  const handleApplyClick = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (role !== 'candidate') {
      alert(`You are currently logged in as a ${role}. Please sign in as a Candidate to apply for jobs.`);
      return;
    }
    setShowApplyModal(true);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '60px auto', textAlign: 'center', color: '#64748b' }}>
        Loading job specifications...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{ maxWidth: '700px', margin: '60px auto', padding: '30px', textAlign: 'center' }} className="card">
        <AlertCircle size={44} color="#ef4444" style={{ margin: '0 auto 12px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{error || 'Job not found'}</h2>
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '16px' }}>
          Back to Listings
        </button>
      </div>
    );
  }

  const skillsList = Array.isArray(job.skills) ? job.skills : (typeof job.skills === 'string' ? JSON.parse(job.skills || '[]') : []);

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto 80px', padding: '0 24px' }}>
      <button 
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginBottom: '20px' }}>
        <ArrowLeft size={18} /> Back to Job Listings
      </button>

      {/* Main Header Card */}
      <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {job.company_logo ? (
                <img src={job.company_logo} alt={job.company_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Building2 size={32} color="#64748b" />
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>{job.company_name}</span>
                <span className="badge badge-approved">Verified & Approved</span>
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 8px', fontFamily: 'var(--font-display)' }}>
                {job.title}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.9rem', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={16} /> {job.location}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Briefcase size={16} /> {job.job_type}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={16} /> {job.experience_level}
                </span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Offered Salary</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669' }}>
                ₹{(job.salary_min / 100000).toFixed(1)}L - ₹{(job.salary_max / 100000).toFixed(1)}L PA
              </div>
            </div>

            {alreadyApplied ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#d1fae5', color: '#065f46', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} /> Already Applied
              </div>
            ) : (
              <button 
                id="apply-job-main-btn"
                onClick={handleApplyClick} 
                className="btn btn-primary btn-lg">
                Apply for this Role
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description & Requirements Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Job Overview */}
          <div className="card" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
              About the Role
            </h2>
            <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {job.description}
            </div>
          </div>

          {/* Key Requirements */}
          {job.requirements && (
            <div className="card" style={{ padding: '28px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                Key Qualifications & Requirements
              </h2>
              <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {job.requirements}
              </div>
            </div>
          )}

          {/* Required Skills */}
          {skillsList.length > 0 && (
            <div className="card" style={{ padding: '28px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                Skills & Technologies
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {skillsList.map((skill, i) => (
                  <span key={i} style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600 }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Company Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
              About {job.company_name}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, marginBottom: '16px' }}>
              {job.company_about || 'A fast-growing technology leader focused on innovation, teamwork, and modern solutions.'}
            </p>

            {job.company_website && (
              <a 
                href={job.company_website} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-secondary btn-sm" 
                style={{ width: '100%', textAlign: 'center' }}>
                Visit Website
              </a>
            )}
          </div>

          <div className="card" style={{ padding: '24px', backgroundColor: '#f8fafc' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Safety & Verification
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
              This opening has passed platform admin review. You can apply directly through our secure portal and track status in real-time.
            </p>
          </div>
        </aside>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal 
          job={job}
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          onSuccess={(data) => {
            setAlreadyApplied(true);
            if (onAppliedSuccess) onAppliedSuccess(data);
          }}
        />
      )}
    </div>
  );
}
