import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, FileText, Briefcase, CheckCircle, Clock, Calendar, ArrowRight, Upload, MapPin, Phone, Mail, Award, Heart, Video } from 'lucide-react';

export function CandidateDashboard({ onViewJob }) {
  const { user, token, toggleSaveJob, refreshSavedJobs } = useAuth();
  const [activeTab, setActiveTab] = useState('applications'); // 'applications', 'profile', 'resume', 'saved'
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Profile form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    headline: '',
    location: '',
    bio: '',
    skills: ''
  });

  const fetchCandidateData = async () => {
    setLoading(true);
    try {
      // Fetch applications
      const appRes = await fetch('/api/applications/candidate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const apps = await appRes.json();
      setApplications(Array.isArray(apps) ? apps : []);

      // Fetch saved jobs
      const savedRes = await fetch('/api/profile/saved-jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const savedData = await savedRes.json();
      setSavedJobs(Array.isArray(savedData) ? savedData : []);

      // Fetch profile
      const profRes = await fetch('/api/profile/candidate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const prof = await profRes.json();
      if (prof && !prof.error) {
        setProfile(prof);
        const parsedSkills = Array.isArray(prof.skills) ? prof.skills.join(', ') : (typeof prof.skills === 'string' ? JSON.parse(prof.skills || '[]').join(', ') : '');
        setFormData({
          name: prof.name || user?.name || '',
          phone: prof.phone || '',
          headline: prof.headline || '',
          location: prof.location || '',
          bio: prof.bio || '',
          skills: parsedSkills
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCandidateData();
  }, [token]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setMessage('');

    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/profile/candidate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          skills: skillsArray
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage('Profile updated successfully!');
      fetchCandidateData();
    } catch (err) {
      setMessage(err.message || 'Failed to update profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('resume', file);

    try {
      const res = await fetch('/api/profile/resume', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setMessage('Resume uploaded successfully!');
      fetchCandidateData();
    } catch (err) {
      alert(err.message || 'Failed to upload resume.');
    }
  };

  // Helper to render Application Lifecycle Step indicator (PDF Page 5 & 8)
  const renderStatusPipeline = (status) => {
    const stages = [
      { key: 'applied', label: '1. Applied' },
      { key: 'viewed', label: '2. Viewed' },
      { key: 'shortlisted', label: '3. Shortlisted' },
      { key: 'interview', label: '4. Interview' },
      { key: 'selected', label: status === 'rejected' ? 'Rejected' : '5. Selected' }
    ];

    const getStageState = (stageKey) => {
      if (status === 'rejected') {
        if (stageKey === 'selected') return 'rejected';
      }
      const order = ['applied', 'viewed', 'shortlisted', 'interview', 'selected'];
      const currentIndex = order.indexOf(status === 'rejected' ? 'interview' : status);
      const stageIndex = order.indexOf(stageKey);

      if (stageIndex < currentIndex) return 'completed';
      if (stageIndex === currentIndex) return 'active';
      return 'pending';
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
        {stages.map((stage, idx) => {
          const state = getStageState(stage.key);
          return (
            <React.Fragment key={stage.key}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: 
                  state === 'completed' ? '#d1fae5' :
                  state === 'active' ? '#e0e7ff' :
                  state === 'rejected' ? '#fee2e2' : '#f1f5f9',
                color:
                  state === 'completed' ? '#065f46' :
                  state === 'active' ? '#3730a3' :
                  state === 'rejected' ? '#991b1b' : '#94a3b8',
                border: state === 'active' ? '1.5px solid #818cf8' : '1px solid transparent'
              }}>
                {stage.label}
              </div>
              {idx < stages.length - 1 && (
                <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>➔</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '30px auto 80px', padding: '0 24px' }}>
      {/* Top Welcome Card with Profile Completion Bar */}
      <div className="card" style={{ padding: '28px', marginBottom: '28px', background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#c7d2fe', fontWeight: 600 }}>CANDIDATE DASHBOARD</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '2px', fontFamily: 'var(--font-display)' }}>
              Welcome back, {user?.name}!
            </h1>
            <p style={{ color: '#e0e7ff', fontSize: '0.95rem', marginTop: '4px' }}>
              Track your job applications, update your profile, and manage your resume.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(10px)', padding: '16px 20px', borderRadius: '12px', minWidth: '220px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px', fontWeight: 600 }}>
              <span>Profile Strength</span>
              <span>{profile?.completion_percentage || 50}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${profile?.completion_percentage || 50}%`, height: '100%', background: '#38bdf8', borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '6px' }}>
              Complete skills & resume to get 3x more recruiter views
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <button 
          id="tab-candidate-applications-btn"
          onClick={() => setActiveTab('applications')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            color: activeTab === 'applications' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'applications' ? '3px solid var(--primary)' : '3px solid transparent'
          }}>
          My Applications ({applications.length})
        </button>

        <button 
          id="tab-candidate-profile-btn"
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'profile' ? '3px solid var(--primary)' : '3px solid transparent'
          }}>
          Profile & Skills
        </button>

        <button 
          id="tab-candidate-resume-btn"
          onClick={() => setActiveTab('resume')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            color: activeTab === 'resume' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'resume' ? '3px solid var(--primary)' : '3px solid transparent'
          }}>
          Resume Document
        </button>

        <button 
          id="tab-candidate-saved-btn"
          onClick={() => setActiveTab('saved')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            color: activeTab === 'saved' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'saved' ? '3px solid var(--primary)' : '3px solid transparent'
          }}>
          Saved Jobs ({savedJobs.length})
        </button>
      </div>

      {message && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 18px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* TAB 1: APPLICATIONS LIST */}
      {activeTab === 'applications' && (
        <div>
          {applications.length === 0 ? (
            <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Briefcase size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No applications submitted yet</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
                Browse approved jobs on the portal and apply with your uploaded resume.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {applications.map((app) => (
                <div key={app.id} className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.8rem', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                          {app.application_code}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          Applied on {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h2 
                        onClick={() => onViewJob(app.job_id)}
                        style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '6px', cursor: 'pointer' }}>
                        {app.job_title}
                      </h2>
                      <div style={{ fontSize: '0.9rem', color: '#4338ca', fontWeight: 600 }}>
                        {app.company_name} &bull; {app.location}
                      </div>
                    </div>

                    <div>
                      <span className={`badge badge-${app.status}`}>
                        Status: {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Visual Status Progression */}
                  <div style={{ margin: '14px 0', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>APPLICATION JOURNEY</div>
                    {renderStatusPipeline(app.status)}
                  </div>

                  {/* Interview Information Card if scheduled */}
                  {app.status === 'interview' && (
                    <div style={{ marginTop: '14px', padding: '16px 20px', background: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b21a8', fontWeight: 800, fontSize: '0.95rem' }}>
                        <Calendar size={18} /> Interview Scheduled!
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#4c1d95' }}>
                        <strong>Date & Time:</strong> {app.interview_date ? new Date(app.interview_date).toLocaleString() : 'Recruiter will confirm time shortly.'}
                      </div>
                      {app.interview_notes && (
                        <div style={{ marginTop: '4px', fontSize: '0.85rem', color: '#581c87' }}>
                          <strong>Notes from Recruiter:</strong> {app.interview_notes}
                        </div>
                      )}

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                        {app.meeting_link && (
                          <a 
                            href={app.meeting_link} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn btn-primary btn-sm"
                            style={{ background: '#059669', color: '#fff', border: 'none', gap: '6px' }}>
                            <Video size={16} /> Join Google Meet Interview
                          </a>
                        )}

                        <a 
                          href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Interview: ${app.job_title} at ${app.company_name}`)}&details=${encodeURIComponent(`Interview with ${app.company_name}\nMeeting link: ${app.meeting_link || ''}\nNotes: ${app.interview_notes || ''}`)}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '6px' }}>
                          <Calendar size={15} /> Add to Google Calendar
                        </a>
                      </div>
                    </div>
                  )}

                  {app.cover_note && (
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '10px', background: '#f8fafc', padding: '10px 14px', borderRadius: '6px' }}>
                      <strong>Your Note:</strong> {app.cover_note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROFILE & SKILLS */}
      {activeTab === 'profile' && (
        <div className="card" style={{ padding: '32px', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px' }}>Personal Profile & Skills</h2>
          <form onSubmit={handleProfileSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Professional Headline</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="e.g. Senior Frontend Engineer | React & Node specialist"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Location</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="e.g. Chennai, India / Remote"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Skills (comma separated)</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="React, Node.js, Express, TiDB, MySQL, TypeScript"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">About / Bio</label>
              <textarea 
                className="form-control"
                rows={4}
                placeholder="Write a brief professional summary..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <button 
              id="save-candidate-profile-btn"
              type="submit" 
              disabled={saveLoading}
              className="btn btn-primary" style={{ marginTop: '10px' }}>
              {saveLoading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: RESUME */}
      {activeTab === 'resume' && (
        <div className="card" style={{ padding: '32px', maxWidth: '700px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>Resume & Documents</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
            Upload your resume so recruiters can review your profile when you apply.
          </p>

          {profile?.resume_url ? (
            <div style={{ padding: '20px', border: '1.5px solid #c7d2fe', borderRadius: '12px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <FileText size={32} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e1b4b' }}>
                    {profile.resume_name || 'My_Resume.pdf'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#4338ca' }}>
                    Active resume attached to your profile
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a 
                  href={profile.resume_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-secondary btn-sm">
                  View File
                </a>
                <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                  Replace
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          ) : (
            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '40px', textAlign: 'center', background: '#f8fafc', marginBottom: '24px' }}>
              <Upload size={36} color="#64748b" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Upload your resume</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                Supported formats: PDF, DOC, DOCX (Max 5MB)
              </p>
              <label className="btn btn-primary" style={{ marginTop: '16px', cursor: 'pointer' }}>
                Select File
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display: 'none' }} />
              </label>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SAVED JOBS */}
      {activeTab === 'saved' && (
        <div>
          {savedJobs.length === 0 ? (
            <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Heart size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No saved jobs yet</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
                Click the heart icon on any job card to bookmark positions you want to apply for later.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {savedJobs.map((job) => (
                <div key={job.id} className="card card-interactive" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{job.company_name}</div>
                    <h3 
                      onClick={() => onViewJob(job.id)}
                      style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px', cursor: 'pointer' }}>
                      {job.title}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px', fontSize: '0.85rem', color: '#64748b' }}>
                      <span>📍 {job.location}</span>
                      <span>⏱ {job.job_type}</span>
                      <span style={{ color: '#059669', fontWeight: 700 }}>
                        ₹{(job.salary_min / 100000).toFixed(1)}L - ₹{(job.salary_max / 100000).toFixed(1)}L PA
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button 
                      onClick={async () => {
                        await toggleSaveJob(job.id);
                        fetchCandidateData();
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#ef4444' }}
                      title="Remove Bookmark">
                      <Heart size={16} fill="#ef4444" color="#ef4444" /> Remove
                    </button>
                    <button 
                      onClick={() => onViewJob(job.id)}
                      className="btn btn-primary btn-sm">
                      View & Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
