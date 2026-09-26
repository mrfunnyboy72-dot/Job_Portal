const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./db');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

// Public Companies directory (Verified companies managed by Admin)
app.get('/api/companies', async (req, res) => {
  try {
    const { pool } = require('./db');
    const [companies] = await pool.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM jobs j 
         JOIN recruiter_profiles r ON j.recruiter_id = r.user_id 
         WHERE LOWER(TRIM(r.company_name)) = LOWER(TRIM(c.name)) AND j.status = 'approved') as active_jobs_count
      FROM companies c
      ORDER BY c.name ASC
    `);
    res.json(companies);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: 'TiDB Cloud Serverless',
    service: 'Job Portal API'
  });
});

// Serve frontend static build if available (Production All-in-One deployment)
const frontendDist = path.join(__dirname, '../frontend/dist');
const fs = require('fs');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(frontendDist, 'index.html'));
    }
    next();
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error.' });
});

// Start Server & Init DB
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Job Portal Backend Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
