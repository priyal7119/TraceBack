# TraceBack Backend — Campus Lost & Found API

Backend service for **TraceBack**, the dedicated Lost & Found platform for the Vivekanand Education Society (VES) community at **Hashu Advani Memorial Complex (HAMC)**, Collector's Colony, Chembur, Mumbai – 400074.

---

## 1. Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Authentication**: JSON Web Tokens (JWT) & HTTP-Only Secure Cookies
- **Password Security**: bcryptjs (10 salt rounds)
- **Data Persistence**: Pluggable Data Adapter Layer (currently using atomic JSON store, ready for Amazon DynamoDB DocumentClient swap on Day 3)
- **Matching Engine**: Configurable Weighted Scoring Algorithm
- **AWS SDK v3**: Prepared client wrappers for Amazon S3, DynamoDB, and Amazon Rekognition

---

## 2. Directory Structure

```
backend/
├── config/
│   ├── aws.js              # AWS SDK v3 clients & graceful local dev fallback
│   └── matching.js         # Configurable weighted matching parameters
├── controllers/
│   ├── adminController.js         # Custodial stats, moderation & user status
│   ├── authController.js          # Register, Login, Logout, Forgot/Reset
│   ├── claimController.js         # Item ownership claims & verification
│   ├── disputeController.js       # Arbitration & dispute resolution
│   ├── imageController.js         # Presigned upload URLs & Rekognition scan
│   ├── matchController.js         # AI match retrieval & decision handling
│   ├── notificationController.js  # In-app notifications
│   ├── reportController.js        # Lost and Found report CRUD
│   └── userController.js          # User profile & password updates
├── data/
│   ├── adapter.js          # Database abstraction layer (DynamoDB compatible)
│   └── localStore.json     # Local persistent store seeded with HAMC records
├── middleware/
│   ├── authMiddleware.js   # JWT verification (Cookie & Bearer header)
│   ├── errorMiddleware.js  # Centralized 404 & error handlers
│   ├── rateLimiter.js      # Brute-force protection for auth & API routes
│   ├── roleMiddleware.js   # Server-side RBAC (enforces 'admin' role)
│   └── validationMiddleware.js # Input sanitization and payload validation
├── models/
│   ├── Claim.js
│   ├── Dispute.js
│   ├── Match.js
│   ├── Notification.js
│   ├── Report.js
│   └── User.js
├── routes/
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── claimRoutes.js
│   ├── disputeRoutes.js
│   ├── imageRoutes.js
│   ├── index.js
│   ├── matchRoutes.js
│   ├── notificationRoutes.js
│   ├── reportRoutes.js
│   └── userRoutes.js
├── services/
│   ├── adminService.js
│   ├── authService.js
│   ├── claimService.js
│   ├── disputeService.js
│   ├── imageService.js
│   ├── matchingService.js  # 40% Image, 25% Category, 20% Location, 15% Date
│   ├── notificationService.js
│   └── reportService.js
├── utils/
│   ├── hashHelper.js       # bcrypt password hashing & verification
│   ├── jwtHelper.js        # Token generation & verification
│   ├── logger.js           # Safe logging with secret redaction
│   ├── runServerAndTest.js # In-process runner for CI/testing
│   ├── seed.js             # Pre-populates accounts & HAMC demo reports
│   ├── testSuite.js        # 23-point automated test suite
│   └── validators.js       # Format checks
├── .env.example
├── .env
├── package.json
└── server.js               # Express application entrypoint
```

---

## 3. Environment Configuration (`.env`)

Create `.env` inside `backend/` from `.env.example`:

```bash
PORT=5000
NODE_ENV=development
API_PREFIX=/api
CLIENT_ORIGIN=http://localhost:3000

# Authentication & Security
JWT_SECRET=traceback_ves_hamc_super_secure_jwt_secret_key_2026_dev
JWT_EXPIRES_IN=7d
COOKIE_NAME=traceback_token

# Seed Accounts
INITIAL_ADMIN_EMAIL=admin.hamc@traceback.org
INITIAL_ADMIN_PASSWORD=AdminPassword123!
INITIAL_ADMIN_NAME=Prof. Rajesh Kulkarni

INITIAL_USER_EMAIL=aarav.sharma@campus.ves.ac.in
INITIAL_USER_PASSWORD=Password123!
INITIAL_USER_NAME=Aarav Sharma

# Storage Adapter
DATA_ADAPTER=local
LOCAL_DATA_FILE=./data/localStore.json

# AWS Configuration (Placeholder for Day 3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=traceback-campus-lost-and-found-hamc
AWS_DYNAMODB_TABLE_PREFIX=traceback_
AWS_REKOGNITION_MIN_CONFIDENCE=80
```

---

## 4. Setup and Run Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Seed Initial Database
Seeds initial HAMC Chembur campus reports, users, matches, claims, and sets hashed bcrypt passwords for the admin and student accounts:
```bash
npm run seed
```

### 3. Start the Backend Server
```bash
npm start
# Or for auto-reload during development:
npm run dev
```
The server will start at `http://localhost:5000`.

### 4. Run Automated Test Suite
```bash
node utils/runServerAndTest.js
```

---

## 5. Seed Demonstration Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Campus Admin** | Prof. Rajesh Kulkarni | `admin.hamc@traceback.org` | `AdminPassword123!` |
| **Student** | Aarav Sharma | `aarav.sharma@campus.ves.ac.in` | `Password123!` |

---

## 6. Complete API Reference

All routes are prefixed with `/api`.

### Authentication
- `POST /api/auth/register` — Register a new student/staff account
- `POST /api/auth/login` — Sign in, issues JWT & sets HTTP-only cookie
- `POST /api/auth/logout` — Clears authentication cookie
- `GET  /api/auth/me` — Verify active session and return current user
- `POST /api/auth/forgot-password` — Generate dev password reset token
- `POST /api/auth/reset-password` — Reset password using token

### User Profile (Protected)
- `GET  /api/users/profile` — Get logged-in user profile
- `PUT  /api/users/profile` — Update name, department, phone, bio
- `PUT  /api/users/change-password` — Change password (requires current password)

### Lost & Found Reports
- `GET  /api/reports/lost` — View public lost item reports (supports `category`, `search`)
- `GET  /api/reports/found` — View public found item listings (supports `category`, `location`, `search`)
- `POST /api/reports/lost` — Create a lost item report (triggers automated matching)
- `POST /api/reports/found` — Create a found item report (triggers automated matching)
- `GET  /api/reports/my-reports` — View reports submitted by the logged-in user
- `GET  /api/reports/:id` — View specific report details (increments view count)
- `PUT  /api/reports/:id` — Update own report
- `DELETE /api/reports/:id` — Cancel/delete own report

### Matching Engine (Protected)
- `GET  /api/matches` — Get AI match suggestions for user's reports
- `GET  /api/matches/:id` — Get match details and 4-factor scoring breakdown
- `POST /api/matches/:id/decision` — Accept or reject a suggested match
- `PATCH /api/matches/:id/status` — Update match status

### Image Upload & AI Rekognition
- `POST /api/images/upload-url` — Request S3 presigned URL (or local dev handler)
- `POST /api/images/local-upload` — Handle local image upload in dev mode
- `POST /api/images/analyze` — Computer vision label detection simulation

### Ownership Claims (Protected)
- `POST /api/claims` — Submit an ownership claim for a found item
- `GET  /api/claims/my-claims` — Get user's submitted claims
- `GET  /api/claims` — Admin: view all claims
- `PATCH /api/claims/:id` — Admin: approve or reject claim

### Ownership Disputes (Protected)
- `POST /api/disputes` — Submit an ownership dispute
- `GET  /api/disputes` — Admin: view all open disputes
- `POST /api/disputes/:id/resolve` — Admin: record binding arbitration decision

### In-App Notifications (Protected)
- `GET   /api/notifications` — Get user's notifications and unread count
- `PATCH /api/notifications/:id/read` — Mark notification as read
- `PATCH /api/notifications/read-all` — Mark all notifications as read

### Campus Administrator APIs (Protected, Admin Only)
- `GET   /api/admin/overview` — Dashboard summary metrics and resolution rates
- `GET   /api/admin/users` — Directory of registered accounts
- `PATCH /api/admin/users/:id` — Update user status (`active`, `suspended`) or role
- `GET   /api/admin/reports` — View all reports across campus
- `PATCH /api/admin/reports/:id/status` — Update report status (`active`, `archived`, `claimed`)
- `GET   /api/admin/matches` — View all system matches
- `GET   /api/admin/archived-reports` — View historical archive

---

## 7. Matching Algorithm Details

The matching service calculates a combined percentage score (0% – 100%) based on four weighted factors configured in `config/matching.js`:

$$\text{Match Score} = 0.40 \times \text{Image Similarity} + 0.25 \times \text{Category Match} + 0.20 \times \text{Location Proximity} + 0.15 \times \text{Date Proximity}$$

- **Image Label Similarity (40%)**: Jaccard similarity across item visual tags.
- **Category Similarity (25%)**: Exact category match = 100%, different category = 0%.
- **Location Similarity (20%)**: Proximity clustering around HAMC landmarks (Library, Lab 402, Quadrangle, Security Cabin, Canteen).
- **Date Proximity (15%)**: Higher scores for reports within 0–3 days; degrades smoothly up to 60 days.
- **Threshold**: Scores $\ge 50\%$ generate an automatic match suggestion. Scores $\ge 85\%$ are flagged as **High Confidence**.

---

## 8. AWS 5-Service Architecture Preparation (Day 3 Ready)

The backend code is modularized to map directly to AWS deployment targets:
1. **Amazon S3**: `services/imageService.js` and `config/aws.js` generate S3 presigned URLs via `@aws-sdk/s3-request-presigner`.
2. **Amazon API Gateway**: Routes and JSON response format follow REST conventions ready for proxy integration.
3. **AWS Lambda**: Controllers and services use clean request/response interfaces that wrap into Lambda event handlers with `serverless-http` or `@vendia/serverless-express`.
4. **Amazon DynamoDB**: `data/adapter.js` defines an asynchronous repository interface (`find`, `findById`, `create`, `update`, `delete`) matching DynamoDB DocumentClient commands (`PutCommand`, `GetCommand`, `QueryCommand`, `UpdateCommand`, `DeleteCommand`).
5. **Amazon Rekognition**: `config/aws.js` and `imageController.js` are prepared to call `DetectLabelsCommand` using `@aws-sdk/client-rekognition`.
