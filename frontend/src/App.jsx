import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { RecruiterPortalPage } from './pages/RecruiterPortalPage';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { WorkflowMapPage } from './pages/WorkflowMapPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { Database, ShieldCheck, Heart, Map, Building2, Shield } from 'lucide-react';

const getInitialPage = () => {
  const path = window.location.pathname.toLowerCase();
  if (path === '/admin' || path.startsWith('/admin')) return 'admin';
  if (path === '/recruiter' || path.startsWith('/recruiter')) return 'recruiter-dash';
  if (path === '/workflow-map' || path.startsWith('/workflow-map')) return 'workflow-map';
  if (path === '/jobs' || path.startsWith('/jobs')) return 'jobs';
  if (path === '/applications' || path.startsWith('/candidate')) return 'candidate-dash';
  if (path === '/login' || path.startsWith('/login')) return 'login';
  if (path === '/register' || path.startsWith('/register')) return 'register';
  return 'landing';
};

function MainApp() {
  const { user, role } = useAuth();
  const [activePage, setActivePage] = useState(getInitialPage);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobsFilter, setJobsFilter] = useState({});

  // Open dedicated auth pages
  const openAuthModal = (mode = 'login') => {
    if (mode === 'register') {
      navigateTo('register', '/register');
    } else {
      navigateTo('login', '/login');
    }
  };

  // Synchronize browser history and URL pathname
  const navigateTo = (page, explicitPath) => {
    setActivePage(page);
    let targetPath = explicitPath;
    if (!targetPath) {
      if (page === 'admin') targetPath = '/admin';
      else if (page === 'recruiter-dash') targetPath = '/recruiter';
      else if (page === 'workflow-map') targetPath = '/workflow-map';
      else if (page === 'jobs') targetPath = '/jobs';
      else if (page === 'candidate-dash') targetPath = '/applications';
      else if (page === 'login') targetPath = '/login';
      else if (page === 'register') targetPath = '/register';
      else if (page === 'job-details') targetPath = selectedJobId ? `/job/${selectedJobId}` : '/job';
      else targetPath = '/';
    }

    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page }, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setActivePage(getInitialPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSearchFromLanding = (filters) => {
    setJobsFilter(filters);
    navigateTo('jobs', '/jobs');
  };

  const handleViewJob = (id) => {
    setSelectedJobId(id);
    navigateTo('job-details', `/job/${id}`);
  };

  const handleBackToListings = () => {
    navigateTo('jobs', '/jobs');
  };

  // Role-based REDIRECT after authentication
  // Candidate -> Candidate Dashboard (/applications)
  // Recruiter -> Recruiter Dashboard (/recruiter)
  // Admin -> Admin Console (/admin)
  const handleAuthSuccess = (userRole) => {
    if (userRole === 'admin') {
      navigateTo('admin', '/admin');
    } else if (userRole === 'recruiter') {
      navigateTo('recruiter-dash', '/recruiter');
    } else {
      navigateTo('candidate-dash', '/applications');
    }
  };

  // 1. DEDICATED STANDALONE ADMIN PAGE:
  // If activePage is 'admin' (e.g. visited /admin), render ONLY the standalone Admin Portal!
  // No candidate navbar and no candidate footer.
  if (activePage === 'admin') {
    return (
      <AdminPortalPage 
        onExit={() => navigateTo('landing', '/')} 
      />
    );
  }

  // 2. CANDIDATE & PUBLIC PORTAL:
  // Candidate view strictly displays Candidate experience.
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage}
        navigateTo={navigateTo}
        openAuthModal={openAuthModal}
      />

      <div style={{ flex: 1 }}>
        {/* Dedicated Standalone Login Page */}
        {activePage === 'login' && (
          <LoginPage 
            onNavigate={navigateTo}
            onAuthSuccess={handleAuthSuccess}
          />
        )}

        {/* Dedicated Standalone Register Page */}
        {activePage === 'register' && (
          <RegisterPage 
            onNavigate={navigateTo}
            onAuthSuccess={handleAuthSuccess}
          />
        )}

        {activePage === 'landing' && (
          <LandingPage 
            onSearch={handleSearchFromLanding}
            onViewJob={handleViewJob}
            openAuthModal={openAuthModal}
            setActivePage={(p) => navigateTo(p)}
          />
        )}

        {activePage === 'jobs' && (
          <JobsPage 
            initialFilter={jobsFilter}
            onViewJob={handleViewJob}
          />
        )}

        {activePage === 'job-details' && (
          <JobDetailsPage 
            jobId={selectedJobId}
            onBack={handleBackToListings}
            openAuthModal={openAuthModal}
            onAppliedSuccess={() => {
              setTimeout(() => navigateTo('candidate-dash', '/applications'), 1500);
            }}
          />
        )}

        {/* Candidate Dashboard with Unauthorized Protection */}
        {activePage === 'candidate-dash' && (
          !user ? (
            <UnauthorizedPage 
              requiredRole="candidate"
              onLoginClick={() => openAuthModal('login')}
              onHomeClick={() => navigateTo('landing', '/')}
            />
          ) : (
            <CandidateDashboard onViewJob={handleViewJob} />
          )
        )}

        {/* Recruiter Dashboard with Unauthorized Protection */}
        {activePage === 'recruiter-dash' && (
          (!user || role !== 'recruiter') ? (
            <UnauthorizedPage 
              requiredRole="recruiter"
              onLoginClick={() => openAuthModal('login')}
              onHomeClick={() => navigateTo('landing', '/')}
            />
          ) : (
            <RecruiterPortalPage 
              onExit={() => navigateTo('jobs', '/jobs')}
              onViewJob={handleViewJob}
            />
          )
        )}

        {activePage === 'workflow-map' && (
          <WorkflowMapPage 
            setActivePage={(p) => navigateTo(p)}
            openAuthModal={openAuthModal}
            onViewJob={handleViewJob}
          />
        )}
      </div>

      {/* Candidate Portal Footer */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '40px 24px 20px', borderTop: '1px solid #1e293b', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
              Work<span style={{ color: '#4f46e5' }}>Pulse</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Candidate Job Search & Careers Platform
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigateTo('workflow-map', '/workflow-map')}
              style={{ background: 'rgba(79, 70, 229, 0.2)', border: '1px solid #4f46e5', color: '#818cf8', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
              <Map size={14} /> Open PDF Blueprint
            </button>

            {/* Dedicated links to separate portals */}
            <button 
              onClick={() => navigateTo('recruiter-dash', '/recruiter')}
              style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
              <Building2 size={14} /> For Employers / Post Jobs
            </button>

            <button 
              onClick={() => navigateTo('admin', '/admin')}
              style={{ background: 'transparent', border: '1px solid #1e293b', color: '#64748b', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
              <Shield size={14} /> Admin Access (/admin)
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
              <Database size={16} /> TiDB Cloud Serverless
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '20px auto 0', paddingTop: '20px', borderTop: '1px solid #1e293b', textAlign: 'center', fontSize: '0.75rem', color: '#475569' }}>
          Candidate Career Portal &bull; TiDB Serverless &bull; Clean Role Isolation (Candidate / Recruiter / Admin)
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
