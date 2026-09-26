import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, PlusCircle, Users, Briefcase, CheckCircle2, Clock, XCircle, Calendar, ExternalLink, ArrowRight, Eye } from 'lucide-react';

export function RecruiterDashboard({ onViewJob }) {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs', 'post-job', 'applicants', 'company'
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Selected applicant for interview modal
  const [interviewModalApp, setInterviewModalApp] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  // Post Job form state
  const [jobForm, setJobForm] = useState({
    title: '',
    category: 'Software Development',
    job_type: 'Full-time',
    experience_level: '1-3 Years',
    location: '',
    salary_min: '',
    salary_max: '',
    description: '',
    requirements: '',
    skills: ''
  });

  // Company Profile form state
  const [companyForm, setCompanyForm] = useState({
    company_name: '',
    company_logo: '',
    company_about: '',
    website: '',
    industry: '',
    location: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Recruiter Jobs
      const jobsRes = await fetch('/api/jobs/recruiter/my-jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const jobsData = await jobsRes.json();
      setJobs(Array.isArray(jobsData) ? jobsData : []);

      // 2. All Applicants
      const appsRes = await fetch('/api/applications/recruiter/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const appsData = await appsRes.json();
      setApplicants(Array.isArray(appsData) ? appsData : []);

      // 3. Company Profile
      const profRes = await fetch('/api/profile/recruiter', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profData = await profRes.json();
      if (profData && !profData.error) {
        setCompanyProfile(profData);
        setCompanyForm({
          company_name: profData.company_name || '',
          company_logo: profData.company_logo || '',
          company_about: profData.company_about || '',
          website: profData.website || '',
          industry: profData.industry || '',
          location: profData.location || ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // Handle Post Job (Draft or Submit for Approval)
  const handlePostJob = async (isDraft = false) => {
    if (!jobForm.title || !jobForm.location || !jobForm.description) {
      alert('Please fill in Job Title, Location, and Description.');
      return;
    }

    try {
      const skillsArray = jobForm.skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...jobForm,
          skills: skillsArray,
          is_draft: isDraft
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(data.message);
      // Reset form & go to jobs tab
      setJobForm({
        title: '',
        category: 'Software Development',
        job_type: 'Full-time',
        experience_level: '1-3 Years',
        location: '',
        salary_min: '',
        salary_max: '',
        description: '',
        requirements: '',
        skills: ''
      });
      setActiveTab('jobs');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to post job.');
    }
  };

  // Update Applicant Status (Shortlist, Reject, Select)
  const handleUpdateStatus = async (appId, newStatus, extra = {}) => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, ...extra })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(`Candidate status changed to: ${newStatus}`);
      if (interviewModalApp) setInterviewModalApp(null);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  // Save Company Profile
  const handleSaveCompany = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile/recruiter', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(companyForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage('Company details updated successfully!');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update company');
    }
  };

  const totalShortlisted = applicants.filter(a => a.status === 'shortlisted' || a.status === 'interview' || a.status === 'selected').length;

  return (
    <div style={{ maxWidth: '1280px', margin: '30px auto 80px', padding: '0 24px' }}>
      {/* Top Banner with Stats */}
      <div className="card" style={{ padding: '28px', marginBottom: '28px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#a5b4fc', fontWeight: 600 }}>RECRUITER & HIRING PORTAL</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '2px', fontFamily: 'var(--font-display)' }}>
              {companyProfile?.company_name || 'Your Company Workspace'}
            </h1>
            <p style={{ color: '#c7d2fe', fontSize: '0.95rem', marginTop: '4px' }}>
              Post jobs, track admin approvals, and manage candidate hiring pipelines.
            </p>
          </div>

          <button 
            id="post-new-job-btn"
            onClick={() => setActiveTab('post-job')} 
            className="btn btn-primary"
            style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '12px 22px' }}>
            <PlusCircle size={18} /> Post New Job
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Total Jobs Created</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{jobs.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Approved & Live Jobs</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>
              {jobs.filter(j => j.status === 'approved').length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Pending Admin Approval</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24' }}>
              {jobs.filter(j => j.status === 'pending').length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Total Applicants</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{applicants.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Shortlisted / In Process</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a78bfa' }}>{totalShortlisted}</div>
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
          id="tab-recruiter-jobs-btn"
          onClick={() => setActiveTab('jobs')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            color: activeTab === 'jobs' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'jobs' ? '3px solid var(--primary)' : '3px solid transparent'
          }}>
          My Posted Jobs ({jobs.length})
        </button>

        <button 
          id="tab-recruiter-applicants-btn"
          onClick={() => setActiveTab('applicants')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            color: activeTab === 'applicants' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'applicants' ? '3px solid var(--primary)' : '3px solid transparent'
          }}>
          Applicants & Hiring Pipeline ({applicants.length})
        </button>

        <button 
          id="tab-recruiter-post-btn"
          onClick={() => setActiveTab('post-job')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            color: activeTab === 'post-job' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'post-job' ? '3px solid var(--primary)' : '3px solid transparent'
          }}>
          Post a Job
        </button>

        <button 
          id="tab-recruiter-company-btn"
          onClick={() => setActiveTab('company')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            color: activeTab === 'company' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'company' ? '3px solid var(--primary)' : '3px solid transparent'
          }}>
          Company Profile
        </button>
      </div>

      {/* TAB 1: MY POSTED JOBS */}
      {activeTab === 'jobs' && (
        <div>
          {jobs.length === 0 ? (
            <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Briefcase size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No jobs created yet</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
                Post your first opening to receive qualified candidate applications.
              </p>
              <button onClick={() => setActiveTab('post-job')} className="btn btn-primary" style={{ marginTop: '16px' }}>
                Post a Job Now
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {jobs.map((job) => (
                <div key={job.id} className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`badge badge-${job.status}`}>
                          {job.status === 'pending' && '⏳ Pending Admin Approval'}
                          {job.status === 'approved' && '✅ Approved & Live on Portal'}
                          {job.status === 'rejected' && '❌ Rejected by Admin'}
                          {job.status === 'draft' && '📝 Draft'}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                          Created on {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
                        {job.title}
                      </h2>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px', fontSize: '0.85rem', color: '#64748b' }}>
                        <span>📂 {job.category}</span>
                        <span>📍 {job.location}</span>
                        <span>⏱ {job.job_type}</span>
                        <span>👥 <strong>{job.applicants_count || 0}</strong> Applicants</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {job.status === 'approved' && (
                        <button 
                          onClick={() => onViewJob(job.id)}
                          className="btn btn-outline btn-sm">
                          <Eye size={16} /> View Public Page
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rejection Notice if any */}
                  {job.status === 'rejected' && job.rejection_reason && (
                    <div style={{ marginTop: '14px', padding: '12px 16px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '0.88rem', color: '#991b1b' }}>
                      <strong>Admin Rejection Feedback:</strong> {job.rejection_reason}
                    </div>
                  )}

                  {/* Pending Notice (From PDF Page 2: Recruiter creates job -> Admin reviews -> Approved job becomes public) */}
                  {job.status === 'pending' && (
                    <div style={{ marginTop: '14px', padding: '10px 14px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '0.85rem', color: '#92400e' }}>
                      ℹ️ <strong>Workflow Rule:</strong> This job has been submitted to the platform admin. Once reviewed and approved, it will automatically show on the public job search and landing page.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: APPLICANTS & HIRING PIPELINE */}
      {activeTab === 'applicants' && (
        <div>
          {applicants.length === 0 ? (
            <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Users size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No applicants yet</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
                Once your approved jobs go live, candidate applications will show up here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {applicants.map((app) => (
                <div key={app.id} className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.8rem', background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                          {app.application_code}
                        </span>
                        <span className={`badge badge-${app.status}`}>
                          {app.status}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                        {app.candidate_name}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Applied for: <strong style={{ color: '#1e293b' }}>{app.job_title}</strong> &bull; {new Date(app.created_at).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                        Email: {app.candidate_email}
                      </div>
                    </div>

                    {/* Hiring Action Buttons (PDF Page 6: Shortlist, Interview, Select / Reject) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      {app.resume_url && (
                        <a 
                          href={app.resume_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-secondary btn-sm">
                          View Resume
                        </a>
                      )}

                      <button 
                        id={`shortlist-btn-${app.id}`}
                        onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                        disabled={app.status === 'shortlisted'}
                        className="btn btn-sm"
                        style={{ background: '#e0e7ff', color: '#3730a3', border: 'none' }}>
                        Shortlist
                      </button>

                      <button 
                        id={`interview-btn-${app.id}`}
                        onClick={() => {
                          setInterviewModalApp(app);
                          setInterviewDate(app.interview_date ? app.interview_date.slice(0, 16) : '');
                          setInterviewNotes(app.interview_notes || '');
                        }}
                        className="btn btn-sm"
                        style={{ background: '#ede9fe', color: '#5b21b6', border: 'none' }}>
                        <Calendar size={14} /> Schedule Interview
                      </button>

                      <button 
                        id={`select-btn-${app.id}`}
                        onClick={() => handleUpdateStatus(app.id, 'selected')}
                        className="btn btn-success btn-sm">
                        Hire / Select
                      </button>

                      <button 
                        id={`reject-btn-${app.id}`}
                        onClick={() => handleUpdateStatus(app.id, 'rejected')}
                        className="btn btn-danger btn-sm">
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* Interview details if present */}
                  {app.status === 'interview' && app.interview_date && (
                    <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f5f3ff', borderRadius: '8px', fontSize: '0.85rem', color: '#5b21b6' }}>
                      <strong>Scheduled Interview:</strong> {new Date(app.interview_date).toLocaleString()}
                      {app.interview_notes && ` | Notes: ${app.interview_notes}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: POST A JOB */}
      {activeTab === 'post-job' && (
        <div className="card" style={{ padding: '32px', maxWidth: '850px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              Create New Job Opening
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
              Fill in the job requirements. Jobs submitted for approval will be reviewed by the platform admin before publishing.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Job Title *</label>
              <input 
                id="post-job-title"
                type="text" 
                className="form-control"
                placeholder="e.g. Senior Frontend Developer"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-control"
                value={jobForm.category}
                onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}>
                <option value="Software Development">Software Development</option>
                <option value="Design & Creative">Design & Creative</option>
                <option value="Data & AI">Data & AI</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Product Management">Product Management</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Customer Support">Customer Support</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Job Type</label>
              <select 
                className="form-control"
                value={jobForm.job_type}
                onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Remote">Remote</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Experience Level</label>
              <select 
                className="form-control"
                value={jobForm.experience_level}
                onChange={(e) => setJobForm({ ...jobForm, experience_level: e.target.value })}>
                <option value="0-1 Years">0-1 Years (Entry Level)</option>
                <option value="1-3 Years">1-3 Years (Junior / Mid)</option>
                <option value="3-5 Years">3-5 Years (Mid / Senior)</option>
                <option value="5+ Years">5+ Years (Lead / Principal)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Location *</label>
              <input 
                id="post-job-location"
                type="text" 
                className="form-control"
                placeholder="e.g. Bangalore, Remote, Chennai"
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Min Salary (INR per annum)</label>
              <input 
                type="number" 
                className="form-control"
                placeholder="e.g. 800000"
                value={jobForm.salary_min}
                onChange={(e) => setJobForm({ ...jobForm, salary_min: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Salary (INR per annum)</label>
              <input 
                type="number" 
                className="form-control"
                placeholder="e.g. 1500000"
                value={jobForm.salary_max}
                onChange={(e) => setJobForm({ ...jobForm, salary_max: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Skills (comma separated)</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="e.g. React, Node.js, Express, TiDB, Docker"
                value={jobForm.skills}
                onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Job Description *</label>
              <textarea 
                id="post-job-description"
                className="form-control"
                rows={4}
                placeholder="Describe role responsibilities, team environment..."
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Requirements & Qualifications</label>
              <textarea 
                className="form-control"
                rows={3}
                placeholder="List required experience, degrees, certifications..."
                value={jobForm.requirements}
                onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <button 
              id="save-job-draft-btn"
              type="button" 
              onClick={() => handlePostJob(true)}
              className="btn btn-secondary">
              Save as Draft
            </button>
            <button 
              id="submit-job-approval-btn"
              type="button" 
              onClick={() => handlePostJob(false)}
              className="btn btn-primary" style={{ flex: 1 }}>
              Submit for Admin Approval
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: COMPANY PROFILE */}
      {activeTab === 'company' && (
        <div className="card" style={{ padding: '32px', maxWidth: '750px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px' }}>Company Details & Branding</h2>
          <form onSubmit={handleSaveCompany}>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input 
                type="text" 
                className="form-control"
                value={companyForm.company_name}
                onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company Logo URL</label>
              <input 
                type="url" 
                className="form-control"
                placeholder="https://images.unsplash.com/..."
                value={companyForm.company_logo}
                onChange={(e) => setCompanyForm({ ...companyForm, company_logo: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Website</label>
              <input 
                type="url" 
                className="form-control"
                placeholder="https://yourcompany.com"
                value={companyForm.website}
                onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Industry</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="e.g. Information Technology, Financial Services"
                value={companyForm.industry}
                onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">About Company</label>
              <textarea 
                className="form-control"
                rows={4}
                placeholder="Tell candidates about your company culture and mission..."
                value={companyForm.company_about}
                onChange={(e) => setCompanyForm({ ...companyForm, company_about: e.target.value })}
              />
            </div>

            <button 
              id="save-company-btn"
              type="submit" 
              className="btn btn-primary" style={{ marginTop: '10px' }}>
              Save Company Profile
            </button>
          </form>
        </div>
      )}

      {/* Interview Scheduling Modal */}
      {interviewModalApp && (
        <div className="modal-overlay" onClick={() => setInterviewModalApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>
              Schedule Interview
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '18px' }}>
              Candidate: <strong>{interviewModalApp.candidate_name}</strong> for {interviewModalApp.job_title}
            </p>

            <div className="form-group">
              <label className="form-label">Interview Date & Time</label>
              <input 
                id="interview-date-input"
                type="datetime-local" 
                className="form-control"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Interview Notes / Video Link</label>
              <textarea 
                id="interview-notes-input"
                className="form-control"
                placeholder="Add Google Meet link, interview format, or agenda..."
                rows={3}
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                type="button" 
                onClick={() => setInterviewModalApp(null)} 
                className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button 
                id="confirm-schedule-interview-btn"
                type="button" 
                onClick={() => handleUpdateStatus(interviewModalApp.id, 'interview', { interview_date: interviewDate, interview_notes: interviewNotes })}
                className="btn btn-primary" style={{ flex: 1.5 }}>
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
