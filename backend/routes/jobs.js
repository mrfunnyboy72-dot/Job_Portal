const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// 1. GET /api/jobs - Public approved jobs with search, filters, pagination
router.get('/', async (req, res) => {
  try {
    const {
      keyword = '',
      location = '',
      category = '',
      job_type = '',
      experience = '',
      sort = 'newest',
      page = 1,
      limit = 10
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    let whereClauses = ["j.status = 'approved'"];

    if (keyword.trim()) {
      whereClauses.push('(j.title LIKE ? OR j.description LIKE ? OR JSON_SEARCH(j.skills, "one", ?) IS NOT NULL)');
      const kw = `%${keyword.trim()}%`;
      params.push(kw, kw, `%${keyword.trim()}%`);
    }

    if (location.trim()) {
      whereClauses.push('j.location LIKE ?');
      params.push(`%${location.trim()}%`);
    }

    if (category.trim() && category !== 'All') {
      whereClauses.push('j.category = ?');
      params.push(category.trim());
    }

    if (job_type.trim() && job_type !== 'All') {
      whereClauses.push('j.job_type = ?');
      params.push(job_type.trim());
    }

    if (experience.trim() && experience !== 'All') {
      whereClauses.push('j.experience_level = ?');
      params.push(experience.trim());
    }

    let orderBy = 'j.created_at DESC';
    if (sort === 'salary_high') orderBy = 'j.salary_max DESC';
    if (sort === 'salary_low') orderBy = 'j.salary_min ASC';
    if (sort === 'oldest') orderBy = 'j.created_at ASC';

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total count
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM jobs j ${whereSql}`,
      params
    );
    const total = countRows[0].total;

    // Fetch jobs with company info
    const query = `
      SELECT 
        j.*,
        u.name as recruiter_name,
        r.company_name,
        r.company_logo,
        r.website as company_website,
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as applicant_count
      FROM jobs j
      LEFT JOIN users u ON j.recruiter_id = u.id
      LEFT JOIN recruiter_profiles r ON r.user_id = u.id
      ${whereSql}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const [jobs] = await pool.query(query, [...params, parseInt(limit, 10), parseInt(offset, 10)]);

    res.json({
      jobs,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10))
    });
  } catch (err) {
    console.error('Fetch jobs error:', err);
    res.status(500).json({ error: 'Failed to fetch jobs.' });
  }
});

// 2. GET /api/jobs/featured - Featured approved jobs for landing page
router.get('/featured', async (req, res) => {
  try {
    const query = `
      SELECT 
        j.*,
        r.company_name,
        r.company_logo
      FROM jobs j
      LEFT JOIN recruiter_profiles r ON r.user_id = j.recruiter_id
      WHERE j.status = 'approved'
      ORDER BY j.created_at DESC
      LIMIT 6
    `;
    const [jobs] = await pool.query(query);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured jobs.' });
  }
});

// 3. GET /api/jobs/categories - Category list with count of approved jobs
router.get('/categories', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.icon,
        COUNT(j.id) as job_count
      FROM categories c
      LEFT JOIN jobs j ON j.category = c.name AND j.status = 'approved'
      GROUP BY c.id, c.name, c.icon
      ORDER BY job_count DESC, c.name ASC
    `;
    const [categories] = await pool.query(query);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// 4. GET /api/jobs/recruiter/my-jobs - Recruiter's jobs list
router.get('/recruiter/my-jobs', authenticateToken, requireRole('recruiter'), async (req, res) => {
  try {
    const query = `
      SELECT 
        j.*,
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as applicants_count,
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id AND a.status = 'shortlisted') as shortlisted_count
      FROM jobs j
      WHERE j.recruiter_id = ?
      ORDER BY j.created_at DESC
    `;
    const [jobs] = await pool.query(query, [req.user.id]);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recruiter jobs.' });
  }
});

// 5. GET /api/jobs/:id - Single job details
router.get('/:id', async (req, res) => {
  try {
    const jobId = req.params.id;

    // Increment view count
    await pool.query('UPDATE jobs SET views_count = views_count + 1 WHERE id = ?', [jobId]);

    const query = `
      SELECT 
        j.*,
        r.company_name,
        r.company_logo,
        r.company_about,
        r.website as company_website,
        r.location as company_location,
        u.email as recruiter_email
      FROM jobs j
      LEFT JOIN users u ON j.recruiter_id = u.id
      LEFT JOIN recruiter_profiles r ON r.user_id = u.id
      WHERE j.id = ?
    `;
    const [jobs] = await pool.query(query, [jobId]);
    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    res.json(jobs[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch job details.' });
  }
});

// 6. POST /api/jobs - Recruiter posts a job (Status defaults to pending for Admin approval!)
router.post('/', authenticateToken, requireRole('recruiter'), async (req, res) => {
  try {
    const {
      title,
      category,
      job_type = 'Full-time',
      experience_level = '1-3 Years',
      location,
      salary_min = 0,
      salary_max = 0,
      description,
      requirements = '',
      skills = [],
      is_draft = false
    } = req.body;

    if (!title || !category || !location || !description) {
      return res.status(400).json({ error: 'Title, category, location, and description are required.' });
    }

    const status = is_draft ? 'draft' : 'pending';

    const [result] = await pool.query(`
      INSERT INTO jobs (
        recruiter_id, title, category, job_type, experience_level,
        location, salary_min, salary_max, description, requirements,
        skills, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      title,
      category,
      job_type,
      experience_level,
      location,
      parseInt(salary_min, 10) || 0,
      parseInt(salary_max, 10) || 0,
      description,
      requirements,
      JSON.stringify(Array.isArray(skills) ? skills : [skills]),
      status
    ]);

    res.status(201).json({
      message: is_draft 
        ? 'Job saved as draft successfully!' 
        : 'Job submitted for Admin approval! Once approved, it will be published.',
      jobId: result.insertId,
      status
    });
  } catch (err) {
    console.error('Post job error:', err);
    res.status(500).json({ error: 'Failed to post job.' });
  }
});

// 7. PUT /api/jobs/:id - Recruiter edit job
router.put('/:id', authenticateToken, requireRole('recruiter'), async (req, res) => {
  try {
    const jobId = req.params.id;
    const {
      title,
      category,
      job_type,
      experience_level,
      location,
      salary_min,
      salary_max,
      description,
      requirements,
      skills,
      resubmit = false
    } = req.body;

    // Check ownership
    const [existing] = await pool.query('SELECT * FROM jobs WHERE id = ? AND recruiter_id = ?', [jobId, req.user.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Job not found or access denied.' });
    }

    const newStatus = resubmit ? 'pending' : existing[0].status;

    await pool.query(`
      UPDATE jobs SET
        title = COALESCE(?, title),
        category = COALESCE(?, category),
        job_type = COALESCE(?, job_type),
        experience_level = COALESCE(?, experience_level),
        location = COALESCE(?, location),
        salary_min = COALESCE(?, salary_min),
        salary_max = COALESCE(?, salary_max),
        description = COALESCE(?, description),
        requirements = COALESCE(?, requirements),
        skills = COALESCE(?, skills),
        status = ?,
        rejection_reason = CASE WHEN ? = 'pending' THEN NULL ELSE rejection_reason END
      WHERE id = ?
    `, [
      title,
      category,
      job_type,
      experience_level,
      location,
      salary_min,
      salary_max,
      description,
      requirements,
      skills ? JSON.stringify(skills) : null,
      newStatus,
      newStatus,
      jobId
    ]);

    res.json({ message: 'Job updated successfully!', status: newStatus });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update job.' });
  }
});

// 8. DELETE /api/jobs/:id - Delete job
router.delete('/:id', authenticateToken, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    const jobId = req.params.id;
    let query = 'DELETE FROM jobs WHERE id = ?';
    let params = [jobId];

    if (req.user.role === 'recruiter') {
      query += ' AND recruiter_id = ?';
      params.push(req.user.id);
    }

    const [result] = await pool.query(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Job not found or not authorized.' });
    }

    res.json({ message: 'Job deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete job.' });
  }
});

// 9. POST /api/jobs/:id/match-score - AI ATS Resume & Skill Matching
router.post('/:id/match-score', async (req, res) => {
  try {
    const jobId = req.params.id;
    const { candidateSkills = [], candidateExperience = '', candidateHeadline = '' } = req.body;

    const [jobs] = await pool.query('SELECT * FROM jobs WHERE id = ?', [jobId]);
    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobs[0];
    const jobSkills = Array.isArray(job.skills) 
      ? job.skills 
      : (typeof job.skills === 'string' ? JSON.parse(job.skills || '[]') : []);

    const normCandidateSkills = (candidateSkills || []).map(s => String(s).toLowerCase().trim());
    const normJobSkills = jobSkills.map(s => String(s).toLowerCase().trim());

    // Compute intersection
    const matched = [];
    const missing = [];

    normJobSkills.forEach(js => {
      const isMatch = normCandidateSkills.some(cs => cs.includes(js) || js.includes(cs));
      if (isMatch) matched.push(js);
      else missing.push(js);
    });

    // Score calculation
    let score = 40; // baseline for interested applicants
    if (normJobSkills.length > 0) {
      const ratio = matched.length / normJobSkills.length;
      score = Math.round(35 + (ratio * 55));
    } else {
      score = 75;
    }

    if (candidateHeadline && candidateHeadline.toLowerCase().includes(job.title.toLowerCase().slice(0, 5))) {
      score = Math.min(score + 10, 98);
    }

    let fitLevel = 'Developing Match';
    if (score >= 80) fitLevel = 'Exceptional Match';
    else if (score >= 60) fitLevel = 'Strong Match';

    res.json({
      matchScore: score,
      fitLevel,
      matchedSkills: matched,
      missingSkills: missing,
      totalRequiredSkills: normJobSkills.length,
      insights: score >= 80 
        ? 'Your profile closely matches this opening! You are in the top tier of candidates.'
        : `You have ${matched.length} out of ${normJobSkills.length} core competencies. Consider highlighting any related projects.`
    });
  } catch (err) {
    console.error('Match score error:', err);
    res.status(500).json({ error: 'Failed to calculate match score.' });
  }
});

// 10. GET /api/jobs/recruiter/analytics - Visual pipeline analytics
router.get('/recruiter/analytics', authenticateToken, requireRole('recruiter'), async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const [jobCounts] = await pool.query(`
      SELECT 
        status, 
        COUNT(*) as count 
      FROM jobs 
      WHERE recruiter_id = ? 
      GROUP BY status
    `, [recruiterId]);

    const [appPipeline] = await pool.query(`
      SELECT 
        a.status, 
        COUNT(*) as count 
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE j.recruiter_id = ?
      GROUP BY a.status
    `, [recruiterId]);

    const [topJobs] = await pool.query(`
      SELECT 
        j.id, 
        j.title, 
        j.views_count,
        COUNT(a.id) as application_count
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.recruiter_id = ?
      GROUP BY j.id, j.title, j.views_count
      ORDER BY application_count DESC
      LIMIT 5
    `, [recruiterId]);

    res.json({
      jobCounts,
      appPipeline,
      topJobs
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recruiter analytics.' });
  }
});

module.exports = router;

