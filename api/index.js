// Vercel serverless function for Easy Gift Search API
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import API status display
const { displayAPIStatus } = require('../backend/config/apiStatus');

// Create Express app
const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:8080',
  'https://easy-gift-search.vercel.app',
  'https://easy-gift-git-main-jlucasjavas-projects.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug environment variables on startup
console.log('🚀 VERCEL SERVERLESS FUNCTION STARTING...');
console.log('🔍 Environment Variables Status:');
console.log(`USE_REAL_SHOPEE_API: ${process.env.USE_REAL_SHOPEE_API}`);
console.log(`USE_REAL_REALTIME_API: ${process.env.USE_REAL_REALTIME_API}`);
console.log(`SHOPEE_SCRAPER_API_KEY: ${process.env.SHOPEE_SCRAPER_API_KEY ? 'SET' : 'NOT SET'}`);
console.log(`RAPIDAPI_KEY: ${process.env.RAPIDAPI_KEY ? 'SET' : 'NOT SET'}`);
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET'}`);

// Display API status
try {
  displayAPIStatus();
} catch (error) {
  console.error('Error displaying API status:', error.message);
}

// Import routes
const productRoutes = require('../backend/routes/products');
const recommendRoutes = require('../backend/routes/recommend');
const newApisRoutes = require('../backend/routes/newApis');
const customSearchRoutes = require('../backend/routes/customSearch');
const customSearchV2Routes = require('../backend/routes/customSearchV2');
const hybridSearchRoutes = require('../backend/routes/hybridSearch');
const testRoutes = require('../backend/routes/test');

// Use routes
app.use('/products', productRoutes);
app.use('/recommend', recommendRoutes);
app.use('/newapis', newApisRoutes);
app.use('/custom-search', customSearchRoutes);
app.use('/custom-search-v2', customSearchV2Routes);
app.use('/hybrid-search', hybridSearchRoutes);
app.use('/test', testRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apis: {
      shopee: process.env.USE_REAL_SHOPEE_API === 'true' ? 'active' : 'mock',
      realTimeSearch: process.env.USE_REAL_REALTIME_API === 'true' ? 'active' : 'mock',
      openai: process.env.OPENAI_API_KEY ? 'active' : 'inactive'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Easy Gift Search API - Vercel Serverless',
    version: '2.0.0',
    status: 'running'
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Export for Vercel
module.exports = app;
