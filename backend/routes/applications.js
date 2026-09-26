const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// 1. POST /api/applications - Candidate applies to a job
router.post('/', authenticateToken, requireRole('candidate'), async (req, res) => {
  try {
    const { job_id, resume_url, cover_note } = req.body;

    if (!job_id) {
      return res.status(400).json({ error: 'Job ID is required.' });
    }

    // Check if job exists and is approved
    const [jobs] = await pool.query('SELECT * FROM jobs WHERE id = ?', [job_id]);
    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    if (jobs[0].status !== 'approved') {
      return res.status(400).json({ error: 'This job is not accepting applications at this time.' });
    }

    // Check if already applied
    const [existing] = await pool.query(
      'SELECT id FROM applications WHERE job_id = ? AND candidate_id = ?',
      [job_id, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'You have already applied for this job.' });
    }

    // Default to candidate's profile resume if not provided
    let finalResumeUrl = resume_url;
    if (!finalResumeUrl) {
      const [profile] = await pool.query('SELECT resume_url FROM candidate_profiles WHERE user_id = ?', [req.user.id]);
      if (profile.length > 0 && profile[0].resume_url) {
        finalResumeUrl = profile[0].resume_url;
      }
    }

    const [result] = await pool.query(
      'INSERT INTO applications (job_id, candidate_id, resume_url, cover_note, status) VALUES (?, ?, ?, ?, ?)',
      [job_id, req.user.id, finalResumeUrl || '', cover_note || '', 'applied']
    );

    const applicationId = `APP-${new Date().getFullYear()}-${String(result.insertId).padStart(4, '0')}`;

    res.status(201).json({
      message: 'Application submitted successfully!',
      application_id: applicationId,
      id: result.insertId,
      status: 'applied'
    });
  } catch (err) {
    console.error('Apply job error:', err);
    res.status(500).json({ error: 'Failed to submit application.' });
  }
});

// 2. GET /api/applications/candidate - Candidate's applications with full status pipeline
router.get('/candidate', authenticateToken, requireRole('candidate'), async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id,
        CONCAT('APP-', YEAR(a.created_at), '-', LPAD(a.id, 4, '0')) as application_code,
        a.status,
        a.cover_note,
        a.resume_url,
        a.interview_date,
        a.interview_notes,
        a.created_at,
        a.updated_at,
        j.id as job_id,
        j.title as job_title,
        j.category,
        j.job_type,
        j.location,
        j.salary_min,
        j.salary_max,
        r.company_name,
        r.company_logo
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      LEFT JOIN recruiter_profiles r ON r.user_id = j.recruiter_id
      WHERE a.candidate_id = ?
      ORDER BY a.created_at DESC
    `;
    const [applications] = await pool.query(query, [req.user.id]);
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch candidate applications.' });
  }
});

// 3. GET /api/applications/recruiter/job/:jobId - Recruiter views applicants for a job
router.get('/recruiter/job/:jobId', authenticateToken, requireRole('recruiter'), async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // Verify recruiter owns this job
    const [jobs] = await pool.query('SELECT id, title FROM jobs WHERE id = ? AND recruiter_id = ?', [jobId, req.user.id]);
    if (jobs.length === 0) {
      return res.status(403).json({ error: 'You are not authorized to view applicants for this job.' });
    }

    const query = `
      SELECT 
        a.id,
        CONCAT('APP-', YEAR(a.created_at), '-', LPAD(a.id, 4, '0')) as application_code,
        a.status,
        a.cover_note,
        a.resume_url,
        a.interview_date,
        a.interview_notes,
        a.created_at,
        u.id as candidate_user_id,
        u.name as candidate_name,
        u.email as candidate_email,
        u.phone as candidate_phone,
        cp.headline,
        cp.bio,
        cp.education,
        cp.experience,
        cp.skills,
        cp.location as candidate_location
      FROM applications a
      JOIN users u ON a.candidate_id = u.id
      LEFT JOIN candidate_profiles cp ON cp.user_id = u.id
      WHERE a.job_id = ?
      ORDER BY a.created_at DESC
    `;
    const [applicants] = await pool.query(query, [jobId]);
    res.json({ job: jobs[0], applicants });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applicants.' });
  }
});

// 4. GET /api/applications/recruiter/all - All applicants for all jobs of this recruiter
router.get('/recruiter/all', authenticateToken, requireRole('recruiter'), async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id,
        CONCAT('APP-', YEAR(a.created_at), '-', LPAD(a.id, 4, '0')) as application_code,
        a.status,
        a.created_at,
        a.interview_date,
        a.interview_notes,
        a.resume_url,
        j.id as job_id,
        j.title as job_title,
        u.name as candidate_name,
        u.email as candidate_email,
        cp.headline
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.candidate_id = u.id
      LEFT JOIN candidate_profiles cp ON cp.user_id = u.id
      WHERE j.recruiter_id = ?
      ORDER BY a.created_at DESC
    `;
    const [applicants] = await pool.query(query, [req.user.id]);
    res.json(applicants);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all recruiter applications.' });
  }
});

// 5. PATCH /api/applications/:id/status - Recruiter updates applicant status
router.patch('/:id/status', authenticateToken, requireRole('recruiter'), async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status, interview_date, interview_notes } = req.body;

    const validStatuses = ['applied', 'viewed', 'shortlisted', 'interview', 'selected', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // Verify ownership of the job
    const [appRows] = await pool.query(`
      SELECT a.id, a.job_id, j.recruiter_id 
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ?
    `, [applicationId]);

    if (appRows.length === 0 || appRows[0].recruiter_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this application.' });
    }

    await pool.query(`
      UPDATE applications 
      SET status = ?, 
          interview_date = COALESCE(?, interview_date),
          interview_notes = COALESCE(?, interview_notes)
      WHERE id = ?
    `, [status, interview_date || null, interview_notes || null, applicationId]);

    res.json({ message: `Application status updated to ${status}.`, status });
  } catch (err) {
    console.error('Update app status error:', err);
    res.status(500).json({ error: 'Failed to update application status.' });
  }
});

module.exports = router;
