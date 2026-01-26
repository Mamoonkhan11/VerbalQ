const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const historyRoutes = require('./routes/history');
const adminRoutes = require('./routes/admin');
const feedbackRoutes = require('./routes/feedback');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Create Express app
const app = express();

// Security middleware - comprehensive security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Remove X-Powered-By header for security
app.disable('x-powered-by');

// CORS configuration with restricted origins
const allowedOrigins = process.env.CLIENT_URL ?
  process.env.CLIENT_URL.split(',') :
  ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging - clean and readable format
if (process.env.NODE_ENV === 'development') {
  app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));
}

// Body parsing middleware with size limits for security
app.use(express.json({
  limit: '5mb',
  strict: true
}));
app.use(express.urlencoded({
  extended: true,
  limit: '5mb'
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const uptime = process.uptime();
  const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;

  res.status(200).json({
    status: 'OK',
    uptime: uptimeFormatted,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Legacy health endpoint (backward compatibility)
app.get('/health', (req, res) => {
  res.redirect('/api/health');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);

// 404 handler for undefined routes
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;