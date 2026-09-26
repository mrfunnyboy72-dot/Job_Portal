const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// Register (Candidate or Recruiter)
router.post('/register', async (req, res) => {
  try {
    const { 
      name, email, password, role, phone, 
      company_name, company_industry, company_location, company_website 
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password and role are required.' });
    }

    if (!['candidate', 'recruiter'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either candidate or recruiter.' });
    }

    // Check existing by email or phone
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, phone, role, status) VALUES (?, ?, ?, ?, ?, "active")',
      [name.trim(), email.trim().toLowerCase(), password_hash, phone?.trim() || '', role]
    );

    const userId = result.insertId;

    // Create profile
    if (role === 'candidate') {
      await pool.query(
        'INSERT INTO candidate_profiles (user_id, completion_percentage, skills, education, experience) VALUES (?, 40, ?, ?, ?)',
        [userId, JSON.stringify(['General']), JSON.stringify([]), JSON.stringify([])]
      );
    } else if (role === 'recruiter') {
      await pool.query(`
        INSERT INTO recruiter_profiles (user_id, company_name, industry, location, website) 
        VALUES (?, ?, ?, ?, ?)
      `, [
        userId, 
        company_name?.trim() || `${name}'s Company`,
        company_industry?.trim() || 'Information Technology',
        company_location?.trim() || 'Bangalore, India',
        company_website?.trim() || null
      ]);
    }

    const token = jwt.sign({ id: userId, email: email.trim().toLowerCase(), role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful! Verification code sent.',
      token,
      user: { 
        id: userId, 
        name, 
        email: email.trim().toLowerCase(), 
        role, 
        phone: phone?.trim() || '',
        company_name: company_name || null
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login (Supports Email OR Mobile + Password)
router.post('/login', async (req, res) => {
  try {
    const identifier = (req.body.identifier || req.body.email || req.body.phone || '').trim();
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email or Mobile number and password are required.' });
    }

    // Lookup user by either email or mobile number
    const [users] = await pool.query(`
      SELECT * FROM users 
      WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) 
         OR REPLACE(REPLACE(phone, ' ', ''), '-', '') = REPLACE(REPLACE(?, ' ', ''), '-', '')
    `, [identifier, identifier]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'No account found with this email or mobile number.' });
    }

    const user = users[0];
    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Your account has been blocked by Admin. Contact support.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid password. Please try again or use OTP login.' });
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

// Send OTP (for OTP Login, Verification, or Password Reset)
router.post('/send-otp', async (req, res) => {
  try {
    const identifier = (req.body.identifier || req.body.email || req.body.phone || '').trim();
    if (!identifier) {
      return res.status(400).json({ error: 'Email or mobile number is required.' });
    }

    // Check if account exists
    const [users] = await pool.query(`
      SELECT id, name, email, phone, role FROM users 
      WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) 
         OR REPLACE(REPLACE(phone, ' ', ''), '-', '') = REPLACE(REPLACE(?, ' ', ''), '-', '')
    `, [identifier, identifier]);

    // Demo OTP is 1234
    res.json({
      success: true,
      message: `OTP sent successfully to ${identifier}. Use code: 1234`,
      otpPreview: '1234',
      userExists: users.length > 0,
      userRole: users[0]?.role || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP.' });
  }
});

// Login via OTP (Passwordless Login)
router.post('/login-otp', async (req, res) => {
  try {
    const identifier = (req.body.identifier || req.body.email || req.body.phone || '').trim();
    const { otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({ error: 'Email/Mobile and OTP code are required.' });
    }

    if (otp !== '1234' && otp.length < 4) {
      return res.status(400).json({ error: 'Invalid OTP code. Please enter 1234.' });
    }

    const [users] = await pool.query(`
      SELECT * FROM users 
      WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) 
         OR REPLACE(REPLACE(phone, ' ', ''), '-', '') = REPLACE(REPLACE(?, ' ', ''), '-', '')
    `, [identifier, identifier]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'No user registered with this email or mobile. Please register first.' });
    }

    const user = users[0];
    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Your account has been blocked by Admin.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    let companyName = null;
    if (user.role === 'recruiter') {
      const [recProfiles] = await pool.query('SELECT company_name FROM recruiter_profiles WHERE user_id = ?', [user.id]);
      if (recProfiles.length > 0) companyName = recProfiles[0].company_name;
    }

    res.json({
      message: 'OTP verified! Logged in successfully.',
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
    res.status(500).json({ error: 'Server error during OTP login.' });
  }
});

// Verify Registration OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp || otp.length < 4) {
      return res.status(400).json({ error: 'Please enter a valid 4-digit OTP code (e.g. 1234)' });
    }
    return res.json({ 
      success: true, 
      message: 'OTP verified successfully! Account is active and ready.' 
    });
  } catch (err) {
    res.status(500).json({ error: 'Verification error.' });
  }
});

// Reset Password (Forgot password -> OTP -> New Password -> Login)
router.post('/reset-password', async (req, res) => {
  try {
    const identifier = (req.body.identifier || req.body.email || req.body.phone || '').trim();
    const { otp, new_password } = req.body;

    if (!identifier || !otp || !new_password) {
      return res.status(400).json({ error: 'Identifier, OTP code, and new password are required.' });
    }

    if (otp !== '1234' && otp.length < 4) {
      return res.status(400).json({ error: 'Invalid OTP code. Please use 1234.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const [users] = await pool.query(`
      SELECT id, email FROM users 
      WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) 
         OR REPLACE(REPLACE(phone, ' ', ''), '-', '') = REPLACE(REPLACE(?, ' ', ''), '-', '')
    `, [identifier, identifier]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, users[0].id]);

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password.' });
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

module.exports = router;
