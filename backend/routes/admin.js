const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All routes here require Admin role
router.use(authenticateToken, requireRole('admin'));

// 1. Admin Platform Stats
router.get('/stats', async (req, res) => {
  try {
    const [[usersCount]] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role != "admin"');
    const [[candidatesCount]] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "candidate"');
    const [[recruitersCount]] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "recruiter"');
    const [[totalJobs]] = await pool.query('SELECT COUNT(*) as count FROM jobs');
    const [[pendingJobs]] = await pool.query('SELECT COUNT(*) as count FROM jobs WHERE status = "pending"');
    const [[approvedJobs]] = await pool.query('SELECT COUNT(*) as count FROM jobs WHERE status = "approved"');
    const [[applicationsCount]] = await pool.query('SELECT COUNT(*) as count FROM applications');

    res.json({
      totalUsers: usersCount.count,
      candidates: candidatesCount.count,
      recruiters: recruitersCount.count,
      totalJobs: totalJobs.count,
      pendingJobs: pendingJobs.count,
      approvedJobs: approvedJobs.count,
      totalApplications: applicationsCount.count
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin stats.' });
  }
});

// 2. Pending Jobs list for moderation
router.get('/pending-jobs', async (req, res) => {
  try {
    const query = `
      SELECT 
        j.*,
        u.name as recruiter_name,
        u.email as recruiter_email,
        r.company_name,
        r.company_logo
      FROM jobs j
      JOIN users u ON j.recruiter_id = u.id
      LEFT JOIN recruiter_profiles r ON r.user_id = u.id
      WHERE j.status = 'pending'
      ORDER BY j.created_at ASC
    `;
    const [jobs] = await pool.query(query);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending jobs.' });
  }
});

// 3. All Jobs list (with status filter: all, pending, approved, rejected, draft)
router.get('/jobs', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT 
        j.*,
        u.name as recruiter_name,
        u.email as recruiter_email,
        r.company_name
      FROM jobs j
      JOIN users u ON j.recruiter_id = u.id
      LEFT JOIN recruiter_profiles r ON r.user_id = u.id
    `;
    const params = [];
    if (status && status !== 'all') {
      query += ' WHERE j.status = ?';
      params.push(status);
    }
    query += ' ORDER BY j.created_at DESC';

    const [jobs] = await pool.query(query, params);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all jobs.' });
  }
});

// 4. Moderate Job: Approve or Reject
router.patch('/jobs/:id/moderate', async (req, res) => {
  try {
    const jobId = req.params.id;
    const { action, rejection_reason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: "Action must be either 'approve' or 'reject'." });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const reason = action === 'reject' ? (rejection_reason || 'Job does not comply with platform guidelines.') : null;

    await pool.query(
      'UPDATE jobs SET status = ?, rejection_reason = ? WHERE id = ?',
      [newStatus, reason, jobId]
    );

    res.json({
      message: action === 'approve' 
        ? 'Job has been approved and is now publicly live!' 
        : 'Job has been rejected with feedback sent to recruiter.',
      status: newStatus
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to moderate job.' });
  }
});

// 5. Users List (Candidates and Recruiters)
router.get('/users', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, u.name, u.email, u.phone, u.role, u.status, u.created_at,
        r.company_name,
        cp.headline
      FROM users u
      LEFT JOIN recruiter_profiles r ON r.user_id = u.id
      LEFT JOIN candidate_profiles cp ON cp.user_id = u.id
      WHERE u.role != 'admin'
      ORDER BY u.created_at DESC
    `;
    const [users] = await pool.query(query);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// 6. Block / Unblock User
router.patch('/users/:id/status', async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ error: 'Status must be active or blocked.' });
    }

    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
    res.json({ message: `User status changed to ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status.' });
  }
});

// 7. All Applications Monitor
router.get('/applications', async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id,
        CONCAT('APP-', YEAR(a.created_at), '-', LPAD(a.id, 4, '0')) as application_code,
        a.status,
        a.created_at,
        j.title as job_title,
        r.company_name,
        u.name as candidate_name,
        u.email as candidate_email
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.candidate_id = u.id
      LEFT JOIN recruiter_profiles r ON r.user_id = j.recruiter_id
      ORDER BY a.created_at DESC
      LIMIT 100
    `;
    const [applications] = await pool.query(query);
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all applications.' });
  }
});

module.exports = router;
