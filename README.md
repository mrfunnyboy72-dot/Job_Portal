# WorkPulse - Full Page-by-Page Job Portal

An end-to-end Job Portal application built with **React (Vite)**, **Node.js (Express)**, and **TiDB Cloud**.

## 🚀 Features (Based on PDF Workflow)
- **Multi-Role Support**: Candidate, Recruiter, and Admin Moderation.
- **Critical Business Rule**: Recruiter creates job ➔ Admin reviews ➔ Approved job becomes public ➔ Candidate can apply.
- **Candidate Journey**: Resume upload, direct job apply, real-time application tracker (`Applied -> Viewed -> Shortlisted -> Interview -> Selected / Rejected`).
- **Recruiter Pipeline**: Post job (Draft vs Submit for Approval), shortlist applicants, schedule interviews with dates and notes, hire or reject.
- **Admin Moderation**: Pending job approval/rejection queue, user block/unblock, and platform analytics.
- **TiDB Cloud Database**: Distributed MySQL-compatible serverless database.

## 🛠️ Project Structure
```text
job_portal/
├── backend/            # Express REST API + TiDB connection pool
│   ├── .env.example    # Environment variable template
│   ├── db.js           # TiDB pool + auto-schema initialization
│   ├── server.js       # API server entry
│   └── routes/         # Auth, Jobs, Applications, Admin, Profile
├── frontend/           # React 19 + Vite web application
│   ├── src/pages/      # Landing, Jobs, Details, Dashboards (Candidate, Recruiter, Admin)
│   ├── src/components/ # Navbar, Modals, Badges
│   └── src/context/    # Auth context & 1-click role switcher
└── .gitignore          # Strict ignore for .env, node_modules, dist
```

## 📦 Getting Started

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in your TiDB Cloud credentials in .env
npm install
node server.js
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
