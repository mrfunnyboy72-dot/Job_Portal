import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, FileText, Upload, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export function ApplyModal({ job, isOpen, onClose, onSuccess }) {
  const { user, token } = useAuth();
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (isOpen && token) {
      fetch('/api/profile/candidate', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setCandidateProfile(data);
            if (data.resume_url) {
              setResumeUrl(data.resume_url);
            }
          }
        })
        .catch(err => console.error(err));
    }
  }, [isOpen, token]);

  if (!isOpen || !job) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await fetch('/api/profile/resume', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResumeUrl(data.resume_url);
      setCandidateProfile(prev => ({ ...prev, resume_name: data.resume_name, resume_url: data.resume_url }));
    } catch (err) {
      setError(err.message || 'Failed to upload resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          job_id: job.id,
          resume_url: resumeUrl,
          cover_note: coverNote
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit application');

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setSuccessData(data);
      if (onSuccess) onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Apply for {job.title}
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
              {job.company_name} &bull; {job.location}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {successData ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Application Submitted!</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
              Your application has been received by {job.company_name}.
            </p>
            <div style={{ margin: '16px 0', padding: '12px', background: '#f1f5f9', borderRadius: '8px', display: 'inline-block' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Application Reference ID: </span>
              <strong style={{ fontSize: '1rem', color: '#0f172a', letterSpacing: '0.05em' }}>{successData.application_id}</strong>
            </div>
            <div style={{ marginTop: '20px' }}>
              <button 
                id="view-applications-btn"
                onClick={onClose}
                className="btn btn-primary" style={{ width: '100%' }}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleApply}>
            {/* Resume Selection */}
            <div className="form-group">
              <label className="form-label">Resume / CV</label>
              {candidateProfile?.resume_url ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1.5px solid #c7d2fe', borderRadius: '8px', backgroundColor: '#eef2ff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={20} color="var(--primary)" />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e1b4b' }}>
                        {candidateProfile.resume_name || 'My Profile Resume'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#4338ca' }}>Ready to submit</div>
                    </div>
                  </div>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                    Change
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              ) : (
                <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                  <Upload size={28} color="#64748b" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
                    {uploadingResume ? 'Uploading resume...' : 'Upload your resume (PDF, Word)'}
                  </div>
                  <label className="btn btn-outline btn-sm" style={{ marginTop: '10px', cursor: 'pointer' }}>
                    Browse Files
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              )}
            </div>

            {/* Cover Note */}
            <div className="form-group">
              <label className="form-label">Cover Note / Introduction (Optional)</label>
              <textarea 
                className="form-control"
                placeholder="Explain why you are a great fit for this position..."
                rows={4}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button 
                id="submit-application-btn"
                type="submit" 
                disabled={loading || uploadingResume}
                className="btn btn-primary" 
                style={{ flex: 1.5 }}>
                {loading ? 'Submitting...' : 'Confirm & Apply'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
