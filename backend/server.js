/**
 * TraceBack - Campus Lost & Found Backend Server
 * Vivekanand Education Society (VES) - Hashu Advani Memorial Complex (HAMC), Chembur
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');
const adapter = require('./data/adapter');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

// Trust reverse proxy (API Gateway / Load Balancer) for client IP and secure cookies
app.set('trust proxy', 1);

// Ensure data and upload directories exist
const isLambda = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const uploadDir = isLambda
  ? path.resolve('/tmp', 'uploads')
  : path.resolve(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    logger.warn('Could not create upload directory', { error: err.message });
  }
}

// 1. CORS Configuration
const isProduction = process.env.NODE_ENV === 'production';
const configuredOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman, automated test runners)
    if (!origin) {
      return callback(null, true);
    }
    const normalizedOrigin = origin.replace(/\/+$/, '');
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    if (!isProduction) {
      return callback(null, true); // Permissive in local development
    }
    return callback(new Error(`CORS policy violation: Origin ${origin} not permitted.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
}));

// 2. Request Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 3. Static Uploads Folder (Local Development)
app.use('/uploads', express.static(uploadDir));

// 4. Global API Rate Limiting
app.use('/api', apiLimiter);

// 5. Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'TraceBack HAMC Backend',
    version: '1.0.0',
    adapter: process.env.DATA_ADAPTER || 'local',
    awsPrepared: true,
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'TraceBack HAMC Backend',
    version: '1.0.0',
    adapter: process.env.DATA_ADAPTER || 'local',
  });
});

// 6. Mount API Routes
app.use(process.env.API_PREFIX || '/api', routes);

// 7. Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// 8. Server Start (only listen if directly run, or if explicitly auto-started)
let server;
if (require.main === module || process.env.AUTO_START_SERVER === 'true') {
  server = app.listen(PORT, () => {
    logger.info(`TraceBack HAMC Backend running on port ${PORT}`);
    logger.info(`API Base URL: http://localhost:${PORT}${process.env.API_PREFIX || '/api'}`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
    logger.info(`Frontend origin configured: ${CLIENT_ORIGIN}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully.');
    if (server) {
      server.close(() => {
        logger.info('Server closed.');
        process.exit(0);
      });
    }
  });
}

module.exports = app;
