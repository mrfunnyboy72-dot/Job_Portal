const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Setup multer storage for resumes
const uploadDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `resume-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'));
    }
  }
});

// GET /api/profile/candidate
router.get('/candidate', authenticateToken, async (req, res) => {
  try {
    const [profiles] = await pool.query(`
      SELECT cp.*, u.name, u.email, u.phone
      FROM candidate_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.user_id = ?
    `, [req.user.id]);

    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Candidate profile not found.' });
    }

    res.json(profiles[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch candidate profile.' });
  }
});

// PUT /api/profile/candidate
router.put('/candidate', authenticateToken, async (req, res) => {
  try {
    const { name, phone, headline, bio, education, experience, skills, location } = req.body;

    // Update user info
    if (name || phone) {
      await pool.query('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?', [name, phone, req.user.id]);
    }

    // Calculate completion %
    let completion = 20;
    if (headline) completion += 20;
    if (skills && (Array.isArray(skills) ? skills.length > 0 : true)) completion += 20;
    if (experience && (Array.isArray(experience) ? experience.length > 0 : true)) completion += 20;
    if (education && (Array.isArray(education) ? education.length > 0 : true)) completion += 20;

    await pool.query(`
      UPDATE candidate_profiles SET
        headline = COALESCE(?, headline),
        bio = COALESCE(?, bio),
        education = COALESCE(?, education),
        experience = COALESCE(?, experience),
        skills = COALESCE(?, skills),
        location = COALESCE(?, location),
        completion_percentage = ?
      WHERE user_id = ?
    `, [
      headline,
      bio,
      education ? JSON.stringify(education) : null,
      experience ? JSON.stringify(experience) : null,
      skills ? JSON.stringify(skills) : null,
      location,
      completion,
      req.user.id
    ]);

    res.json({ message: 'Profile updated successfully!', completionPercentage: completion });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// POST /api/profile/resume - Upload Resume file
router.post('/resume', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const fileUrl = `/uploads/resumes/${req.file.filename}`;
    const fileName = req.file.originalname;

    await pool.query(
      'UPDATE candidate_profiles SET resume_url = ?, resume_name = ? WHERE user_id = ?',
      [fileUrl, fileName, req.user.id]
    );

    res.json({
      message: 'Resume uploaded successfully!',
      resume_url: fileUrl,
      resume_name: fileName
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to upload resume.' });
  }
});

// GET /api/profile/recruiter
router.get('/recruiter', authenticateToken, async (req, res) => {
  try {
    const [profiles] = await pool.query(`
      SELECT rp.*, u.name, u.email, u.phone
      FROM recruiter_profiles rp
      JOIN users u ON rp.user_id = u.id
      WHERE rp.user_id = ?
    `, [req.user.id]);

    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Recruiter profile not found.' });
    }

    res.json(profiles[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recruiter profile.' });
  }
});

// PUT /api/profile/recruiter
router.put('/recruiter', authenticateToken, async (req, res) => {
  try {
    const { name, phone, company_name, company_logo, company_about, website, industry, location } = req.body;

    if (name || phone) {
      await pool.query('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?', [name, phone, req.user.id]);
    }

    await pool.query(`
      UPDATE recruiter_profiles SET
        company_name = COALESCE(?, company_name),
        company_logo = COALESCE(?, company_logo),
        company_about = COALESCE(?, company_about),
        website = COALESCE(?, website),
        industry = COALESCE(?, industry),
        location = COALESCE(?, location)
      WHERE user_id = ?
    `, [company_name, company_logo, company_about, website, industry, location, req.user.id]);

    res.json({ message: 'Company profile updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update company profile.' });
  }
});

// GET /api/profile/saved-jobs - Fetch candidate's bookmarked jobs
router.get('/saved-jobs', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        j.*,
        r.company_name,
        r.company_logo,
        sj.created_at as saved_at
      FROM saved_jobs sj
      JOIN jobs j ON sj.job_id = j.id
      LEFT JOIN recruiter_profiles r ON r.user_id = j.recruiter_id
      WHERE sj.candidate_id = ?
      ORDER BY sj.created_at DESC
    `;
    const [jobs] = await pool.query(query, [req.user.id]);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved jobs.' });
  }
});

// GET /api/profile/saved-job-ids - Quick array of saved job IDs
router.get('/saved-job-ids', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT job_id FROM saved_jobs WHERE candidate_id = ?', [req.user.id]);
    const ids = rows.map(r => r.job_id);
    res.json(ids);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved job IDs.' });
  }
});

// POST /api/profile/saved-jobs/:jobId - Toggle save/unsave job
router.post('/saved-jobs/:jobId', authenticateToken, async (req, res) => {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    const candidateId = req.user.id;

    // Check if already saved
    const [existing] = await pool.query(
      'SELECT id FROM saved_jobs WHERE candidate_id = ? AND job_id = ?',
      [candidateId, jobId]
    );

    if (existing.length > 0) {
      await pool.query('DELETE FROM saved_jobs WHERE candidate_id = ? AND job_id = ?', [candidateId, jobId]);
      return res.json({ saved: false, message: 'Job removed from saved list.' });
    } else {
      await pool.query('INSERT INTO saved_jobs (candidate_id, job_id) VALUES (?, ?)', [candidateId, jobId]);
      return res.json({ saved: true, message: 'Job saved to your bookmarks!' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle saved job.' });
  }
});

module.exports = router;

