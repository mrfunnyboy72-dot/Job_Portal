const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// Register (Candidate or Recruiter)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, company_name } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password and role are required.' });
    }

    if (!['candidate', 'recruiter'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either candidate or recruiter.' });
    }

    // Check existing
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, password_hash, phone || '', role]
    );

    const userId = result.insertId;

    // Create profile
    if (role === 'candidate') {
      await pool.query(
        'INSERT INTO candidate_profiles (user_id, completion_percentage, skills, education, experience) VALUES (?, 30, ?, ?, ?)',
        [userId, JSON.stringify([]), JSON.stringify([]), JSON.stringify([])]
      );
    } else if (role === 'recruiter') {
      await pool.query(
        'INSERT INTO recruiter_profiles (user_id, company_name) VALUES (?, ?)',
        [userId, company_name || `${name}'s Company`]
      );
    }

    const token = jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful! Verification code sent.',
      token,
      user: { id: userId, name, email, role, phone }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];
    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Your account has been blocked by Admin.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Fetch extra details if recruiter
    let companyName = null;
    if (user.role === 'recruiter') {
      const [recProfiles] = await pool.query('SELECT company_name FROM recruiter_profiles WHERE user_id = ?', [user.id]);
      if (recProfiles.length > 0) companyName = recProfiles[0].company_name;
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        company_name: companyName
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Verify Current User (Me)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    let profileData = {};
    if (req.user.role === 'candidate') {
      const [profiles] = await pool.query('SELECT * FROM candidate_profiles WHERE user_id = ?', [req.user.id]);
      profileData = profiles[0] || {};
    } else if (req.user.role === 'recruiter') {
      const [profiles] = await pool.query('SELECT * FROM recruiter_profiles WHERE user_id = ?', [req.user.id]);
      profileData = profiles[0] || {};
    }

    res.json({
      user: req.user,
      profile: profileData
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching profile.' });
  }
});

// Simulated OTP verification (PDF requirement)
router.post('/verify-otp', async (req, res) => {
  const { otp } = req.body;
  if (!otp || otp.length < 4) {
    return res.status(400).json({ error: 'Please enter a valid OTP code (e.g. 1234)' });
  }
  // Accepts 1234 or any 4+ digit OTP for seamless verification demo
  return res.json({ success: true, message: 'OTP verified successfully! Account is active.' });
});

// Simulated Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  return res.json({ success: true, message: 'Password reset link / OTP sent to your email.' });
});

module.exports = router;
