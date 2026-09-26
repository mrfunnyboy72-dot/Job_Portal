const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Testing TiDB Cloud connection from environment variables...');
    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      port: parseInt(process.env.TIDB_PORT || '4000', 10),
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE || 'job_portal',
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    });

    console.log('✅ Connected successfully to TiDB Cloud!');
    const [rows] = await connection.query('SELECT VERSION() as version, DATABASE() as db');
    console.log('Server info:', rows);
    await connection.end();
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
}

testConnection();
