import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, CheckCircle, XCircle, Users, Briefcase, FileText, AlertTriangle, Search, Check, X } from 'lucide-react';

export function AdminDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('pending-jobs'); // 'pending-jobs', 'all-jobs', 'users', 'applications'
  const [stats, setStats] = useState(null);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Reject Job Modal
  const [rejectModalJob, setRejectModalJob] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Pending Jobs
      const pendingRes = await fetch('/api/admin/pending-jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pendingData = await pendingRes.json();
      setPendingJobs(Array.isArray(pendingData) ? pendingData : []);

      // 3. All Jobs
      const allJobsRes = await fetch('/api/admin/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allJobsData = await allJobsRes.json();
      setAllJobs(Array.isArray(allJobsData) ? allJobsData : []);

      // 4. Users
      const usersRes = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      setUsers(Array.isArray(usersData) ? usersData : []);

      // 5. Applications
      const appsRes = await fetch('/api/admin/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const appsData = await appsRes.json();
      setApplications(Array.isArray(appsData) ? appsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAdminData();
  }, [token]);

  // Moderate Job: Approve or Reject
  const handleModerateJob = async (jobId, action, rejection_reason = '') => {
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, rejection_reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(data.message);
      if (rejectModalJob) setRejectModalJob(null);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to moderate job');
    }
  };

  // Toggle User Block/Unblock
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(data.message);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '30px auto 80px', padding: '0 24px' }}>
      {/* Top Admin Header */}
      <div className="card" style={{ padding: '28px', marginBottom: '28px', background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#6ee7b7', fontWeight: 700 }}>
              <Shield size={18} /> PLATFORM ADMINISTRATOR CONTROL PANEL
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', fontFamily: 'var(--font-display)' }}>
              Moderation & Governance
            </h1>
            <p style={{ color: '#a7f3d0', fontSize: '0.92rem', marginTop: '2px' }}>
              Review recruiter job submissions, moderate listings, monitor user compliance, and track applications.
            </p>
          </div>
        </div>

        {/* Real-time Metrics from TiDB */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>Pending Approval</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24' }}>
              {stats?.pendingJobs || pendingJobs.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>Live / Approved Jobs</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>
              {stats?.approvedJobs || 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>Registered Candidates</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              {stats?.candidates || 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>Active Recruiters</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              {stats?.recruiters || 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>Total Applications</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              {stats?.totalApplications || 0}
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 18px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <button 
          id="tab-admin-pending-btn"
          onClick={() => setActiveTab('pending-jobs')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            color: activeTab === 'pending-jobs' ? '#059669' : 'var(--text-muted)',
            borderBottom: activeTab === 'pending-jobs' ? '3px solid #059669' : '3px solid transparent'
          }}>
          Pending Approvals ({pendingJobs.length})
        </button>

        <button 
          id="tab-admin-all-jobs-btn"
          onClick={() => setActiveTab('all-jobs')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            color: activeTab === 'all-jobs' ? '#059669' : 'var(--text-muted)',
            borderBottom: activeTab === 'all-jobs' ? '3px solid #059669' : '3px solid transparent'
          }}>
          All Jobs Database ({allJobs.length})
        </button>

        <button 
          id="tab-admin-users-btn"
          onClick={() => setActiveTab('users')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            color: activeTab === 'users' ? '#059669' : 'var(--text-muted)',
            borderBottom: activeTab === 'users' ? '3px solid #059669' : '3px solid transparent'
          }}>
          User Management ({users.length})
        </button>

        <button 
          id="tab-admin-apps-btn"
          onClick={() => setActiveTab('applications')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            color: activeTab === 'applications' ? '#059669' : 'var(--text-muted)',
            borderBottom: activeTab === 'applications' ? '3px solid #059669' : '3px solid transparent'
          }}>
          Applications Monitor ({applications.length})
        </button>
      </div>

      {/* TAB 1: PENDING JOBS APPROVAL QUEUE (CRITICAL BUSINESS RULE) */}
      {activeTab === 'pending-jobs' && (
        <div>
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 18px', color: '#92400e', fontSize: '0.88rem', marginBottom: '20px' }}>
            ⚡ <strong>Critical Business Rule (PDF Page 2 & 7):</strong> Jobs posted by recruiters are held in this pending queue. Candidates cannot view or apply to a job until an Admin approves it!
          </div>

          {pendingJobs.length === 0 ? (
            <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <CheckCircle size={44} color="#10b981" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Approval queue is clear!</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
                All recruiter job postings have been reviewed.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {pendingJobs.map((job) => (
                <div key={job.id} className="card" style={{ padding: '28px', borderLeft: '5px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="badge badge-pending">
                          Awaiting Review
                        </span>
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                          Submitted on {new Date(job.created_at).toLocaleString()}
                        </span>
                      </div>

                      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
                        {job.title}
                      </h2>
                      <div style={{ fontSize: '0.9rem', color: '#4338ca', fontWeight: 600 }}>
                        Company: {job.company_name || 'TechCorp'} &bull; Recruiter: {job.recruiter_name} ({job.recruiter_email})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                        <span>📂 {job.category}</span>
                        <span>📍 {job.location}</span>
                        <span>⏱ {job.job_type}</span>
                        <span>🎓 {job.experience_level}</span>
                        <span>💰 ₹{(job.salary_min / 100000).toFixed(1)}L - ₹{(job.salary_max / 100000).toFixed(1)}L PA</span>
                      </div>
                    </div>

                    {/* Action Buttons: Approve vs Reject */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        id={`reject-job-btn-${job.id}`}
                        onClick={() => {
                          setRejectModalJob(job);
                          setRejectReason('');
                        }}
                        className="btn btn-danger" style={{ padding: '8px 16px' }}>
                        <X size={16} /> Reject
                      </button>

                      <button 
                        id={`approve-job-btn-${job.id}`}
                        onClick={() => handleModerateJob(job.id, 'approve')}
                        className="btn btn-success" style={{ padding: '8px 20px', fontWeight: 700 }}>
                        <Check size={16} /> Approve & Publish
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Job Description Preview:
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {job.description}
                    </p>
                  </div>

                  {job.requirements && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Requirements:
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {job.requirements}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL JOBS */}
      {activeTab === 'all-jobs' && (
        <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: '#64748b' }}>
                <th style={{ padding: '12px 16px' }}>Job Title</th>
                <th style={{ padding: '12px 16px' }}>Company</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {allJobs.map(job => (
                <tr key={job.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{job.title}</td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{job.company_name}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{job.category}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge badge-${job.status}`}>{job.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {job.status === 'pending' && (
                      <button 
                        onClick={() => handleModerateJob(job.id, 'approve')}
                        className="btn btn-success btn-sm">
                        Approve
                      </button>
                    )}
                    {job.status === 'approved' && (
                      <button 
                        onClick={() => handleModerateJob(job.id, 'reject', 'Revoked by Admin.')}
                        className="btn btn-danger btn-sm">
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: '#64748b' }}>
                <th style={{ padding: '12px 16px' }}>Name</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Role</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{u.name}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 600, color: u.role === 'recruiter' ? '#7c3aed' : '#2563eb' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${u.status === 'active' ? 'badge-approved' : 'badge-rejected'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button 
                      onClick={() => handleToggleUserStatus(u.id, u.status)}
                      className={`btn btn-sm ${u.status === 'active' ? 'btn-danger' : 'btn-success'}`}>
                      {u.status === 'active' ? 'Block User' : 'Unblock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: APPLICATIONS MONITOR */}
      {activeTab === 'applications' && (
        <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: '#64748b' }}>
                <th style={{ padding: '12px 16px' }}>App Code</th>
                <th style={{ padding: '12px 16px' }}>Job Opening</th>
                <th style={{ padding: '12px 16px' }}>Candidate</th>
                <th style={{ padding: '12px 16px' }}>Recruiter</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{app.application_code}</td>
                  <td style={{ padding: '12px 16px', color: '#0f172a' }}>{app.job_title}</td>
                  <td style={{ padding: '12px 16px' }}>{app.candidate_name} ({app.candidate_email})</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{app.company_name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge badge-${app.status}`}>{app.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Modal with Remarks */}
      {rejectModalJob && (
        <div className="modal-overlay" onClick={() => setRejectModalJob(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991b1b', marginBottom: '4px' }}>
              Reject Job Submission
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '16px' }}>
              Provide constructive feedback to {rejectModalJob.company_name} so they can update and resubmit.
            </p>

            <div className="form-group">
              <label className="form-label">Rejection Reason / Guidance</label>
              <textarea 
                className="form-control"
                rows={3}
                placeholder="e.g. Please provide more clarity on required salary range and years of experience."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="button" onClick={() => setRejectModalJob(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button 
                id="confirm-reject-job-btn"
                type="button" 
                onClick={() => handleModerateJob(rejectModalJob.id, 'reject', rejectReason)}
                className="btn btn-danger" style={{ flex: 1.5 }}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
