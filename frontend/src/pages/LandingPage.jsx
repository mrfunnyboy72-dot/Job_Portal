import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, TrendingUp, Building2, Shield, ArrowRight, Star, Clock, CheckCircle, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LandingPage({ onSearch, onViewJob, openAuthModal, setActivePage }) {
  const { user, role, savedJobIds = [], toggleSaveJob } = useAuth();
  const [categories, setCategories] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetch('/api/jobs/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    fetch('/api/jobs/featured')
      .then(res => res.json())
      .then(data => setFeaturedJobs(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    fetch('/api/companies')
      .then(res => res.json())
      .then(data => setCompanies(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch({ keyword, location });
  };

  const handleCategoryClick = (catName) => {
    onSearch({ category: catName });
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
        padding: '70px 24px 80px',
        textAlign: 'center',
        borderBottom: '1px solid var(--border-color)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow decorative blur */}
        <div style={{
          position: 'absolute',
          top: '-120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, rgba(14, 165, 233, 0.05) 50%, transparent 70%)',
          pointerEvents: 'none'
        }}></div>

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#e0e7ff', color: '#4338ca', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '20px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4338ca' }}></span>
            Next-Gen Job Portal with Verified Admin Moderation
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 800, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.03em', fontFamily: 'var(--font-display)' }}>
            Discover Your Next Career Step or <span style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hire Top Talent</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#64748b', marginTop: '16px', maxWidth: '640px', margin: '16px auto 36px' }}>
            Connect verified recruiters with top candidates. Full application tracking, direct interviews, and strict admin quality approvals.
          </p>

          {/* Search Bar Form */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="card"
            style={{
              maxWidth: '820px',
              margin: '0 auto',
              padding: '10px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              boxShadow: 'var(--shadow-xl)',
              borderRadius: 'var(--radius-lg)'
            }}>
            <div style={{ flex: '1.5', minWidth: '220px', display: 'flex', alignItems: 'center', padding: '8px 14px', gap: '10px', background: '#f8fafc', borderRadius: '10px' }}>
              <Search size={20} color="#64748b" />
              <input 
                id="search-keyword-input"
                type="text" 
                placeholder="Job title, keywords, or company..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ flex: '1', minWidth: '180px', display: 'flex', alignItems: 'center', padding: '8px 14px', gap: '10px', background: '#f8fafc', borderRadius: '10px' }}>
              <MapPin size={20} color="#64748b" />
              <input 
                id="search-location-input"
                type="text" 
                placeholder="City, region, or remote..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.95rem' }}
              />
            </div>

            <button 
              id="search-submit-btn"
              type="submit" 
              className="btn btn-primary btn-lg" 
              style={{ minWidth: '140px', gap: '8px' }}>
              Search Jobs
            </button>
          </form>

          {/* Quick Trending tags */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '20px', fontSize: '0.85rem', color: '#64748b' }}>
            <span>Popular:</span>
            {['React Developer', 'Full Stack', 'UI/UX Designer', 'DevOps', 'Remote'].map((tag) => (
              <button 
                key={tag} 
                onClick={() => onSearch({ keyword: tag })}
                style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.8rem', color: '#334155', cursor: 'pointer' }}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section style={{ maxWidth: '1280px', margin: '60px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
          <div>
            <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Explore Categories
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '4px', fontFamily: 'var(--font-display)' }}>
              Browse by Industry
            </h2>
          </div>
          <button 
            onClick={() => onSearch({})} 
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            View all jobs <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              onClick={() => handleCategoryClick(cat.name)}
              className="card card-interactive"
              style={{ padding: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                <Briefcase size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                  {cat.name}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  {cat.job_count} active {cat.job_count === 1 ? 'position' : 'positions'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section style={{ maxWidth: '1280px', margin: '70px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
          <div>
            <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Verified Listings
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '4px', fontFamily: 'var(--font-display)' }}>
              Featured Job Openings
            </h2>
          </div>
          <button 
            onClick={() => onSearch({})} 
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            Browse all jobs <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {featuredJobs.map((job) => (
            <div 
              key={job.id} 
              className="card card-interactive"
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#f1f5f9', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {job.company_logo ? (
                        <img src={job.company_logo} alt={job.company_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Building2 size={24} color="#64748b" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{job.company_name}</div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                        {job.title}
                      </h3>
                    </div>
                  </div>
                  <span className="badge badge-approved">
                    Verified
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '14px 0' }}>
                  <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                    {job.job_type}
                  </span>
                  <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                    {job.experience_level}
                  </span>
                  <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                    📍 {job.location}
                  </span>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#64748b', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '18px' }}>
                  {job.description}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Salary Range</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    ₹{(job.salary_min / 100000).toFixed(1)}L - ₹{(job.salary_max / 100000).toFixed(1)}L / yr
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
                    onClick={() => onViewJob(job.id)} 
                    className="btn btn-outline btn-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Verified Companies Section (Managed Exclusively by Platform Admin) */}
      {companies.length > 0 && (
        <section style={{ maxWidth: '1280px', margin: '70px auto 0', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '0.85rem', fontWeight: 700 }}>
                <Building2 size={16} /> VERIFIED EMPLOYERS
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px', fontFamily: 'var(--font-display)' }}>
                Top Companies Hiring on WorkPulse
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '2px' }}>
                Pre-screened and certified by platform administration
              </p>
            </div>
            <button 
              onClick={() => onSearch({})}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              Explore all openings <ArrowRight size={15} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px' }}>
            {companies.map(comp => (
              <div 
                key={comp.id}
                onClick={() => onSearch({ keyword: comp.name })}
                className="card card-interactive"
                style={{ padding: '22px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img 
                    src={comp.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80'} 
                    alt={comp.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80';
                    }}
                    style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-color)', marginBottom: '14px' }}
                  />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px' }}>
                    {comp.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                    {comp.industry || 'Technology'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    📍 {comp.location || 'India'}
                  </div>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', width: '100%' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', background: 'rgba(5, 150, 105, 0.1)', padding: '3px 10px', borderRadius: '9999px' }}>
                    {comp.active_jobs_count || comp.jobs_count || 0} Open Roles
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Master 3-Role Workflow Card (From PDF Page 2 & Page 10) */}
      <section style={{ maxWidth: '1280px', margin: '80px auto 0', padding: '0 24px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#fff', padding: '40px 32px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 36px' }}>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: '#38bdf8', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700 }}>
              ENTERPRISE APPLICATION WORKFLOW
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', fontFamily: 'var(--font-display)' }}>
              How The Platform Works
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '6px' }}>
              Connected end-to-end between Candidate, Recruiter, and Admin review.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Candidate Box */}
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Briefcase size={20} color="#fff" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Candidate</h3>
              <ul style={{ color: '#cbd5e1', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '18px' }}>
                <li>Search & filter approved jobs</li>
                <li>Upload resume & direct apply</li>
                <li>Track live status (Applied ➔ Viewed ➔ Shortlisted ➔ Interview ➔ Offer)</li>
              </ul>
            </div>

            {/* Recruiter Box */}
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Building2 size={20} color="#fff" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Recruiter</h3>
              <ul style={{ color: '#cbd5e1', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '18px' }}>
                <li>Create company profile & post jobs</li>
                <li>Jobs submit to Admin for verification</li>
                <li>Review candidate resumes & schedule interviews</li>
              </ul>
            </div>

            {/* Admin Box */}
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Shield size={20} color="#fff" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Admin Moderation</h3>
              <ul style={{ color: '#cbd5e1', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '18px' }}>
                <li><strong>Critical Business Rule:</strong> Approves pending jobs before they go live</li>
                <li>Monitors platform applications & users</li>
                <li>Blocks spam or unauthorized activity</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
