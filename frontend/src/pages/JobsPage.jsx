import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, Briefcase, Building2, SlidersHorizontal, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function JobsPage({ initialFilter = {}, onViewJob }) {
  const { savedJobIds = [], toggleSaveJob } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [keyword, setKeyword] = useState(initialFilter.keyword || '');
  const [location, setLocation] = useState(initialFilter.location || '');
  const [category, setCategory] = useState(initialFilter.category || 'All');
  const [jobType, setJobType] = useState('All');
  const [experience, setExperience] = useState('All');
  const [sort, setSort] = useState('newest');

  const categories = [
    'All',
    'Software Development',
    'Design & Creative',
    'Data & AI',
    'Sales & Marketing',
    'Product Management',
    'Finance & Accounts',
    'Customer Support'
  ];

  const jobTypes = ['All', 'Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'];
  const experienceLevels = ['All', '0-1 Years', '1-3 Years', '3-5 Years', '5+ Years'];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        keyword,
        location,
        category,
        job_type: jobType,
        experience,
        sort,
        page,
        limit: 8
      });

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [category, jobType, experience, sort, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setLocation('');
    setCategory('All');
    setJobType('All');
    setExperience('All');
    setSort('newest');
    setPage(1);
  };

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="container-responsive" style={{ maxWidth: '1280px', margin: '20px auto 80px', padding: '0 20px' }}>
      {/* Search Header Banner */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff' }}>
        <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '14px' }}>
          Find Your Perfect Career Opportunity
        </h1>
        <form onSubmit={handleSearchSubmit} className="search-form-responsive" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ flex: '1.5', minWidth: '200px', display: 'flex', alignItems: 'center', padding: '8px 14px', gap: '10px', background: '#fff', borderRadius: '8px', color: '#0f172a' }}>
            <Search size={18} color="#64748b" />
            <input 
              id="jobs-keyword-filter"
              type="text" 
              placeholder="Title, skills, or company..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ flex: '1', minWidth: '160px', display: 'flex', alignItems: 'center', padding: '8px 14px', gap: '10px', background: '#fff', borderRadius: '8px', color: '#0f172a' }}>
            <MapPin size={18} color="#64748b" />
            <input 
              id="jobs-location-filter"
              type="text" 
              placeholder="Location or remote..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>

          <button 
            id="jobs-filter-search-btn"
            type="submit" 
            className="btn btn-primary" 
            style={{ minWidth: '120px' }}>
            Search
          </button>
        </form>
      </div>

      {/* Mobile Toggle Filters Button */}
      <div className="mobile-menu-btn" style={{ marginBottom: '14px' }}>
        <button 
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'space-between', padding: '10px 16px', fontWeight: 700 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={18} color="var(--primary)" /> {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </span>
          <span className="badge badge-applied">{category !== 'All' || jobType !== 'All' ? 'Filtered' : 'All'}</span>
        </button>
      </div>

      {/* Main Layout: Filters Sidebar + Job Listings */}
      <div className="jobs-page-grid">
        {/* Sidebar Filters */}
        <aside 
          className="card" 
          style={{ 
            padding: '20px', 
            display: typeof window !== 'undefined' && window.innerWidth <= 860 && !showMobileFilters ? 'none' : 'block' 
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1rem' }}>
              <SlidersHorizontal size={18} color="var(--primary)" /> Filters
            </div>
            <button 
              onClick={handleResetFilters}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
              Reset All
            </button>
          </div>

          {/* Category */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>

              Category
            </label>
            <select 
              className="form-control"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Job Type */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
              Job Type
            </label>
            <select 
              className="form-control"
              value={jobType}
              onChange={(e) => { setJobType(e.target.value); setPage(1); }}>
              {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Experience Level */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
              Experience Level
            </label>
            <select 
              className="form-control"
              value={experience}
              onChange={(e) => { setExperience(e.target.value); setPage(1); }}>
              {experienceLevels.map(exp => <option key={exp} value={exp}>{exp}</option>)}
            </select>
          </div>
        </aside>

        {/* Listings Content */}
        <main>
          {/* Top Sort Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.95rem', color: '#64748b' }}>
              Showing <strong style={{ color: '#0f172a' }}>{jobs.length}</strong> of <strong style={{ color: '#0f172a' }}>{total}</strong> verified jobs
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Sort By:</span>
              <select 
                className="form-control" 
                style={{ width: 'auto', padding: '6px 12px' }}
                value={sort}
                onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Most Recent</option>
                <option value="salary_high">Salary: High to Low</option>
                <option value="salary_low">Salary: Low to High</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Job Cards */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              Loading jobs from TiDB Cloud...
            </div>
          ) : jobs.length === 0 ? (
            <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Briefcase size={44} color="#94a3b8" style={{ margin: '0 auto 14px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>No jobs match your search</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
                Try adjusting your search criteria or resetting filters.
              </p>
              <button onClick={handleResetFilters} className="btn btn-outline btn-sm" style={{ marginTop: '16px' }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {jobs.map((job) => (
                <div 
                  key={job.id} 
                  className="card card-interactive"
                  style={{ padding: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1, minWidth: '280px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#f8fafc', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {job.company_logo ? (
                        <img src={job.company_logo} alt={job.company_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Building2 size={24} color="#64748b" />
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{job.company_name}</span>
                        <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>Approved</span>
                      </div>

                      <h2 
                        onClick={() => onViewJob(job.id)}
                        style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', cursor: 'pointer', transition: 'color 0.15s' }}>
                        {job.title}
                      </h2>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px', fontSize: '0.82rem', color: '#64748b' }}>
                        <span>📍 {job.location}</span>
                        <span>⏱ {job.job_type}</span>
                        <span>🎓 {job.experience_level}</span>
                        <span style={{ color: '#059669', fontWeight: 700 }}>
                          ₹{(job.salary_min / 100000).toFixed(1)}L - ₹{(job.salary_max / 100000).toFixed(1)}L PA
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveJob(job.id);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 10px', color: savedJobIds.includes(job.id) ? '#ef4444' : 'var(--text-muted)' }}
                      title={savedJobIds.includes(job.id) ? 'Remove from Saved' : 'Save Job'}>
                      <Heart size={16} fill={savedJobIds.includes(job.id) ? '#ef4444' : 'none'} color={savedJobIds.includes(job.id) ? '#ef4444' : 'currentColor'} />
                    </button>
                    <button 
                      id={`view-job-btn-${job.id}`}
                      onClick={() => onViewJob(job.id)} 
                      className="btn btn-outline btn-sm">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '30px' }}>
              <button 
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="btn btn-secondary btn-sm">
                <ChevronLeft size={16} /> Prev
              </button>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                Page {page} of {totalPages}
              </span>
              <button 
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="btn btn-secondary btn-sm">
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
