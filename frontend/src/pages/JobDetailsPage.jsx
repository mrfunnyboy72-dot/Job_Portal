import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Building2, MapPin, Briefcase, Calendar, DollarSign, Heart, CheckCircle2, AlertCircle, Sparkles, Check, X, Zap } from 'lucide-react';
import { ApplyModal } from '../components/ApplyModal';

export function JobDetailsPage({ jobId, onBack, openAuthModal, onAppliedSuccess }) {
  const { user, role, token, savedJobIds, toggleSaveJob } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);

  const isSaved = savedJobIds.includes(parseInt(jobId, 10));

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

    // If logged in as candidate, check if already applied & calculate AI match score
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

      // Fetch candidate profile to compute AI Match score
      setMatchLoading(true);
      fetch('/api/profile/candidate', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(prof => {
          if (prof && !prof.error) {
            const skillsArr = Array.isArray(prof.skills) ? prof.skills : (typeof prof.skills === 'string' ? JSON.parse(prof.skills || '[]') : []);
            return fetch(`/api/jobs/${jobId}/match-score`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                candidateSkills: skillsArr,
                candidateHeadline: prof.headline || ''
              })
            });
          }
        })
        .then(res => res ? res.json() : null)
        .then(data => {
          if (data && !data.error) {
            setMatchData(data);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setMatchLoading(false));
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

  const handleSaveClick = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (role !== 'candidate') {
      alert('Only candidates can bookmark jobs.');
      return;
    }
    await toggleSaveJob(parseInt(jobId, 10));
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
    <div className="container-responsive" style={{ maxWidth: '1000px', margin: '20px auto 80px', padding: '0 20px' }}>
      <button 
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginBottom: '16px' }}>
        <ArrowLeft size={18} /> Back to Job Listings
      </button>

      {/* Main Header Card */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div className="job-details-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '56px', height: '56px', flexShrink: 0, borderRadius: '14px', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {job.company_logo ? (
                <img src={job.company_logo} alt={job.company_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Building2 size={28} color="var(--text-muted)" />
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>{job.company_name}</span>
                <span className="badge badge-approved">Verified & Approved</span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 8px', fontFamily: 'var(--font-display)' }}>
                {job.title}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={15} /> {job.location}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Briefcase size={15} /> {job.job_type}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={15} /> {job.experience_level}
                </span>
              </div>
            </div>
          </div>

          <div className="job-details-action-col" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Offered Salary</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
                ₹{(job.salary_min / 100000).toFixed(1)}L - ₹{(job.salary_max / 100000).toFixed(1)}L PA
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Bookmark Button */}
              <button 
                id="bookmark-job-btn"
                onClick={handleSaveClick}
                className="btn btn-secondary"
                style={{ padding: '10px 14px', color: isSaved ? '#ef4444' : 'var(--text-main)' }}
                title={isSaved ? 'Remove from Saved' : 'Save Job'}>
                <Heart size={20} fill={isSaved ? '#ef4444' : 'none'} color={isSaved ? '#ef4444' : 'currentColor'} />
              </button>

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
      </div>

      {/* AI Resume Match & ATS Fit Card (Feature 2) */}
      {matchData && (
        <div className="card" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(14, 165, 233, 0.05) 100%)', border: '1.5px solid #818cf8', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: matchData.matchScore >= 80 ? '#10b981' : '#6366f1', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                {matchData.matchScore}%
                <span style={{ fontSize: '0.6rem', fontWeight: 600 }}>MATCH</span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Sparkles size={14} /> AI ATS RESUME FIT: {matchData.fitLevel}
                </div>
                <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', marginTop: '2px', fontWeight: 600 }}>
                  {matchData.insights}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(129, 140, 248, 0.2)' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} /> Matched Skills ({matchData.matchedSkills.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {matchData.matchedSkills.length > 0 ? matchData.matchedSkills.map((s, i) => (
                  <span key={i} style={{ fontSize: '0.78rem', background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    {s}
                  </span>
                )) : <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>None matched yet</span>}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#d97706', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={14} /> Recommended to Highlight ({matchData.missingSkills.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {matchData.missingSkills.length > 0 ? matchData.missingSkills.map((s, i) => (
                  <span key={i} style={{ fontSize: '0.78rem', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    + {s}
                  </span>
                )) : <span style={{ fontSize: '0.78rem', color: '#059669' }}>You have all required skills!</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description & Requirements Grid */}
      <div className="job-details-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Job Overview */}
          <div className="card" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>
              About the Role
            </h2>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {job.description}
            </div>
          </div>

          {/* Key Requirements */}
          {job.requirements && (
            <div className="card" style={{ padding: '28px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>
                Key Qualifications & Requirements
              </h2>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {job.requirements}
              </div>
            </div>
          )}

          {/* Required Skills */}
          {skillsList.length > 0 && (
            <div className="card" style={{ padding: '28px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>
              About {job.company_name}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
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

          <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-subtle)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              Safety & Verification
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
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
