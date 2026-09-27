const app = require('../backend/app');
const { initDatabase } = require('../backend/db');

let isInitialized = false;

module.exports = async (req, res) => {
  if (!isInitialized) {
    try {
      await initDatabase();
      isInitialized = true;
    } catch (err) {
      console.error('Vercel serverless DB initialization error:', err);
    }
  }
  return app(req, res);
};

