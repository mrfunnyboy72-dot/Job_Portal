const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.TIDB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.TIDB_PORT || '4000', 10),
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE || 'job_portal',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 5,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  queueLimit: 0
});

async function initDatabase() {
  try {
    console.log('🔄 Initializing TiDB database and tables...');

    // 1. Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        role ENUM('candidate', 'recruiter', 'admin') NOT NULL,
        status ENUM('active', 'blocked') DEFAULT 'active',
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Candidate Profiles
    await pool.query(`
      CREATE TABLE IF NOT EXISTS candidate_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        headline VARCHAR(255),
        bio TEXT,
        education JSON,
        experience JSON,
        skills JSON,
        resume_url VARCHAR(500),
        resume_name VARCHAR(255),
        completion_percentage INT DEFAULT 30,
        location VARCHAR(150),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Recruiter Profiles
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recruiter_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        company_name VARCHAR(255) NOT NULL,
        company_logo VARCHAR(500),
        company_about TEXT,
        website VARCHAR(255),
        industry VARCHAR(150),
        location VARCHAR(150),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Jobs table (Notice status: draft, pending, approved, rejected)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recruiter_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        job_type ENUM('Full-time', 'Part-time', 'Remote', 'Contract', 'Internship') DEFAULT 'Full-time',
        experience_level VARCHAR(50) DEFAULT '1-3 Years',
        location VARCHAR(150) NOT NULL,
        salary_min INT DEFAULT 0,
        salary_max INT DEFAULT 0,
        description TEXT NOT NULL,
        requirements TEXT,
        skills JSON,
        status ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'pending',
        rejection_reason TEXT,
        views_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Applications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        candidate_id INT NOT NULL,
        resume_url VARCHAR(500),
        cover_note TEXT,
        status ENUM('applied', 'viewed', 'shortlisted', 'interview', 'selected', 'rejected') DEFAULT 'applied',
        interview_date DATETIME NULL,
        interview_notes TEXT,
        meeting_link VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure meeting_link column exists if applications table was created prior
    try {
      await pool.query(`ALTER TABLE applications ADD COLUMN meeting_link VARCHAR(500) NULL;`);
    } catch (e) {
      // Column might already exist, safe to ignore
    }

    // 6. Saved Jobs table (Bookmark feature)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id INT NOT NULL,
        job_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_saved (candidate_id, job_id),
        FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Categories
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(50)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed default categories if none exist
    const [catRows] = await pool.query('SELECT COUNT(*) as count FROM categories');
    if (catRows[0].count === 0) {
      await pool.query(`
        INSERT INTO categories (name, icon) VALUES
        ('Software Development', 'code'),
        ('Design & Creative', 'palette'),
        ('Data & AI', 'brain'),
        ('Sales & Marketing', 'trending-up'),
        ('Product Management', 'layers'),
        ('Finance & Accounts', 'dollar-sign'),
        ('Customer Support', 'headphones'),
        ('Human Resources', 'users')
      `);
      console.log('✅ Categories seeded');
    }

    // 8. Companies table (Managed exclusively by Admin)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        logo_url VARCHAR(500),
        website VARCHAR(255),
        industry VARCHAR(150),
        location VARCHAR(150),
        about TEXT,
        verified BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const [compRows] = await pool.query('SELECT COUNT(*) as count FROM companies');
    if (compRows[0].count === 0) {
      await pool.query(`
        INSERT INTO companies (name, logo_url, website, industry, location, about) VALUES
        ('TechCorp Inc.', 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80', 'https://techcorp.example.com', 'Information Technology', 'Bangalore, India', 'Global enterprise technology leader empowering cloud solutions.'),
        ('Zoho Corporation', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80', 'https://www.zoho.com', 'SaaS & Enterprise', 'Chennai, India', 'Leading web-based online office suite and business applications.'),
        ('Freshworks', 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80', 'https://www.freshworks.com', 'Customer Engagement Software', 'Chennai, India', 'Empowering front-line workers with intuitive modern software.'),
        ('TCS (Tata Consultancy)', 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=150&auto=format&fit=crop&q=80', 'https://www.tcs.com', 'IT Consulting & Services', 'Mumbai, India', 'Pioneer in global IT services, consulting, and business solutions.'),
        ('Swiggy', 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=150&auto=format&fit=crop&q=80', 'https://www.swiggy.com', 'Food & Quick Commerce', 'Bangalore, India', 'Indias leading on-demand convenience and delivery platform.')
      `);
      console.log('✅ Top companies seeded');
    }

    // 9. Platform Settings table (For A08 Settings)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const [settingRows] = await pool.query('SELECT COUNT(*) as count FROM platform_settings');
    if (settingRows[0].count === 0) {
      await pool.query(`
        INSERT INTO platform_settings (setting_key, setting_value) VALUES
        ('require_admin_approval', 'true'),
        ('allow_candidate_registration', 'true'),
        ('allow_recruiter_registration', 'true'),
        ('max_jobs_per_recruiter', '50'),
        ('enable_email_alerts', 'true'),
        ('maintenance_mode', 'false')
      `);
      console.log('✅ Platform settings initialized');
    }

    // Seed initial users (Admin, Recruiter, Candidate)
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      const adminPass = await bcrypt.hash('admin@321', 10);
      const recruiterPass = await bcrypt.hash('recruiter123', 10);
      const candidatePass = await bcrypt.hash('candidate123', 10);

      // 1. Admin
      const [adminRes] = await pool.query(`
        INSERT INTO users (name, email, password_hash, phone, role) 
        VALUES ('Platform Admin', 'admin321@admin.com', ?, '+91 9876543210', 'admin')
      `, [adminPass]);

      // 2. Recruiter
      const [recruiterRes] = await pool.query(`
        INSERT INTO users (name, email, password_hash, phone, role) 
        VALUES ('Sarah Connor (HR Lead)', 'recruiter@techcorp.com', ?, '+91 9876543211', 'recruiter')
      `, [recruiterPass]);

      const recruiterId = recruiterRes.insertId;
      await pool.query(`
        INSERT INTO recruiter_profiles (user_id, company_name, company_logo, company_about, website, industry, location)
        VALUES (?, 'TechCorp Global', 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150', 'Leading enterprise cloud and software solutions worldwide.', 'https://techcorp.example.com', 'Information Technology', 'Bangalore / Remote')
      `, [recruiterId]);

      // 3. Candidate
      const [candidateRes] = await pool.query(`
        INSERT INTO users (name, email, password_hash, phone, role) 
        VALUES ('Arun Kumar', 'candidate@example.com', ?, '+91 9876543212', 'candidate')
      `, [candidatePass]);

      const candidateId = candidateRes.insertId;
      await pool.query(`
        INSERT INTO candidate_profiles (user_id, headline, bio, education, experience, skills, resume_url, resume_name, completion_percentage, location)
        VALUES (?, 'Full Stack React & Node Developer', 'Passionate developer with 3 years experience building responsive web apps.', 
        ?, ?, ?, 'https://example.com/resumes/arun_resume.pdf', 'Arun_Kumar_Resume.pdf', 85, 'Chennai, India')
      `, [
        candidateId,
        JSON.stringify([{ degree: 'B.Tech Computer Science', college: 'Anna University', year: '2023' }]),
        JSON.stringify([{ role: 'Frontend Engineer', company: 'NovaSoft', duration: '2023 - Present' }]),
        JSON.stringify(['React', 'Node.js', 'Express', 'TiDB', 'JavaScript', 'Tailwind/CSS', 'MySQL'])
      ]);

      // 4. Sample Jobs
      // Job 1: Approved (Public)
      const [job1Res] = await pool.query(`
        INSERT INTO jobs (recruiter_id, title, category, job_type, experience_level, location, salary_min, salary_max, description, requirements, skills, status)
        VALUES (?, 'Senior Full Stack Engineer', 'Software Development', 'Full-time', '3-5 Years', 'Remote / Chennai', 1200000, 1800000, 
        'We are seeking an experienced Full Stack Engineer to architect and build scalable cloud applications.', 
        '• 3+ years experience with React, Node.js and SQL\n• Experience with RESTful APIs\n• Strong problem solving and system design skills',
        ?, 'approved')
      `, [recruiterId, JSON.stringify(['React', 'Node.js', 'MySQL', 'Express', 'TypeScript'])]);

      // Job 2: Approved (Public)
      await pool.query(`
        INSERT INTO jobs (recruiter_id, title, category, job_type, experience_level, location, salary_min, salary_max, description, requirements, skills, status)
        VALUES (?, 'UI/UX Product Designer', 'Design & Creative', 'Remote', '2-4 Years', 'Bangalore', 800000, 1400000, 
        'Join our creative team to craft intuitive, modern user experiences for enterprise products.', 
        '• Proficiency in Figma & design systems\n• Solid portfolio of shipped web apps\n• User research and wireframing',
        ?, 'approved')
      `, [recruiterId, JSON.stringify(['Figma', 'UI/UX', 'Wireframing', 'Prototyping'])]);

      // Job 3: Pending (For Admin approval flow testing!)
      await pool.query(`
        INSERT INTO jobs (recruiter_id, title, category, job_type, experience_level, location, salary_min, salary_max, description, requirements, skills, status)
        VALUES (?, 'DevOps & Cloud Engineer', 'Software Development', 'Full-time', '2-5 Years', 'Hyderabad', 1100000, 1600000, 
        'Looking for an engineer to manage CI/CD pipelines, container orchestration, and cloud infrastructure.', 
        '• Experience with Docker, Kubernetes, AWS\n• CI/CD automation\n• Monitoring and security best practices',
        ?, 'pending')
      `, [recruiterId, JSON.stringify(['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'])]);

      // 5. Sample Application for candidate
      await pool.query(`
        INSERT INTO applications (job_id, candidate_id, resume_url, cover_note, status)
        VALUES (?, ?, 'https://example.com/resumes/arun_resume.pdf', 'I am very excited about this role and have extensive experience in React & Node.', 'shortlisted')
      `, [job1Res.insertId, candidateId]);

      console.log('✅ Default users, sample jobs, and applications seeded successfully!');
    }

    // Ensure requested master admin exists: admin321@admin.com / admin@321
    const masterAdminPass = await bcrypt.hash('admin@321', 10);
    const [existingAdmin] = await pool.query('SELECT id FROM users WHERE email = ?', ['admin321@admin.com']);
    if (existingAdmin.length === 0) {
      await pool.query(`
        INSERT INTO users (name, email, password_hash, phone, role, status)
        VALUES ('Master Administrator', 'admin321@admin.com', ?, '+91 9876543210', 'admin', 'active')
      `, [masterAdminPass]);
      console.log('✅ Created master admin: admin321@admin.com');
    } else {
      await pool.query(`
        UPDATE users 
        SET password_hash = ?, role = 'admin', status = 'active'
        WHERE email = 'admin321@admin.com'
      `, [masterAdminPass]);
      console.log('✅ Updated master admin: admin321@admin.com');
    }

    console.log('✅ TiDB Database initialized and ready.');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

module.exports = { pool, initDatabase };
