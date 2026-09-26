import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, Users, Briefcase, FileText, 
  Search, Check, X, BarChart2, Building2, Plus, Edit, 
  Trash2, MapPin, Settings, Download, UserCheck, UserX, Clock, Tag, Code2,
  CheckCircle, Database, Filter, ChevronRight
} from 'lucide-react';

export function AdminDashboard() {
  const { token } = useAuth();
  
  // Primary Tabs strictly following user flow:
  // DASHBOARD, USERS, JOBS, APPLICATIONS, CATEGORIES, REPORTS, SETTINGS
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
    maintenance_mode: false,
    support_email: 'admin@workpulse.com'
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // USERS state: 'all' | 'candidate' | 'recruiter'
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  // JOBS state: 'pending' | 'approved' | 'rejected' | 'all' | 'companies'
  const [jobSubTab, setJobSubTab] = useState('pending');
  const [rejectModalJob, setRejectModalJob] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // APPLICATIONS state: status filter
  const [appStatusFilter, setAppStatusFilter] = useState('all');

  // CATEGORIES state: 'categories' | 'skills' | 'locations'
  const [catSubTab, setCatSubTab] = useState('categories');
  const [newCatName, setNewCatName] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [catSaving, setCatSaving] = useState(false);

  // REPORTS state: 'all' | 'users' | 'jobs' | 'applications'
  const [reportSubTab, setReportSubTab] = useState('all');

  // SETTINGS state
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Company Modal in Jobs tab
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
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Stats
      const statsRes = await fetch('/api/admin/stats', { headers });
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Pending Jobs
      const pendingRes = await fetch('/api/admin/pending-jobs', { headers });
      const pendingData = await pendingRes.json();
      setPendingJobs(Array.isArray(pendingData) ? pendingData : []);

      // 3. All Jobs
      const allJobsRes = await fetch('/api/admin/jobs', { headers });
      const allJobsData = await allJobsRes.json();
      setAllJobs(Array.isArray(allJobsData) ? allJobsData : []);

      // 4. Users
      const usersRes = await fetch('/api/admin/users', { headers });
      const usersData = await usersRes.json();
      setUsers(Array.isArray(usersData) ? usersData : []);

      // 5. Applications
      const appsRes = await fetch('/api/admin/applications', { headers });
      const appsData = await appsRes.json();
      setApplications(Array.isArray(appsData) ? appsData : []);

      // 6. Companies
      const compRes = await fetch('/api/admin/companies', { headers });
      const compData = await compRes.json();
      setCompanies(Array.isArray(compData) ? compData : []);

      // 7. Categories, Skills, Locations
      const catRes = await fetch('/api/admin/categories', { headers });
      const catData = await catRes.json();
      if (catData && !catData.error) setCategoriesData(catData);

      // 8. Analytics & Reports
      const anaRes = await fetch('/api/admin/analytics', { headers });
      const anaData = await anaRes.json();
      if (anaData && !anaData.error) setAnalytics(anaData);

      // 9. Platform Settings
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

  // JOBS: Moderate Job (Approve / Reject)
  const handleModerateJob = async (jobId, action, reasonText = '') => {
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, rejection_reason: reasonText })
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

  // USERS: Block / Unblock User
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

  // CATEGORIES: Add & Delete Category
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
    if (!confirm(`Are you sure you want to delete category '${name}'?`)) return;
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

  // SKILLS: Add & Delete Skill
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setCatSaving(true);
    try {
      const res = await fetch('/api/admin/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newSkillName.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      setNewSkillName('');
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to add skill');
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteSkill = async (skill) => {
    if (!confirm(`Are you sure you want to remove skill '${skill}'?`)) return;
    try {
      const res = await fetch(`/api/admin/skills/${encodeURIComponent(skill)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to remove skill');
    }
  };

  // LOCATIONS: Add & Delete Location
  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newLocationName.trim()) return;
    setCatSaving(true);
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newLocationName.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      setNewLocationName('');
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to add location');
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteLocation = async (location) => {
    if (!confirm(`Are you sure you want to remove location '${location}'?`)) return;
    try {
      const res = await fetch(`/api/admin/locations/${encodeURIComponent(location)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to remove location');
    }
  };

  // SETTINGS: Save Platform Rules & Config
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
      setMessage('Platform rules and configuration updated successfully!');
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  // COMPANIES Modal Save
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

  // Export CSV Reports
  const handleExportApplicationsCSV = () => {
    let csv = "ID,Candidate Name,Candidate Email,Target Job,Company,Status,Date Applied\n";
    applications.forEach(a => {
      csv += `"${a.application_code || a.id}","${a.candidate_name || ''}","${a.candidate_email || ''}","${a.job_title || ''}","${a.company_name || ''}","${a.status || ''}","${new Date(a.created_at).toLocaleDateString()}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applications_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handleExportFullReport = () => {
    let csv = "Metric,Value\n";
    csv += `Total Users,${stats?.totalUsers || 0}\n`;
    csv += `Candidates,${stats?.candidates || 0}\n`;
    csv += `Recruiters,${stats?.recruiters || 0}\n`;
    csv += `Total Jobs,${stats?.totalJobs || 0}\n`;
    csv += `Pending Jobs,${stats?.pendingJobs || 0}\n`;
    csv += `Approved Jobs,${stats?.approvedJobs || 0}\n`;
    csv += `Total Applications,${stats?.totalApplications || 0}\n`;
    csv += `Verified Companies,${companies.length}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `platform_executive_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Nav Tabs configuration matching exact user hierarchy
  const NAV_TABS = [
    { 
      id: 'dashboard', 
      label: 'DASHBOARD', 
      sub: '• Users • Recruiters • Jobs', 
      icon: ShieldCheck, 
      badge: null 
    },
    { 
      id: 'users', 
      label: 'USERS', 
      sub: '• Candidate • Recruiter • Block / unblock', 
      icon: Users, 
      badge: users.length 
    },
    { 
      id: 'jobs', 
      label: 'JOBS', 
      sub: '• Pending jobs • Approve • Reject', 
      icon: Briefcase, 
      badge: pendingJobs.length > 0 ? `${pendingJobs.length} Pending` : `${allJobs.length}` 
    },
    { 
      id: 'applications', 
      label: 'APPLICATIONS', 
      sub: '• Monitor • Status • Reports', 
      icon: FileText, 
      badge: applications.length 
    },
    { 
      id: 'categories', 
      label: 'CATEGORIES', 
      sub: '• Job categories • Skills • Locations', 
      icon: Tag, 
      badge: categoriesData.categories?.length || 0 
    },
    { 
      id: 'reports', 
      label: 'REPORTS', 
      sub: '• Users • Jobs • Applications', 
      icon: BarChart2, 
      badge: null 
    },
    { 
      id: 'settings', 
      label: 'SETTINGS', 
      sub: '• Platform rules • Configuration', 
      icon: Settings, 
      badge: null 
    },
  ];

  return (
    <div style={{ maxWidth: '1360px', margin: '16px auto 80px', padding: '0 24px' }}>
      
      {/* Toast Notification message */}
      {message && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 18px', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(16,185,129,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} color="#059669" />
            <span style={{ fontWeight: 600 }}>{message}</span>
          </div>
          <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Admin Navigation Tabs (Exact user flow) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', 
        gap: '8px', 
        background: '#0f172a', 
        padding: '10px', 
        borderRadius: '14px', 
        border: '1px solid #1e293b', 
        marginBottom: '26px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
      }}>
        {NAV_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '10px 14px',
                borderRadius: '10px',
                border: isActive ? '1px solid #10b981' : '1px solid transparent',
                cursor: 'pointer',
                background: isActive ? 'linear-gradient(135deg, rgba(5,150,105,0.25), rgba(16,185,129,0.15))' : 'transparent',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Icon size={16} color={isActive ? '#34d399' : '#94a3b8'} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isActive ? '#ffffff' : '#cbd5e1', letterSpacing: '0.02em' }}>
                    {tab.label}
                  </span>
                </div>
                {tab.badge !== null && (
                  <span style={{ 
                    background: isActive ? '#059669' : '#1e293b', 
                    color: '#fff', 
                    fontSize: '0.68rem', 
                    padding: '2px 6px', 
                    borderRadius: '9999px',
                    fontWeight: 700
                  }}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.68rem', color: isActive ? '#6ee7b7' : '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                {tab.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* Loading Progress Bar */}
      {loading && (
        <div style={{ height: '3px', width: '100%', background: 'linear-gradient(90deg, #10b981, #38bdf8, #10b981)', borderRadius: '2px', marginBottom: '16px', opacity: 0.8 }} />
      )}

      {/* ========================================================
          1. DASHBOARD
          • Users
          • Recruiters
          • Jobs
          ======================================================== */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Banner */}
          <div className="card" style={{ padding: '26px 28px', background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', color: '#fff', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '3px 10px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                  ADMIN EXECUTIVE CONSOLE
                </span>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', margin: 0, fontFamily: 'var(--font-display)' }}>
                  DASHBOARD
                </h1>
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.85rem', color: '#a7f3d0' }}>
                  <span>• Users</span>
                  <span>• Recruiters</span>
                  <span>• Jobs</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => { setActiveTab('jobs'); setJobSubTab('pending'); }}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#10b981', color: '#022c22', fontWeight: 800, border: 'none', padding: '10px 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} /> Review Pending Jobs ({pendingJobs.length})
                </button>
              </div>
            </div>

            {/* 3 Core Pillars: Users, Recruiters, Jobs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              
              {/* Pillar 1: Users */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '18px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Users size={18} color="#38bdf8" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e0f2fe' }}>• USERS</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
                  {stats?.candidates || 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                  Registered Candidates ({users.filter(u => u.role === 'candidate' && u.status === 'active').length} active)
                </div>
                <button 
                  onClick={() => { setActiveTab('users'); setUserRoleFilter('candidate'); }}
                  style={{ marginTop: '12px', background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Manage Candidates <ChevronRight size={14} />
                </button>
              </div>

              {/* Pillar 2: Recruiters */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '18px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Building2 size={18} color="#c084fc" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f3e8ff' }}>• RECRUITERS</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
                  {stats?.recruiters || 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                  Hiring Recruiters across {companies.length} Verified Companies
                </div>
                <button 
                  onClick={() => { setActiveTab('users'); setUserRoleFilter('recruiter'); }}
                  style={{ marginTop: '12px', background: 'none', border: 'none', color: '#c084fc', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Manage Recruiters <ChevronRight size={14} />
                </button>
              </div>

              {/* Pillar 3: Jobs */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '18px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Briefcase size={18} color="#34d399" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#d1fae5' }}>• JOBS</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
                    {stats?.approvedJobs || allJobs.filter(j => j.status === 'approved').length}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700 }}>
                    ({pendingJobs.length} Pending Approval)
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                  {stats?.totalJobs || allJobs.length} Total Job Postings created
                </div>
                <button 
                  onClick={() => { setActiveTab('jobs'); setJobSubTab('pending'); }}
                  style={{ marginTop: '12px', background: 'none', border: 'none', color: '#34d399', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Review Jobs Pipeline <ChevronRight size={14} />
                </button>
              </div>

            </div>
          </div>

          {/* Quick Pending Jobs Queue Preview */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Pending Job Moderation Queue ({pendingJobs.length})
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Recruiter jobs awaiting admin decision (Approve / Reject)
                </span>
              </div>
              <button 
                onClick={() => { setActiveTab('jobs'); setJobSubTab('pending'); }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem' }}>
                View All Jobs Queue &rarr;
              </button>
            </div>

            {pendingJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', background: 'var(--bg-subtle)', borderRadius: '10px' }}>
                <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 600 }}>All job submissions have been reviewed!</div>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>No pending moderation requests at this time.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingJobs.slice(0, 3).map(job => (
                  <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--bg-subtle)', borderRadius: '10px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{job.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Company: <strong style={{ color: 'var(--primary)' }}>{job.company_name}</strong> &bull; By: {job.recruiter_name} &bull; 📍 {job.location}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleModerateJob(job.id, 'approve')}
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: '#059669', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> Approve
                      </button>
                      <button 
                        onClick={() => { setRejectModalJob(job); setRejectReason(''); }}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#dc2626', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          2. USERS
          • Candidate
          • Recruiter
          • Block / unblock
          ======================================================== */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: '28px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '22px' }}>
            <div>
              <span style={{ color: '#059669', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                ACCESS CONTROL & GOVERNANCE
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 0' }}>
                USERS
              </h2>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>• Candidate</span>
                <span>• Recruiter</span>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>• Block / unblock</span>
              </div>
            </div>

            {/* Filter buttons & Search */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '8px', padding: '3px' }}>
                {[
                  { id: 'all', label: 'All Users' },
                  { id: 'candidate', label: '• Candidate' },
                  { id: 'recruiter', label: '• Recruiter' },
                ].map(r => (
                  <button 
                    key={r.id}
                    onClick={() => setUserRoleFilter(r.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: userRoleFilter === r.id ? '#059669' : 'transparent',
                      color: userRoleFilter === r.id ? '#fff' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}>
                    {r.label}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search by name or email..."
                  className="form-control"
                  style={{ paddingLeft: '32px', fontSize: '0.85rem', width: '220px' }}
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
                  <th style={{ padding: '12px 14px' }}>DETAILS</th>
                  <th style={{ padding: '12px 14px' }}>STATUS</th>
                  <th style={{ padding: '12px 14px' }}>REGISTERED</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>• BLOCK / UNBLOCK</th>
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
                      <td style={{ padding: '14px', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                        {u.role === 'recruiter' ? (
                          <span>🏢 {u.company_name || 'Hiring Employer'}</span>
                        ) : (
                          <span>🎓 {u.headline || 'Active Job Seeker'}</span>
                        )}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem', 
                          fontWeight: 700,
                          background: u.status === 'active' ? '#d1fae5' : '#fee2e2',
                          color: u.status === 'active' ? '#065f46' : '#991b1b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: u.status === 'active' ? '#10b981' : '#ef4444' }}></span>
                          {u.status === 'active' ? 'Active' : 'Blocked'}
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
                            style={{ color: '#dc2626', borderColor: '#fca5a5', padding: '5px 12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <UserX size={14} /> Block User
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleToggleUserStatus(u.id, u.status)}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: '#059669', borderColor: '#059669', padding: '5px 12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <UserCheck size={14} /> Unblock User
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
          3. JOBS
          • Pending jobs
          • Approve
          • Reject
          ======================================================== */}
      {activeTab === 'jobs' && (
        <div>
          {/* Sub Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                JOBS
              </h2>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>• Pending jobs</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>• Approve</span>
                <span style={{ color: '#dc2626', fontWeight: 700 }}>• Reject</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setJobSubTab('pending')}
                className={`btn ${jobSubTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ backgroundColor: jobSubTab === 'pending' ? '#059669' : '', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} /> • Pending jobs ({pendingJobs.length})
              </button>
              <button 
                onClick={() => setJobSubTab('approved')}
                className={`btn ${jobSubTab === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ backgroundColor: jobSubTab === 'approved' ? '#059669' : '', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={16} /> Approved Jobs ({allJobs.filter(j => j.status === 'approved').length})
              </button>
              <button 
                onClick={() => setJobSubTab('rejected')}
                className={`btn ${jobSubTab === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ backgroundColor: jobSubTab === 'rejected' ? '#059669' : '', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <X size={16} /> Rejected Jobs ({allJobs.filter(j => j.status === 'rejected').length})
              </button>
              <button 
                onClick={() => setJobSubTab('all')}
                className={`btn ${jobSubTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ backgroundColor: jobSubTab === 'all' ? '#059669' : '', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={16} /> All Jobs ({allJobs.length})
              </button>
              <button 
                onClick={() => setJobSubTab('companies')}
                className={`btn ${jobSubTab === 'companies' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ backgroundColor: jobSubTab === 'companies' ? '#059669' : '', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={16} /> Companies ({companies.length})
              </button>
            </div>
          </div>

          {/* SUB-VIEW 1: PENDING JOBS */}
          {jobSubTab === 'pending' && (
            <div>
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 18px', color: '#92400e', fontSize: '0.88rem', marginBottom: '20px' }}>
                ⚡ <strong>Job Moderation Rule:</strong> Recruiter job postings are kept in pending status until Admin explicitly approves or rejects them.
              </div>

              {pendingJobs.length === 0 ? (
                <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <CheckCircle size={44} color="#10b981" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Pending Jobs</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                    All submitted jobs have been reviewed and decided upon.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {pendingJobs.map(job => (
                    <div key={job.id} className="card" style={{ padding: '24px', borderLeft: '5px solid #f59e0b' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                        <div style={{ flex: 1, minWidth: '280px' }}>
                          <span className="badge badge-pending">Pending Review</span>
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

                        {/* Action Buttons: • Approve • Reject */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleModerateJob(job.id, 'approve')}
                            className="btn btn-primary"
                            style={{ backgroundColor: '#059669', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                            <Check size={16} /> • Approve
                          </button>
                          <button 
                            onClick={() => {
                              setRejectModalJob(job);
                              setRejectReason('');
                            }}
                            className="btn btn-secondary"
                            style={{ color: '#dc2626', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                            <X size={16} /> • Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 2: APPROVED JOBS */}
          {jobSubTab === 'approved' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
                Approved Public Job Postings
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      <th style={{ padding: '10px' }}>JOB TITLE</th>
                      <th style={{ padding: '10px' }}>COMPANY</th>
                      <th style={{ padding: '10px' }}>LOCATION</th>
                      <th style={{ padding: '10px' }}>TYPE</th>
                      <th style={{ padding: '10px' }}>STATUS</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allJobs.filter(j => j.status === 'approved').map(j => (
                      <tr key={j.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{j.title}</td>
                        <td style={{ padding: '12px', color: 'var(--primary)' }}>{j.company_name}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{j.location}</td>
                        <td style={{ padding: '12px' }}>{j.job_type}</td>
                        <td style={{ padding: '12px' }}>
                          <span className="badge badge-approved">Live & Approved</span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button 
                            onClick={() => { setRejectModalJob(j); setRejectReason('Removed from live status by admin.'); }}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#dc2626', borderColor: '#fca5a5', fontSize: '0.78rem' }}>
                            Revoke / Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-VIEW 3: REJECTED JOBS */}
          {jobSubTab === 'rejected' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
                Rejected Job Submissions
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      <th style={{ padding: '10px' }}>JOB TITLE</th>
                      <th style={{ padding: '10px' }}>COMPANY</th>
                      <th style={{ padding: '10px' }}>REJECTION REASON</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allJobs.filter(j => j.status === 'rejected').map(j => (
                      <tr key={j.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{j.title}</td>
                        <td style={{ padding: '12px', color: 'var(--primary)' }}>{j.company_name}</td>
                        <td style={{ padding: '12px', color: '#dc2626', fontSize: '0.85rem' }}>
                          {j.rejection_reason || 'Policy violation / incomplete description'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleModerateJob(j.id, 'approve')}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: '#059669', borderColor: '#059669', fontSize: '0.78rem' }}>
                            Re-Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-VIEW 4: ALL JOBS */}
          {jobSubTab === 'all' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
                All Platform Job Postings ({allJobs.length})
              </h3>
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
                        <td style={{ padding: '12px' }}>₹{(j.salary_min / 100000).toFixed(1)}L - ₹{(j.salary_max / 100000).toFixed(1)}L</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{new Date(j.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-VIEW 5: COMPANIES */}
          {jobSubTab === 'companies' && (
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Verified Companies Directory</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>Companies officially listed on the platform</p>
                </div>
                <button onClick={() => { setEditingCompany(null); setCompanyForm({ name: '', logo_url: '', website: '', industry: 'IT', location: 'India', about: '' }); setShowCompanyModal(true); }} className="btn btn-primary" style={{ backgroundColor: '#059669', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} /> Add Company
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {companies.map(c => (
                  <div key={c.id} style={{ background: 'var(--bg-subtle)', borderRadius: '10px', padding: '18px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{c.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{c.industry}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => { setEditingCompany(c); setCompanyForm(c); setShowCompanyModal(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                          <Edit size={15} color="var(--text-muted)" />
                        </button>
                        <button onClick={() => handleDeleteCompany(c.id, c.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                          <Trash2 size={15} color="#ef4444" />
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '10px' }}>
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
          4. APPLICATIONS
          • Monitor
          • Status
          • Reports
          ======================================================== */}
      {activeTab === 'applications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header & Sub-features */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ color: '#059669', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                  CANDIDATE LIFECYCLE TRACKER
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 0' }}>
                  APPLICATIONS
                </h2>
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: '#38bdf8', fontWeight: 700 }}>• Monitor</span>
                  <span style={{ color: '#c084fc', fontWeight: 700 }}>• Status</span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>• Reports</span>
                </div>
              </div>

              {/* Reports Export Button */}
              <button 
                onClick={handleExportApplicationsCSV}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                <Download size={16} /> • Export Applications Report (CSV)
              </button>
            </div>

            {/* Quick Metrics (Reports summary) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Submitted</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{applications.length}</div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shortlisted</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7' }}>
                  {applications.filter(a => a.status === 'shortlisted').length}
                </div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Interviews</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7c3aed' }}>
                  {applications.filter(a => a.status === 'interview').length}
                </div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Selected / Hired</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>
                  {applications.filter(a => a.status === 'selected').length}
                </div>
              </div>
            </div>

            {/* Status Filter Buttons */}
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Filter size={14} /> Filter Status:
              </span>
              {['all', 'applied', 'viewed', 'shortlisted', 'interview', 'selected', 'rejected'].map(st => (
                <button
                  key={st}
                  onClick={() => setAppStatusFilter(st)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: appStatusFilter === st ? '1px solid #059669' : '1px solid var(--border-color)',
                    background: appStatusFilter === st ? '#059669' : 'var(--bg-subtle)',
                    color: appStatusFilter === st ? '#fff' : 'var(--text-main)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}>
                  {st} ({st === 'all' ? applications.length : applications.filter(a => a.status === st).length})
                </button>
              ))}
            </div>
          </div>

          {/* Applications Monitor Table */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>
              • Live Applications Monitor ({applications.filter(a => appStatusFilter === 'all' || a.status === appStatusFilter).length})
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <th style={{ padding: '12px' }}>APPLICATION ID</th>
                    <th style={{ padding: '12px' }}>CANDIDATE</th>
                    <th style={{ padding: '12px' }}>TARGET JOB</th>
                    <th style={{ padding: '12px' }}>COMPANY</th>
                    <th style={{ padding: '12px' }}>• STATUS</th>
                    <th style={{ padding: '12px' }}>DATE APPLIED</th>
                    <th style={{ padding: '12px' }}>RESUME</th>
                  </tr>
                </thead>
                <tbody>
                  {applications
                    .filter(a => appStatusFilter === 'all' || a.status === appStatusFilter)
                    .map(app => (
                      <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {app.application_code || `APP-${app.id}`}
                        </td>
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
                            background: app.status === 'selected' ? '#d1fae5' : app.status === 'interview' ? '#ede9fe' : app.status === 'shortlisted' ? '#e0f2fe' : app.status === 'rejected' ? '#fee2e2' : '#f1f5f9',
                            color: app.status === 'selected' ? '#065f46' : app.status === 'interview' ? '#6d28d9' : app.status === 'shortlisted' ? '#0369a1' : app.status === 'rejected' ? '#991b1b' : '#334155'
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
                              <FileText size={14} /> Resume
                            </a>
                          ) : '—'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          5. CATEGORIES
          • Job categories
          • Skills
          • Locations
          ======================================================== */}
      {activeTab === 'categories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sub Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                CATEGORIES
              </h2>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span style={{ color: catSubTab === 'categories' ? '#059669' : '', fontWeight: 700 }}>• Job categories</span>
                <span style={{ color: catSubTab === 'skills' ? '#059669' : '', fontWeight: 700 }}>• Skills</span>
                <span style={{ color: catSubTab === 'locations' ? '#059669' : '', fontWeight: 700 }}>• Locations</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setCatSubTab('categories')}
                className={`btn ${catSubTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ backgroundColor: catSubTab === 'categories' ? '#059669' : '', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={16} /> • Job categories ({categoriesData.categories?.length || 0})
              </button>
              <button 
                onClick={() => setCatSubTab('skills')}
                className={`btn ${catSubTab === 'skills' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ backgroundColor: catSubTab === 'skills' ? '#059669' : '', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Code2 size={16} /> • Skills ({categoriesData.skills?.length || 0})
              </button>
              <button 
                onClick={() => setCatSubTab('locations')}
                className={`btn ${catSubTab === 'locations' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ backgroundColor: catSubTab === 'locations' ? '#059669' : '', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} /> • Locations ({categoriesData.locations?.length || 0})
              </button>
            </div>
          </div>

          {/* 1. Job categories */}
          {catSubTab === 'categories' && (
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>• Job Categories Master</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                    Sectors shown in landing page and recruiter job creation.
                  </p>
                </div>

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
                    style={{ backgroundColor: '#059669', borderColor: '#059669', whiteSpace: 'nowrap', fontWeight: 700 }}>
                    {catSaving ? 'Saving...' : '+ Add Category'}
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
          )}

          {/* 2. Skills */}
          {catSubTab === 'skills' && (
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>• Skills Master Catalog</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                    Standard skills recommended to candidates & recruiters.
                  </p>
                </div>

                <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="New skill (e.g., Kubernetes)..."
                    className="form-control"
                    style={{ width: '220px' }}
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={catSaving} 
                    className="btn btn-primary"
                    style={{ backgroundColor: '#059669', borderColor: '#059669', whiteSpace: 'nowrap', fontWeight: 700 }}>
                    {catSaving ? 'Saving...' : '+ Add Skill'}
                  </button>
                </form>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {(categoriesData.skills || []).map(skill => (
                  <div key={skill} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{skill}</span>
                    <button 
                      onClick={() => handleDeleteSkill(skill)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, display: 'flex', alignItems: 'center' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Locations */}
          {catSubTab === 'locations' && (
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>• Locations Master Catalog</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                    Operational hiring cities and remote work hubs.
                  </p>
                </div>

                <form onSubmit={handleAddLocation} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="New location (e.g., Kolkata)..."
                    className="form-control"
                    style={{ width: '220px' }}
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={catSaving} 
                    className="btn btn-primary"
                    style={{ backgroundColor: '#059669', borderColor: '#059669', whiteSpace: 'nowrap', fontWeight: 700 }}>
                    {catSaving ? 'Saving...' : '+ Add Location'}
                  </button>
                </form>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {(categoriesData.locations || []).map(loc => (
                  <div key={loc} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>📍 {loc}</span>
                    <button 
                      onClick={() => handleDeleteLocation(loc)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, display: 'flex', alignItems: 'center' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          6. REPORTS
          • Users
          • Jobs
          • Applications
          ======================================================== */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                REPORTS
              </h2>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>• Users</span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>• Jobs</span>
                <span style={{ color: '#34d399', fontWeight: 700 }}>• Applications</span>
              </div>
            </div>

            <button 
              onClick={handleExportFullReport}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
              <Download size={16} /> Export Executive Summary (CSV)
            </button>
          </div>

          {/* Sub Navigation */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'users', 'jobs', 'applications'].map(r => (
              <button 
                key={r}
                onClick={() => setReportSubTab(r)}
                className={`btn ${reportSubTab === r ? 'btn-primary' : 'btn-secondary'}`}
                style={{ backgroundColor: reportSubTab === r ? '#059669' : '', borderColor: '#059669', textTransform: 'capitalize', fontWeight: 700 }}>
                {r === 'all' ? 'All Reports' : `• ${r}`}
              </button>
            ))}
          </div>

          {/* 1. USERS REPORT */}
          {(reportSubTab === 'all' || reportSubTab === 'users') && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={18} color="#38bdf8" /> • Users Intelligence Report
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Platform Users</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                    {users.length}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Candidates Ratio</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                    {users.length > 0 ? Math.round((users.filter(u => u.role === 'candidate').length / users.length) * 100) : 0}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{users.filter(u => u.role === 'candidate').length} Candidates</div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Recruiters Ratio</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc', marginTop: '4px' }}>
                    {users.length > 0 ? Math.round((users.filter(u => u.role === 'recruiter').length / users.length) * 100) : 0}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{users.filter(u => u.role === 'recruiter').length} Recruiters</div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active vs Blocked</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    {users.filter(u => u.status === 'active').length} / {users.filter(u => u.status === 'blocked').length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active / Blocked accounts</div>
                </div>
              </div>
            </div>
          )}

          {/* 2. JOBS REPORT */}
          {(reportSubTab === 'all' || reportSubTab === 'jobs') && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={18} color="#fbbf24" /> • Jobs Distribution Report
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>Jobs by Industry Sector</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(analytics?.jobsByCategory || []).map(cat => {
                      const max = Math.max(...(analytics?.jobsByCategory || []).map(c => c.count), 1);
                      const pct = Math.round((cat.count / max) * 100);
                      return (
                        <div key={cat.category}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
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

                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>Approval & Moderation Metrics</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
                      <span>Live / Approved:</span>
                      <strong style={{ color: '#059669' }}>{allJobs.filter(j => j.status === 'approved').length}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
                      <span>Pending Moderation:</span>
                      <strong style={{ color: '#fbbf24' }}>{pendingJobs.length}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
                      <span>Rejected Submissions:</span>
                      <strong style={{ color: '#dc2626' }}>{allJobs.filter(j => j.status === 'rejected').length}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. APPLICATIONS REPORT */}
          {(reportSubTab === 'all' || reportSubTab === 'applications') && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={18} color="#34d399" /> • Applications Pipeline Funnel Report
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '700px' }}>
                {['applied', 'viewed', 'shortlisted', 'interview', 'selected'].map(stage => {
                  const match = (analytics?.appsByStatus || []).find(a => a.status === stage);
                  const count = match ? match.count : 0;
                  const total = applications.length || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={stage}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize', marginBottom: '4px' }}>
                        <span>{stage}</span>
                        <span>{count} candidates ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', background: 'var(--bg-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(pct, count > 0 ? 10 : 2)}%`, height: '100%', background: stage === 'selected' ? '#10b981' : stage === 'interview' ? '#8b5cf6' : stage === 'shortlisted' ? '#38bdf8' : '#64748b', borderRadius: '6px' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================
          7. SETTINGS
          • Platform rules
          • Configuration
          ======================================================== */}
      {activeTab === 'settings' && (
        <div className="card" style={{ padding: '28px', maxWidth: '840px' }}>
          <div style={{ marginBottom: '24px' }}>
            <span style={{ color: '#059669', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.04em' }}>
              SYSTEM GOVERNANCE
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 0' }}>
              SETTINGS
            </h2>
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>• Platform rules</span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>• Configuration</span>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Section 1: • Platform rules */}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={18} color="#059669" /> • Platform Rules
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-subtle)', borderRadius: '10px' }}>
                  <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: '0.92rem' }}>Mandatory Job Moderation</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Require Admin approval before any recruiter job posting becomes public</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.require_admin_approval}
                    onChange={(e) => setSettings({ ...settings, require_admin_approval: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#059669' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-subtle)', borderRadius: '10px' }}>
                  <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: '0.92rem' }}>Allow Candidate Registration</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Permit public visitors to register as job seekers</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.allow_candidate_registration}
                    onChange={(e) => setSettings({ ...settings, allow_candidate_registration: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#059669' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-subtle)', borderRadius: '10px' }}>
                  <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: '0.92rem' }}>Allow Recruiter Registration</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Permit hiring employers to register recruiter accounts</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.allow_recruiter_registration}
                    onChange={(e) => setSettings({ ...settings, allow_recruiter_registration: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#059669' }}
                  />
                </div>

                <div style={{ padding: '14px 16px', background: 'var(--bg-subtle)', borderRadius: '10px' }}>
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '6px', fontSize: '0.92rem' }}>
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
              </div>
            </div>

            {/* Section 2: • Configuration */}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Settings size={18} color="#38bdf8" /> • Configuration
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-subtle)', borderRadius: '10px' }}>
                  <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: '0.92rem' }}>Platform Maintenance Mode</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Temporarily restrict candidate job applications for system maintenance</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.maintenance_mode}
                    onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#ef4444' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-subtle)', borderRadius: '10px' }}>
                  <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: '0.92rem' }}>Enable Email Notification Alerts</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dispatch notifications on job status transitions</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.enable_email_alerts}
                    onChange={(e) => setSettings({ ...settings, enable_email_alerts: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#059669' }}
                  />
                </div>

                {/* Database Connection Telemetry */}
                <div style={{ padding: '14px 16px', background: 'var(--bg-subtle)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Database size={16} color="#059669" />
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.92rem' }}>Database Configuration (TiDB Cloud)</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Engine: <strong>TiDB Cloud Serverless (MySQL 8.0 Protocol)</strong><br />
                    Database: <code>job_portal</code> &bull; Port: <code>4000</code><br />
                    Encryption: <strong style={{ color: '#059669' }}>TLS 1.2 SSL Active</strong> &bull; Connection Pool: Healthy
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={settingsSaving} 
              className="btn btn-primary"
              style={{ backgroundColor: '#059669', borderColor: '#059669', padding: '12px 24px', fontWeight: 800, alignSelf: 'flex-start', borderRadius: '8px' }}>
              {settingsSaving ? 'Saving...' : '💾 Save Platform Rules & Configuration'}
            </button>
          </form>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px', color: '#dc2626' }}>
              Reject Job Posting
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Provide feedback for <strong>{rejectModalJob.title}</strong> by <strong>{rejectModalJob.company_name}</strong>.
            </p>
            <textarea 
              className="form-control"
              rows={4}
              placeholder="State why this job posting was rejected..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: '100%', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setRejectModalJob(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                onClick={() => handleModerateJob(rejectModalJob.id, 'reject', rejectReason)}
                className="btn btn-primary"
                style={{ backgroundColor: '#dc2626', borderColor: '#dc2626', fontWeight: 700 }}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Company Modal in Jobs */}
      {showCompanyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 16px' }}>
              {editingCompany ? 'Edit Company' : 'Add New Verified Company'}
            </h3>
            <form onSubmit={handleSaveCompany} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Company Name *</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Industry</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={companyForm.industry}
                  onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Location</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={companyForm.location}
                  onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Website</label>
                <input 
                  type="url" 
                  className="form-control"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowCompanyModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={companySaving} className="btn btn-primary" style={{ backgroundColor: '#059669', borderColor: '#059669' }}>
                  {companySaving ? 'Saving...' : 'Save Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
