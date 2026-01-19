require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

/**
 * Environment Variables Required:
 *
 * MONGODB_URI    - MongoDB connection string (required)
 * JWT_SECRET     - JWT signing secret (min 32 chars, required)
 * ML_SERVICE_URL - Python ML service URL (e.g., http://localhost:8001, required)
 * PORT           - Server port (optional, defaults to 5000)
 * NODE_ENV       - Environment mode (optional, defaults to 'development')
 * CLIENT_URL     - CORS allowed origins (optional)
 */

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'ML_SERVICE_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(' Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Validate environment variable formats
const validations = [
  {
    name: 'JWT_SECRET',
    value: process.env.JWT_SECRET,
    validator: (val) => val && val.length >= 32,
    message: 'JWT_SECRET must be at least 32 characters long for security'
  },
  {
    name: 'MONGODB_URI',
    value: process.env.MONGODB_URI,
    validator: (val) => val && val.startsWith('mongodb'),
    message: 'MONGODB_URI must be a valid MongoDB connection string'
  },
  {
    name: 'ML_SERVICE_URL',
    value: process.env.ML_SERVICE_URL,
    validator: (val) => {
      try {
        const url = new URL(val);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    },
    message: 'ML_SERVICE_URL must be a valid HTTP/HTTPS URL (e.g., http://localhost:8001)'
  },
  {
    name: 'PORT',
    value: process.env.PORT,
    validator: (val) => !val || (!isNaN(val) && val > 0 && val < 65536),
    message: 'PORT must be a valid port number between 1 and 65535'
  }
];

const validationErrors = validations
  .map(validation => {
    if (!validation.validator(validation.value)) {
      return validation.message;
    }
    return null;
  })
  .filter(Boolean);

if (validationErrors.length > 0) {
  console.error('❌ Environment variable validation failed:');
  validationErrors.forEach(error => console.error(`   - ${error}`));
  process.exit(1);
}

console.log('✅ Environment variables validated successfully');

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Check ML service availability
    const getMLClient = require('./services/mlClient');
    const mlClient = getMLClient();
    const isMLHealthy = await mlClient.isHealthy();

    if (isMLHealthy) {
      console.log('🤖 ML service is available and healthy');
    } else {
      console.warn('⚠️  ML service is not reachable. AI features will return 503 errors.');
      console.warn('   Make sure the ML service is running and accessible.');
    }

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 Server listening on port ${PORT}`);
      console.log(`🔗 API available at: http://localhost:${PORT}/api`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
      if (isMLHealthy) {
        console.log(`🤖 ML service: ${process.env.ML_SERVICE_URL}`);
      }
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();