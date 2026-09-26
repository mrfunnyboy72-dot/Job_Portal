const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_job_portal_tidb_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please login.' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }

    try {
      const [users] = await pool.query('SELECT id, name, email, role, status FROM users WHERE id = ?', [decoded.id]);
      if (users.length === 0) {
        return res.status(401).json({ error: 'User no longer exists.' });
      }

      if (users[0].status === 'blocked') {
        return res.status(403).json({ error: 'Your account has been suspended by the platform administrator.' });
      }

      req.user = users[0];
      next();
    } catch (dbErr) {
      return res.status(500).json({ error: 'Database authentication error.' });
    }
  });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden. Requires one of roles: [${roles.join(', ')}]` });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole, JWT_SECRET };
