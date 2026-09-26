import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, CheckCircle, XCircle, Users, Briefcase, FileText, AlertTriangle, 
  Search, Check, X, BarChart2, TrendingUp, Layers, Building2, Plus, Edit, 
  Trash2, ExternalLink, Globe, MapPin, Sparkles, CheckCircle2 
} from 'lucide-react';

export function AdminDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('pending-jobs'); // 'pending-jobs', 'all-jobs', 'companies', 'users', 'applications', 'analytics'
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companySearch, setCompanySearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Reject Job Modal
  const [rejectModalJob, setRejectModalJob] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Add/Edit Company Modal
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companySaving, setCompanySaving] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    logo_url: '',
    website: '',
    industry: 'Information Technology',
    location: '',
    about: ''
  });

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

      // 6. Analytics
      const anaRes = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const anaData = await anaRes.json();
      if (anaData && !anaData.error) setAnalytics(anaData);

      // 7. Companies (Admin exclusive management)
      const compRes = await fetch('/api/admin/companies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const compData = await compRes.json();
      setCompanies(Array.isArray(compData) ? compData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAdminData();
  }, [token]);

  const openAddCompany = () => {
    setEditingCompany(null);
    setCompanyForm({
      name: '',
      logo_url: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80',
      website: '',
      industry: 'Information Technology',
      location: 'Bangalore, India',
      about: ''
    });
    setShowCompanyModal(true);
  };

  const openEditCompany = (comp) => {
    setEditingCompany(comp);
    setCompanyForm({
      name: comp.name || '',
      logo_url: comp.logo_url || '',
      website: comp.website || '',
      industry: comp.industry || 'Information Technology',
      location: comp.location || '',
      about: comp.about || ''
    });
    setShowCompanyModal(true);
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!companyForm.name.trim()) {
      alert('Company Name is required.');
      return;
    }
    setCompanySaving(true);
    try {
      const url = editingCompany ? `/api/admin/companies/${editingCompany.id}` : '/api/admin/companies';
      const method = editingCompany ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(companyForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(data.message || 'Company saved successfully!');
      setShowCompanyModal(false);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to save company');
    } finally {
      setCompanySaving(false);
    }
  };

  const handleDeleteCompany = async (id, name) => {
    if (!confirm(`Are you sure you want to delete '${name}'?`)) return;
    try {
      const res = await fetch(`/api/admin/companies/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(data.message || 'Company removed successfully.');
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete company');
    }
  };

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
          id="tab-admin-companies-btn"
          onClick={() => setActiveTab('companies')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            color: activeTab === 'companies' ? '#059669' : 'var(--text-muted)',
            borderBottom: activeTab === 'companies' ? '3px solid #059669' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
          <Building2 size={16} /> Verified Companies ({companies.length})
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

        <button 
          id="tab-admin-analytics-btn"
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            color: activeTab === 'analytics' ? '#059669' : 'var(--text-muted)',
            borderBottom: activeTab === 'analytics' ? '3px solid #059669' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
          <BarChart2 size={16} /> Platform Analytics & Charts
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

      {/* TAB 5: PLATFORM ANALYTICS & CHARTS */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Platform Governance Ratio Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ padding: '22px' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Job Approval Ratio</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                {allJobs.length > 0 
                  ? Math.round((allJobs.filter(j => j.status === 'approved').length / allJobs.length) * 100) 
                  : 0}%
              </div>
              <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '4px' }}>
                {allJobs.filter(j => j.status === 'approved').length} of {allJobs.length} jobs approved
              </div>
            </div>

            <div className="card" style={{ padding: '22px' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Candidate to Recruiter Ratio</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6366f1', marginTop: '4px' }}>
                {(stats?.recruiters && stats?.recruiters > 0) 
                  ? ((stats?.candidates || 0) / stats.recruiters).toFixed(1) + ' : 1'
                  : 'N/A'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                Talent supply per active employer
              </div>
            </div>

            <div className="card" style={{ padding: '22px' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Platform Applications Total</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                {applications.length}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '4px' }}>
                Total candidate submissions
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Category Breakdown Chart */}
            <div className="card" style={{ padding: '26px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '18px' }}>
                Job Openings by Industry
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(analytics?.jobsByCategory || []).map((cat, i) => {
                  const max = Math.max(...(analytics?.jobsByCategory || []).map(c => c.count), 1);
                  const pct = Math.round((cat.count / max) * 100);
                  const colors = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
                  return (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                        <span>{cat.category}</span>
                        <span>{cat.count} listings</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', background: 'var(--bg-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(pct, 12)}%`, height: '100%', background: colors[i % colors.length], borderRadius: '6px' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Application Pipeline Status Breakdown */}
            <div className="card" style={{ padding: '26px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '18px' }}>
                Platform Application Status Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(analytics?.appsByStatus || []).map(s => {
                  const max = Math.max(...(analytics?.appsByStatus || []).map(a => a.count), 1);
                  const pct = Math.round((s.count / max) * 100);
                  return (
                    <div key={s.status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-main)', marginBottom: '4px' }}>
                        <span>{s.status}</span>
                        <span>{s.count} candidates</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', background: 'var(--bg-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(pct, 12)}%`, height: '100%', background: 'var(--primary)', borderRadius: '6px' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: COMPANIES MANAGEMENT (ADMIN EXCLUSIVE) */}
      {activeTab === 'companies' && (
        <div>
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={22} color="#059669" /> Verified Companies & Employers
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
                Admin-exclusive directory. Add organizations permitted to hire or be showcased across the portal.
              </p>
            </div>

            <button 
              id="admin-add-company-btn"
              onClick={openAddCompany}
              className="btn btn-primary"
              style={{ backgroundColor: '#059669', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}>
              <Plus size={18} /> Add New Company
            </button>
          </div>

          {/* Search bar */}
          <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '420px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search companies by name, industry, or location..."
              className="form-control"
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>

          {/* Companies Grid */}
          {(() => {
            const filtered = companies.filter(c => 
              c.name?.toLowerCase().includes(companySearch.toLowerCase()) ||
              c.industry?.toLowerCase().includes(companySearch.toLowerCase()) ||
              c.location?.toLowerCase().includes(companySearch.toLowerCase())
            );

            if (filtered.length === 0) {
              return (
                <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <Building2 size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No companies found</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                    Click "Add New Company" above to register organizations.
                  </p>
                </div>
              );
            }

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                {filtered.map(comp => (
                  <div key={comp.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-color)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                    <div>
                      {/* Top row: Logo, Name & Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <img 
                            src={comp.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80'} 
                            alt={comp.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80';
                            }}
                            style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                                {comp.name}
                              </h3>
                              <span title="Verified Enterprise" style={{ color: '#059669', display: 'inline-flex' }}>
                                <CheckCircle2 size={16} />
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                              {comp.industry || 'Information Technology'}
                            </div>
                          </div>
                        </div>

                        {/* Edit & Delete Buttons */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            onClick={() => openEditCompany(comp)}
                            title="Edit Company"
                            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'var(--text-main)' }}>
                            <Edit size={15} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCompany(comp.id, comp.name)}
                            title="Delete Company"
                            style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#991b1b' }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Location & Website */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {comp.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} color="#059669" /> {comp.location}
                          </div>
                        )}
                        {comp.website && (
                          <a 
                            href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', textDecoration: 'none' }}>
                            <Globe size={14} /> Website <ExternalLink size={11} />
                          </a>
                        )}
                      </div>

                      {/* About */}
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {comp.about || 'Verified corporate partner hiring through WorkPulse platform.'}
                      </p>
                    </div>

                    {/* Bottom Status bar */}
                    <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Listed: {new Date(comp.created_at).toLocaleDateString()}
                      </span>
                      <span style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        {comp.jobs_count || 0} Open Jobs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Add / Edit Company Modal */}
      {showCompanyModal && (
        <div className="modal-overlay" onClick={() => setShowCompanyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    {editingCompany ? 'Edit Company Profile' : 'Add New Verified Company'}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Admin-controlled employer catalog
                  </div>
                </div>
              </div>
              <button onClick={() => setShowCompanyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Zoho, Microsoft, Freshworks..."
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <select 
                    className="form-control"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}>
                    <option value="Information Technology">Information Technology</option>
                    <option value="SaaS & Enterprise">SaaS & Enterprise</option>
                    <option value="Data & Artificial Intelligence">Data & Artificial Intelligence</option>
                    <option value="Fintech & Banking">Fintech & Banking</option>
                    <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                    <option value="Healthcare & Bio">Healthcare & Bio</option>
                    <option value="Consulting & Services">Consulting & Services</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Headquarters / Location</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Chennai, Bangalore, Remote"
                    value={companyForm.location}
                    onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Website URL</label>
                <input 
                  type="url" 
                  className="form-control"
                  placeholder="https://company.com"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Logo Image URL</label>
                <input 
                  type="url" 
                  className="form-control"
                  placeholder="https://example.com/logo.png"
                  value={companyForm.logo_url}
                  onChange={(e) => setCompanyForm({ ...companyForm, logo_url: e.target.value })}
                />
                {/* Preset quick-picks */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Presets:</span>
                  {[
                    { label: '🏢 Tech', url: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80' },
                    { label: '💻 SaaS', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80' },
                    { label: '🚀 Modern', url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80' },
                    { label: '🌐 Global', url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=150&auto=format&fit=crop&q=80' }
                  ].map(p => (
                    <button 
                      key={p.label}
                      type="button"
                      onClick={() => setCompanyForm({ ...companyForm, logo_url: p.url })}
                      style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-subtle)', cursor: 'pointer' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">About Organization</label>
                <textarea 
                  className="form-control"
                  rows={3}
                  placeholder="Brief description of the company, mission, and culture..."
                  value={companyForm.about}
                  onChange={(e) => setCompanyForm({ ...companyForm, about: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowCompanyModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button 
                  id="save-company-btn"
                  type="submit" 
                  disabled={companySaving} 
                  className="btn btn-primary" 
                  style={{ flex: 1.5, backgroundColor: '#059669', borderColor: '#059669' }}>
                  {companySaving ? 'Saving...' : (editingCompany ? 'Update Company' : 'Add Company')}
                </button>
              </div>
            </form>
          </div>
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
