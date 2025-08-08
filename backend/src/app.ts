import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { swaggerUi, specs } from './config/swagger';

// Import routes
import authRouter from './routes/auth';
import customersRouter from './routes/customers';
import ordersRouter from './routes/orders';
import productsRouter from './routes/products';
import dashboardRouter from './routes/dashboard';
import reportsRouter from './routes/reports';
import uploadsRouter from './routes/uploads';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // In development, allow all origins for easier testing
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      return callback(null, true);
    }
    
    // In production, only allow specific origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:8000',
      'http://127.0.0.1:8000'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Apply CORS to all routes
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Serve static files from uploads directory
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for uploads
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Rate limiting configuration
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

const rateLimitConfig = {
  windowMs: isDevelopment ? 60 * 1000 : 15 * 60 * 1000, // 1 minute in dev, 15 minutes in production
  max: isDevelopment ? 1000 : 100, // 1000 requests per minute in dev, 100 per 15min in production
  message: JSON.stringify({
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  }),
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req: express.Request) => {
    // Skip rate limiting for health checks and development environment
    if (isDevelopment || req.path === '/health') {
      return true;
    }
    return false;
  },
  handler: (req: express.Request, res: express.Response) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many requests, please try again later.',
      timestamp: new Date().toISOString()
    });
  }
};

// Apply rate limiting to API routes
const limiter = rateLimit(rateLimitConfig);
app.use('/api/', limiter);

// Log rate limit events in development
if (isDevelopment) {
  app.use((req, res, next) => {
    const remaining = res.getHeader('X-RateLimit-Remaining');
    if (remaining && parseInt(remaining as string) < 10) {
      console.warn(`Rate limit warning: ${remaining} requests remaining`);
    }
    next();
  });
}

// CORS configuration is already applied at the top level
// This ensures all routes have CORS enabled

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint - redirect to API documentation or provide API info
app.get('/', (req, res) => {
  res.json({
    message: 'Toy Store Management API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      customers: '/api/customers',
      orders: '/api/orders',
      products: '/api/products',
      dashboard: '/api/dashboard',
      reports: '/api/reports'
    },
    documentation: '/api-docs'
  });
});

app.use((req, res, next) => {
  console.log('Request Headers:', req.headers);
  console.log('Request URL:', req.originalUrl);
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/uploads', uploadsRouter);

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;