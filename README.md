# TraceBack — Campus Lost & Found Platform

**TraceBack** is a full-stack Lost & Found web application tailored for the **Vivekanand Education Society (VES)** community at **Hashu Advani Memorial Complex (HAMC)**, Collector's Colony, R.C. Marg, Chembur, Mumbai, Maharashtra – 400074.

The platform assists students, teaching faculty, non-teaching staff, and campus visitors in reporting misplaced belongings, discovering turned-in items, validating claims through AI-assisted matching, and coordinating custody resolution with security staff.

---

## Architecture Overview

```
TraceBack/
├── frontend/               # React 18 + Vite + Tailwind CSS (24 Complete Pages)
│   ├── src/
│   │   ├── components/     # Common badges, forms, image uploader, navigation
│   │   ├── context/        # AuthContext (JWT/Cookie) & DataContext (API state)
│   │   ├── data/           # HAMC mock fixtures & fallback sample data
│   │   ├── layouts/        # PublicLayout, AuthLayout, UserLayout, AdminLayout
│   │   ├── pages/          # 24 Functional pages across Public, Auth, User, Admin
│   │   ├── routes/         # AppRoutes & ProtectedRoute (role-guarded)
│   │   └── services/       # Centralized Axios API services
│   └── package.json
│
├── backend/                # Node.js + Express.js REST API
│   ├── config/             # AWS SDK v3 setup & configurable matching weights
│   ├── controllers/        # Request handlers for 9 resource domains
│   ├── data/               # DynamoDB-compatible local JSON repository adapter
│   ├── middleware/         # JWT auth, server-side RBAC, validation, rate limiting
│   ├── models/             # User, Report, Match, Notification, Claim, Dispute
│   ├── routes/             # Modular REST endpoints (/api)
│   ├── services/           # Business logic & weighted matching engine
│   ├── utils/              # bcrypt hashing, JWT helpers, test suite, seed script
│   └── server.js           # Express application entrypoint
│
└── README.md
```

---

## Planned AWS 5-Service Architecture

TraceBack is designed to integrate with exactly five AWS services on Day 3:
1. **Amazon S3**: Secure item image storage via presigned upload URLs.
2. **Amazon API Gateway**: Serverless REST endpoint routing and throttling.
3. **AWS Lambda**: Scalable compute for report processing and authentication.
4. **Amazon DynamoDB**: Low-latency NoSQL persistence for reports, claims, and users.
5. **Amazon Rekognition**: Computer vision analysis for image label similarity.

*Note: In the current development stage, a local JSON-based data adapter and local image upload handler are active until AWS credentials are provided.*

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Seed the database with initial HAMC campus data & bcrypt accounts
npm run seed

# Start backend server (runs on http://localhost:5000)
npm start
```

### 3. Frontend Setup
In a separate terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start frontend dev server (runs on http://localhost:3000)
npm run dev
```

Visit **http://localhost:3000** in your web browser.

---

## Demonstration Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Campus Admin** | Prof. Rajesh Kulkarni | `admin.hamc@traceback.org` | `AdminPassword123!` |
| **Student** | Aarav Sharma | `aarav.sharma@campus.ves.ac.in` | `Password123!` |

*(One-click instant login buttons are also provided on the Login page for rapid demonstration).*

---

## Automated Test Results

The backend includes an automated end-to-end test suite (`backend/utils/runServerAndTest.js`) testing all 14 required workflows:

```bash
cd backend
node utils/runServerAndTest.js
```

**Results: 23 PASSED, 0 FAILED**
- Healthcheck endpoint
- Student login & JWT issuance
- Admin login & role verification
- Protected profile retrieval
- Server-side RBAC blocking student from admin endpoints (403 Forbidden)
- Admin overview dashboard retrieval
- Public lost & found listings
- Report creation & automated matching trigger
- 4-factor weighted score calculation (Image 40%, Category 25%, Location 20%, Date 15%)
- Match decision acceptance
- Ownership claim submission & admin approval
- Ownership dispute filing & admin arbitration
- In-app notification creation & mark-as-read
- Presigned image upload URL generation
- Secure password reset token workflow
- New user registration with bcrypt password hashing
