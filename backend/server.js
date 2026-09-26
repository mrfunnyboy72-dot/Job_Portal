const app = require('./app');
const { initDatabase } = require('./db');

const PORT = process.env.PORT || 5000;

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

module.exports = app;
