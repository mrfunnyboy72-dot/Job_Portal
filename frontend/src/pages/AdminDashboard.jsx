import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, CheckCircle, XCircle, Users, Briefcase, FileText, AlertTriangle, 
  Search, Check, X, BarChart2, TrendingUp, Layers, Building2, Plus, Edit, 
  Trash2, ExternalLink, Globe, MapPin, Sparkles, CheckCircle2, Settings, 
  Sliders, ShieldCheck, Download, UserCheck, UserX, Clock, Tag, Code2
} from 'lucide-react';

export function AdminDashboard() {
  const { token } = useAuth();
  // Clean tab views: Dashboard, Users, Jobs, Applications, Categories, Reports, Settings
  const [activeTab, setActiveTab] = useState('dashboard');

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [categoriesData, setCategoriesData] = useState({ categories: [], locations: [], skills: [] });
  const [settings, setSettings] = useState({
    require_admin_approval: true,
    allow_candidate_registration: true,
    allow_recruiter_registration: true,
    max_jobs_per_recruiter: 50,
    enable_email_alerts: true,
    maintenance_mode: false
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // A03 Users filter
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  // A04 Jobs sub-view
  const [jobSubTab, setJobSubTab] = useState('pending'); // 'pending', 'all-jobs', 'companies'
  const [rejectModalJob, setRejectModalJob] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Company modal in A04
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

  // A06 Add Category form
  const [newCatName, setNewCatName] = useState('');
  const [catSaving, setCatSaving] = useState(false);

  // A08 Settings saving
  const [settingsSaving, setSettingsSaving] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Stats (A02)
      const statsRes = await fetch('/api/admin/stats', { headers });
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Pending Jobs (A04)
      const pendingRes = await fetch('/api/admin/pending-jobs', { headers });
      const pendingData = await pendingRes.json();
      setPendingJobs(Array.isArray(pendingData) ? pendingData : []);

      // 3. All Jobs (A04)
      const allJobsRes = await fetch('/api/admin/jobs', { headers });
      const allJobsData = await allJobsRes.json();
      setAllJobs(Array.isArray(allJobsData) ? allJobsData : []);

      // 4. Users (A03)
      const usersRes = await fetch('/api/admin/users', { headers });
      const usersData = await usersRes.json();
      setUsers(Array.isArray(usersData) ? usersData : []);

      // 5. Applications (A05)
      const appsRes = await fetch('/api/admin/applications', { headers });
      const appsData = await appsRes.json();
      setApplications(Array.isArray(appsData) ? appsData : []);

      // 6. Companies (A04)
      const compRes = await fetch('/api/admin/companies', { headers });
      const compData = await compRes.json();
      setCompanies(Array.isArray(compData) ? compData : []);

      // 7. Categories & Catalogs (A06)
      const catRes = await fetch('/api/admin/categories', { headers });
      const catData = await catRes.json();
      if (catData && !catData.error) setCategoriesData(catData);

      // 8. Reports / Analytics (A07)
      const anaRes = await fetch('/api/admin/analytics', { headers });
      const anaData = await anaRes.json();
      if (anaData && !anaData.error) setAnalytics(anaData);

      // 9. Platform Settings (A08)
      const setRes = await fetch('/api/admin/settings', { headers });
      const setData = await setRes.json();
      if (setData && !setData.error) setSettings(prev => ({ ...prev, ...setData }));

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAdminData();
  }, [token]);

  // Handle Moderate Job (A04)
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

  // Toggle User Block/Unblock (A03)
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

  // Companies Management in A04
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
    if (!companyForm.name.trim()) return alert('Company Name is required.');
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

      setMessage(data.message || 'Company removed.');
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete company');
    }
  };

  // Add Category (A06)
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCatSaving(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCatName.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      setNewCatName('');
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to add category');
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!confirm(`Delete category '${name}'?`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  // Save Settings (A08)
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage('Platform configuration rules saved successfully!');
    } catch (err) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  // Export CSV Report (A07)
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Metric,Value\n" + 
      `Total Users,${stats?.totalUsers || 0}\n` + 
      `Candidates,${stats?.candidates || 0}\n` + 
      `Recruiters,${stats?.recruiters || 0}\n` + 
      `Total Jobs,${stats?.totalJobs || 0}\n` + 
      `Pending Jobs,${stats?.pendingJobs || 0}\n` + 
      `Approved Jobs,${stats?.approvedJobs || 0}\n` + 
      `Total Applications,${stats?.totalApplications || 0}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `workpulse_platform_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '20px auto 80px', padding: '0 24px' }}>
      {/* Success Notification message */}
      {message && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 18px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{message}</span>
          <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Admin Navigation Menu (Dashboard, Users, Jobs, Applications, Categories, Reports, Settings) */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '6px', 
        background: '#0f172a', 
        padding: '8px', 
        borderRadius: '12px', 
        border: '1px solid #1e293b', 
        marginBottom: '26px' 
      }}>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: ShieldCheck, badge: null },
          { id: 'users', label: 'Users', icon: Users, badge: users.length },
          { id: 'jobs', label: 'Jobs', icon: Briefcase, badge: pendingJobs.length > 0 ? `${pendingJobs.length} Pending` : `${allJobs.length}` },
          { id: 'applications', label: 'Applications', icon: FileText, badge: applications.length },
          { id: 'categories', label: 'Categories', icon: Tag, badge: categoriesData.categories?.length || 0 },
          { id: 'reports', label: 'Reports', icon: BarChart2, badge: null },
          { id: 'settings', label: 'Settings', icon: Settings, badge: null },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.86rem',
                fontWeight: 700,
                background: isActive ? '#059669' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                transition: 'all 0.2s',
              }}>
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span style={{ 
                  background: isActive ? 'rgba(0,0,0,0.25)' : '#1e293b', 
                  color: isActive ? '#fff' : '#cbd5e1', 
                  fontSize: '0.72rem', 
                  padding: '2px 7px', 
                  borderRadius: '9999px',
                  fontWeight: 800
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================
          DASHBOARD (Overview Metrics: Users, Recruiters, Jobs)
          ======================================================== */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Top Banner */}
          <div className="card" style={{ padding: '28px', marginBottom: '24px', background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '3px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                  EXECUTIVE DASHBOARD
                </span>
                <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '8px', margin: 0, fontFamily: 'var(--font-display)' }}>
                  Platform Executive Overview
                </h1>
                <p style={{ color: '#a7f3d0', fontSize: '0.92rem', marginTop: '4px' }}>
                  Live metrics, user volumes, job approvals status, and system telemetry from TiDB Cloud.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setActiveTab('jobs')}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#10b981', color: '#022c22', fontWeight: 800, border: 'none' }}>
                  Review Pending Jobs ({pendingJobs.length})
                </button>
              </div>
            </div>

            {/* Metrics Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>Total Registered Users</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800 }}>{stats?.totalUsers || users.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>Registered Candidates</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#38bdf8' }}>{stats?.candidates || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>Active Recruiters</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#c084fc' }}>{stats?.recruiters || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>Pending Approval</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fbbf24' }}>{pendingJobs.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>Live / Approved Jobs</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#34d399' }}>{stats?.approvedJobs || allJobs.filter(j => j.status === 'approved').length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>Verified Companies</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f472b6' }}>{companies.length}</div>
              </div>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Pending Jobs Quick Box */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  ⏳ Pending Moderation Queue
                </h3>
                <span className="badge badge-pending">{pendingJobs.length} Awaiting</span>
              </div>
              {pendingJobs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No pending jobs waiting for moderation. Quality gate is clear.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pendingJobs.slice(0, 3).map(j => (
                    <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{j.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{j.company_name} &bull; {j.location}</div>
                      </div>
                      <button 
                        onClick={() => handleModerateJob(j.id, 'approve')}
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: '#059669', borderColor: '#059669', fontSize: '0.75rem', padding: '5px 10px' }}>
                        Quick Approve
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setActiveTab('jobs')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', marginTop: '6px' }}>
                    View all Jobs & Approvals &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Quick System Governance & Rules */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 14px' }}>
                🛡️ System Governance Rules
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
                  <span>Job Moderation Policy:</span>
                  <strong style={{ color: '#059669' }}>Mandatory Approval Active</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
                  <span>Database Engine:</span>
                  <strong style={{ color: '#38bdf8' }}>TiDB Cloud Serverless (SSL)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
                  <span>Verified Employers:</span>
                  <strong>{companies.length} Organizations</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          USERS (Candidate, Recruiter, Block / Unblock)
          ======================================================== */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '22px' }}>
            <div>
              <span style={{ color: '#059669', fontSize: '0.78rem', fontWeight: 800 }}>USER MANAGEMENT</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 0' }}>
                Candidates & Recruiters Directory
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
                Audit accounts, examine contact info, and enforce access controls via block/unblock.
              </p>
            </div>

            {/* Filter buttons & Search */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '8px', padding: '3px' }}>
                {['all', 'candidate', 'recruiter'].map(r => (
                  <button 
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: userRoleFilter === r ? '#059669' : 'transparent',
                      color: userRoleFilter === r ? '#fff' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}>
                    {r}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search user..."
                  className="form-control"
                  style={{ paddingLeft: '32px', fontSize: '0.85rem', width: '200px' }}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <th style={{ padding: '12px 14px' }}>USER</th>
                  <th style={{ padding: '12px 14px' }}>ROLE</th>
                  <th style={{ padding: '12px 14px' }}>PHONE</th>
                  <th style={{ padding: '12px 14px' }}>STATUS</th>
                  <th style={{ padding: '12px 14px' }}>JOINED</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(u => userRoleFilter === 'all' || u.role === userRoleFilter)
                  .filter(u => !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()))
                  .map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem', 
                          fontWeight: 700,
                          background: u.role === 'recruiter' ? '#ede9fe' : '#e0f2fe',
                          color: u.role === 'recruiter' ? '#6d28d9' : '#0369a1',
                          textTransform: 'capitalize'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {u.phone || '—'}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem', 
                          fontWeight: 700,
                          background: u.status === 'active' ? '#d1fae5' : '#fee2e2',
                          color: u.status === 'active' ? '#065f46' : '#991b1b',
                          textTransform: 'uppercase'
                        }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        {u.status === 'active' ? (
                          <button 
                            onClick={() => handleToggleUserStatus(u.id, u.status)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#dc2626', borderColor: '#fca5a5', padding: '5px 10px', fontSize: '0.78rem' }}>
                            <UserX size={14} /> Block
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleToggleUserStatus(u.id, u.status)}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: '#059669', borderColor: '#059669', padding: '5px 10px', fontSize: '0.78rem' }}>
                            <UserCheck size={14} /> Unblock
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          JOBS (Pending Jobs, Approve, Reject, Live Jobs, Companies)
          ======================================================== */}
      {activeTab === 'jobs' && (
        <div>
          {/* Sub Navigation */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              onClick={() => setJobSubTab('pending')}
              className={`btn ${jobSubTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ backgroundColor: jobSubTab === 'pending' ? '#059669' : '', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> Pending Approvals ({pendingJobs.length})
            </button>
            <button 
              onClick={() => setJobSubTab('all-jobs')}
              className={`btn ${jobSubTab === 'all-jobs' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ backgroundColor: jobSubTab === 'all-jobs' ? '#059669' : '', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={16} /> All Jobs Database ({allJobs.length})
            </button>
            <button 
              onClick={() => setJobSubTab('companies')}
              className={`btn ${jobSubTab === 'companies' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ backgroundColor: jobSubTab === 'companies' ? '#059669' : '', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} /> Verified Companies ({companies.length})
            </button>
          </div>

          {/* SUB-VIEW 1: PENDING JOBS APPROVAL QUEUE */}
          {jobSubTab === 'pending' && (
            <div>
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 18px', color: '#92400e', fontSize: '0.88rem', marginBottom: '20px' }}>
                ⚡ <strong>Critical Business Rule (PDF Page 2 & 7):</strong> Jobs submitted by recruiters are held here until an Admin approves them.
              </div>

              {pendingJobs.length === 0 ? (
                <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <CheckCircle size={44} color="#10b981" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Approval queue is clear!</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                    All recruiter job postings have been reviewed.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {pendingJobs.map(job => (
                    <div key={job.id} className="card" style={{ padding: '24px', borderLeft: '5px solid #f59e0b' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                        <div>
                          <span className="badge badge-pending">Awaiting Review</span>
                          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
                            {job.title}
                          </h2>
                          <div style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 600 }}>
                            Company: {job.company_name} &bull; Recruiter: {job.recruiter_name} ({job.recruiter_email})
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            📍 {job.location} &bull; {job.job_type} &bull; Experience: {job.experience_level} &bull; Salary: ₹{(job.salary_min / 100000).toFixed(1)}L - ₹{(job.salary_max / 100000).toFixed(1)}L
                          </div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '12px', lineHeight: 1.5 }}>
                            {job.description}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleModerateJob(job.id, 'approve')}
                            className="btn btn-primary"
                            style={{ backgroundColor: '#059669', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Check size={16} /> Approve Job
                          </button>
                          <button 
                            onClick={() => {
                              setRejectModalJob(job);
                              setRejectReason('');
                            }}
                            className="btn btn-secondary"
                            style={{ color: '#dc2626', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <X size={16} /> Reject with Note
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 2: ALL JOBS */}
          {jobSubTab === 'all-jobs' && (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      <th style={{ padding: '10px' }}>JOB TITLE</th>
                      <th style={{ padding: '10px' }}>COMPANY</th>
                      <th style={{ padding: '10px' }}>STATUS</th>
                      <th style={{ padding: '10px' }}>SALARY</th>
                      <th style={{ padding: '10px' }}>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allJobs.map(j => (
                      <tr key={j.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{j.title}</td>
                        <td style={{ padding: '12px', color: 'var(--primary)' }}>{j.company_name}</td>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge ${j.status === 'approved' ? 'badge-approved' : j.status === 'pending' ? 'badge-pending' : 'badge-rejected'}`}>
                            {j.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.85rem' }}>₹{(j.salary_min / 100000).toFixed(1)}L - ₹{(j.salary_max / 100000).toFixed(1)}L</td>
                        <td style={{ padding: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{new Date(j.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-VIEW 3: VERIFIED COMPANIES */}
          {jobSubTab === 'companies' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Admin-Verified Companies
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '2px 0 0' }}>
                    Employers allowed to post and be showcased in the job directory.
                  </p>
                </div>
                <button 
                  onClick={openAddCompany}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#059669', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} /> Add Company
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                {companies.map(c => (
                  <div key={c.id} className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={c.logo_url} alt={c.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{c.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{c.industry}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => openEditCompany(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                          <Edit size={15} color="var(--text-muted)" />
                        </button>
                        <button onClick={() => handleDeleteCompany(c.id, c.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                          <Trash2 size={15} color="#ef4444" />
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                      📍 {c.location || 'India'} &bull; {c.jobs_count || 0} Open Jobs
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          APPLICATIONS (Monitor, Status, Audit Reports)
          ======================================================== */}
      {activeTab === 'applications' && (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ marginBottom: '22px' }}>
            <span style={{ color: '#059669', fontSize: '0.78rem', fontWeight: 800 }}>APPLICATION AUDIT</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 0' }}>
              Candidate Applications Monitor
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
              Real-time progression tracking across hiring pipelines.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <th style={{ padding: '12px' }}>CANDIDATE</th>
                  <th style={{ padding: '12px' }}>TARGET JOB</th>
                  <th style={{ padding: '12px' }}>COMPANY</th>
                  <th style={{ padding: '12px' }}>PIPELINE STATUS</th>
                  <th style={{ padding: '12px' }}>DATE APPLIED</th>
                  <th style={{ padding: '12px' }}>RESUME</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No applications recorded yet.
                    </td>
                  </tr>
                ) : (
                  applications.map(app => (
                    <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{app.candidate_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{app.candidate_email}</div>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{app.job_title}</td>
                      <td style={{ padding: '12px', color: 'var(--primary)', fontWeight: 600 }}>{app.company_name}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem', 
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          background: app.status === 'selected' ? '#d1fae5' : app.status === 'interview' ? '#ede9fe' : app.status === 'shortlisted' ? '#e0f2fe' : '#f1f5f9',
                          color: app.status === 'selected' ? '#065f46' : app.status === 'interview' ? '#6d28d9' : app.status === 'shortlisted' ? '#0369a1' : '#334155'
                        }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {app.resume_url ? (
                          <a href={app.resume_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                            <FileText size={14} /> View File
                          </a>
                        ) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          CATEGORIES (Job Categories, Skills, Locations)
          ======================================================== */}
      {activeTab === 'categories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Categories Manager */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
              <div>
                <span style={{ color: '#059669', fontSize: '0.78rem', fontWeight: 800 }}>MASTER CATALOG</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 0' }}>
                  Job Categories Catalog
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
                  Manage sectors displayed on the public landing page and search filters.
                </p>
              </div>

              {/* Add category form */}
              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="New category name..."
                  className="form-control"
                  style={{ width: '220px' }}
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  disabled={catSaving} 
                  className="btn btn-primary"
                  style={{ backgroundColor: '#059669', borderColor: '#059669', whiteSpace: 'nowrap' }}>
                  {catSaving ? 'Adding...' : '+ Add Category'}
                </button>
              </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
              {(categoriesData.categories || []).map(cat => (
                <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{cat.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.jobs_count || 0} active jobs</div>
                  </div>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    title="Remove Category"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Skills & Locations Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Skills */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Code2 size={18} color="#059669" /> In-Demand Skills Catalog
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['React', 'Node.js', 'Python', 'SQL / TiDB', 'AWS', 'TypeScript', 'Docker', 'GraphQL', 'Tailwind', 'REST APIs', 'DevOps'].map(s => (
                  <span key={s} style={{ background: 'var(--bg-subtle)', color: 'var(--text-main)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid var(--border-color)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={18} color="#059669" /> Hiring Locations Master
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Bangalore, India', 'Chennai, India', 'Hyderabad, India', 'Mumbai, India', 'Pune, India', 'Delhi NCR', 'Remote (Worldwide)'].map(loc => (
                  <span key={loc} style={{ background: 'var(--bg-subtle)', color: 'var(--text-main)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid var(--border-color)' }}>
                    📍 {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          REPORTS (Visual Intelligence: Users, Jobs, Applications)
          ======================================================== */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <span style={{ color: '#059669', fontSize: '0.78rem', fontWeight: 800 }}>BUSINESS INTELLIGENCE</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 0' }}>
                Platform Analytics & Reports
              </h2>
            </div>

            <button 
              onClick={handleExportCSV}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <Download size={16} /> Export CSV Summary
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* Jobs Distribution by Sector */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
                Jobs by Industry Sector
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(analytics?.jobsByCategory || []).map(cat => {
                  const max = Math.max(...(analytics?.jobsByCategory || []).map(c => c.count), 1);
                  const pct = Math.round((cat.count / max) * 100);
                  return (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                        <span>{cat.category}</span>
                        <span>{cat.count} listings</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--bg-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(pct, 15)}%`, height: '100%', background: '#059669', borderRadius: '6px' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Applications Funnel */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
                Candidate Pipeline Conversion Funnel
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['applied', 'viewed', 'shortlisted', 'interview', 'selected'].map(stage => {
                  const match = (analytics?.appsByStatus || []).find(a => a.status === stage);
                  const count = match ? match.count : 0;
                  return (
                    <div key={stage}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-main)', marginBottom: '4px' }}>
                        <span>{stage}</span>
                        <span>{count} candidates</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--bg-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, Math.max(count * 25, 12))}%`, height: '100%', background: '#6366f1', borderRadius: '6px' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SETTINGS (Platform Rules, Configuration)
          ======================================================== */}
      {activeTab === 'settings' && (
        <div className="card" style={{ padding: '28px', maxWidth: '800px' }}>
          <div style={{ marginBottom: '24px' }}>
            <span style={{ color: '#059669', fontSize: '0.78rem', fontWeight: 800 }}>GOVERNANCE RULES</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 0' }}>
              Platform Rules & Configuration
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
              Enforce system-wide policies stored persistently in TiDB Cloud.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <div>
                <strong style={{ color: 'var(--text-main)', display: 'block' }}>Mandatory Job Moderation</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Require Admin approval before any recruiter job posting becomes public</span>
              </div>
              <input 
                type="checkbox" 
                checked={settings.require_admin_approval}
                onChange={(e) => setSettings({ ...settings, require_admin_approval: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <div>
                <strong style={{ color: 'var(--text-main)', display: 'block' }}>Allow Candidate Registration</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Permit public visitors to sign up as job seekers</span>
              </div>
              <input 
                type="checkbox" 
                checked={settings.allow_candidate_registration}
                onChange={(e) => setSettings({ ...settings, allow_candidate_registration: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <div>
                <strong style={{ color: 'var(--text-main)', display: 'block' }}>Allow Recruiter Registration</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Permit new hiring employers to create recruiter accounts</span>
              </div>
              <input 
                type="checkbox" 
                checked={settings.allow_recruiter_registration}
                onChange={(e) => setSettings({ ...settings, allow_recruiter_registration: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <label style={{ fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                Maximum Active Jobs Allowed per Recruiter
              </label>
              <input 
                type="number" 
                className="form-control"
                style={{ maxWidth: '180px' }}
                value={settings.max_jobs_per_recruiter}
                onChange={(e) => setSettings({ ...settings, max_jobs_per_recruiter: parseInt(e.target.value, 10) || 50 })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <div>
                <strong style={{ color: 'var(--text-main)', display: 'block' }}>Platform Maintenance Mode</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Temporarily restrict candidate job applications for system maintenance</span>
              </div>
              <input 
                type="checkbox" 
                checked={settings.maintenance_mode}
                onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={settingsSaving} 
              className="btn btn-primary"
              style={{ backgroundColor: '#059669', borderColor: '#059669', padding: '12px', fontWeight: 800, alignSelf: 'flex-start' }}>
              {settingsSaving ? 'Saving...' : '💾 Save Platform Rules'}
            </button>
          </form>
        </div>
      )}

      {/* Modal: Add/Edit Company (In A04) */}
      {showCompanyModal && (
        <div className="modal-overlay" onClick={() => setShowCompanyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {editingCompany ? 'Edit Company' : 'Add Verified Company'}
              </h3>
              <button onClick={() => setShowCompanyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={companyForm.location}
                    onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Website</label>
                <input 
                  type="url" 
                  className="form-control"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Logo URL</label>
                <input 
                  type="url" 
                  className="form-control"
                  value={companyForm.logo_url}
                  onChange={(e) => setCompanyForm({ ...companyForm, logo_url: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">About</label>
                <textarea 
                  rows={3}
                  className="form-control"
                  value={companyForm.about}
                  onChange={(e) => setCompanyForm({ ...companyForm, about: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowCompanyModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={companySaving} className="btn btn-primary" style={{ flex: 1.5, backgroundColor: '#059669', borderColor: '#059669' }}>
                  {companySaving ? 'Saving...' : 'Save Company'}
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
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
              Provide constructive feedback to {rejectModalJob.company_name} so they can update and resubmit.
            </p>

            <div className="form-group">
              <label className="form-label">Rejection Reason / Guidance</label>
              <textarea 
                className="form-control"
                rows={3}
                placeholder="e.g. Please clarify required years of experience and salary details."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="button" onClick={() => setRejectModalJob(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button 
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
