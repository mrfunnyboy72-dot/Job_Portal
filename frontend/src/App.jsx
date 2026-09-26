import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { WorkflowMapPage } from './pages/WorkflowMapPage';
import { Database, ShieldCheck, Heart, Map } from 'lucide-react';

function MainApp() {
  const { user, role } = useAuth();
  const [activePage, setActivePage] = useState('landing');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobsFilter, setJobsFilter] = useState({});

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleSearchFromLanding = (filters) => {
    setJobsFilter(filters);
    setActivePage('jobs');
  };

  const handleViewJob = (id) => {
    setSelectedJobId(id);
    setActivePage('job-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToListings = () => {
    setActivePage('jobs');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        activePage={activePage} 
        setActivePage={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        openAuthModal={openAuthModal}
      />

      <div style={{ flex: 1 }}>
        {activePage === 'landing' && (
          <LandingPage 
            onSearch={handleSearchFromLanding}
            onViewJob={handleViewJob}
            openAuthModal={openAuthModal}
            setActivePage={setActivePage}
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
              // redirect to candidate dashboard after 1.5s
              setTimeout(() => setActivePage('candidate-dash'), 1500);
            }}
          />
        )}

        {activePage === 'candidate-dash' && (
          <CandidateDashboard onViewJob={handleViewJob} />
        )}

        {activePage === 'recruiter-dash' && (
          <RecruiterDashboard onViewJob={handleViewJob} />
        )}

        {activePage === 'admin-dash' && (
          <AdminDashboard />
        )}

        {activePage === 'workflow-map' && (
          <WorkflowMapPage 
            setActivePage={setActivePage}
            openAuthModal={openAuthModal}
            onViewJob={handleViewJob}
          />
        )}
      </div>

      {/* Global Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* Footer */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '40px 24px 20px', borderTop: '1px solid #1e293b', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
              Work<span style={{ color: '#4f46e5' }}>Pulse</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Full Page-By-Page Job Portal Architecture
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem' }}>
            <button 
              onClick={() => {
                setActivePage('workflow-map');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ background: 'rgba(79, 70, 229, 0.2)', border: '1px solid #4f46e5', color: '#818cf8', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
              <Map size={14} /> Open PDF Blueprint
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
              <Database size={16} /> TiDB Cloud Serverless
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399' }}>
              <ShieldCheck size={16} /> Admin Quality Verified
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '20px auto 0', paddingTop: '20px', borderTop: '1px solid #1e293b', textAlign: 'center', fontSize: '0.75rem', color: '#475569' }}>
          Candidate ➔ Recruiter ➔ Admin Review ➔ Application Tracking. Built with React (Vite) + Node/Express + TiDB Cloud.
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
