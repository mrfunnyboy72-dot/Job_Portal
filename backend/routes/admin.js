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

// 8. Admin Analytics & Charts Data
router.get('/analytics', async (req, res) => {
  try {
    const [jobsByCategory] = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM jobs 
      GROUP BY category 
      ORDER BY count DESC 
      LIMIT 6
    `);

    const [appsByStatus] = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM applications 
      GROUP BY status
    `);

    const [jobsByStatus] = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM jobs 
      GROUP BY status
    `);

    res.json({
      jobsByCategory,
      appsByStatus,
      jobsByStatus
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin analytics.' });
  }
});

// 9. Admin Companies Management: List all companies
router.get('/companies', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM jobs j 
         JOIN recruiter_profiles r ON j.recruiter_id = r.user_id 
         WHERE LOWER(TRIM(r.company_name)) = LOWER(TRIM(c.name))) as jobs_count
      FROM companies c
      ORDER BY c.created_at DESC
    `;
    const [companies] = await pool.query(query);
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch companies.' });
  }
});

// 10. Admin Companies Management: Add new company
router.post('/companies', async (req, res) => {
  try {
    const { name, logo_url, website, industry, location, about } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Company name is required.' });
    }

    // Check if company already exists
    const [existing] = await pool.query('SELECT id FROM companies WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))', [name.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'A company with this name already exists.' });
    }

    const defaultLogo = logo_url?.trim() || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80';

    const [result] = await pool.query(`
      INSERT INTO companies (name, logo_url, website, industry, location, about, verified)
      VALUES (?, ?, ?, ?, ?, ?, true)
    `, [
      name.trim(),
      defaultLogo,
      website?.trim() || null,
      industry?.trim() || 'Information Technology',
      location?.trim() || 'India',
      about?.trim() || `${name.trim()} is a leading organization.`
    ]);

    res.status(201).json({
      message: `Company '${name.trim()}' added successfully!`,
      companyId: result.insertId
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add company.' });
  }
});

// 11. Admin Companies Management: Update company
router.put('/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo_url, website, industry, location, about } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Company name is required.' });
    }

    await pool.query(`
      UPDATE companies 
      SET name = ?, logo_url = ?, website = ?, industry = ?, location = ?, about = ?
      WHERE id = ?
    `, [
      name.trim(),
      logo_url?.trim() || null,
      website?.trim() || null,
      industry?.trim() || null,
      location?.trim() || null,
      about?.trim() || null,
      id
    ]);

    res.json({ message: 'Company details updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update company.' });
  }
});

// 12. Admin Companies Management: Delete company
router.delete('/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM companies WHERE id = ?', [id]);
    res.json({ message: 'Company removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete company.' });
  }
});

// 13. A06 Categories & Catalogs
router.get('/categories', async (req, res) => {
  try {
    const query = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM jobs WHERE category = c.name) as jobs_count
      FROM categories c
      ORDER BY c.name ASC
    `;
    const [categories] = await pool.query(query);

    // Get unique locations and skills from approved jobs
    const [jobRows] = await pool.query('SELECT location, skills FROM jobs');
    const locationsSet = new Set();
    const skillsSet = new Set();

    jobRows.forEach(j => {
      if (j.location) locationsSet.add(j.location.trim());
      if (j.skills) {
        let skills = [];
        try {
          skills = typeof j.skills === 'string' ? JSON.parse(j.skills) : j.skills;
        } catch (e) {}
        if (Array.isArray(skills)) {
          skills.forEach(s => skillsSet.add(s.trim()));
        }
      }
    });

    res.json({
      categories,
      locations: Array.from(locationsSet),
      skills: Array.from(skillsSet)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required.' });
    }
    await pool.query('INSERT INTO categories (name, icon) VALUES (?, ?)', [name.trim(), icon || 'folder']);
    res.status(201).json({ message: `Category '${name.trim()}' added successfully!` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add category or already exists.' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Category removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});

// 14. A08 Platform Settings
router.get('/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM platform_settings');
    const settings = {};
    rows.forEach(r => {
      settings[r.setting_key] = r.setting_value === 'true' ? true : (r.setting_value === 'false' ? false : r.setting_value);
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(`
        INSERT INTO platform_settings (setting_key, setting_value)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE setting_value = ?
      `, [key, String(value), String(value)]);
    }
    res.json({ message: 'Platform settings updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

module.exports = router;



