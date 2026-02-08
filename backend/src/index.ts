import dotenv from 'dotenv';
import path from 'path';
import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import logger from './utils/logger';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Urumi Backend API',
    version: '1.0.0',
    description: 'Kubernetes ecommerce store provisioning platform',
    endpoints: {
      health: '/api/health',
      stores: '/api/stores'
    }
  });
});

// Error handling (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });

  // Log startup information
  logger.info('Configuration', {
    database: process.env.DATABASE_URL ? 'configured' : 'not configured',
    kubeconfig: process.env.KUBECONFIG || 'default',
    helmChartPath: process.env.HELM_CHART_PATH || '../helm/store',
    maxStores: process.env.MAX_STORES || '50',
    environment: process.env.ENVIRONMENT || 'local'
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack
  });
  // In production, you might want to exit the process
  // process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  // Exit the process - the app is in an undefined state
  process.exit(1);
});

export default app;
