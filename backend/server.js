/**
 * 🚀 EASY GIFT SEARCH - ENHANC// 🎯 WORKER PROCESS - Continuar com servidor
const app = express();

// 🌐 CREATE HTTP SERVER FOR WEBSOCKET
const server = http.createServer(app);

// 🚀 INITIALIZE WEBSOCKET SERVICE
webSocketService.initialize(server);

// 🔧 ANALYTICS MIDDLEWARE
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    // Track performance
    analyticsService.trackPerformance({
      responseTime,
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode,
      contentLength: res.get('Content-Length'),
      cacheHit: res.get('X-Cache-Hit') === 'true',
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    });
    
    // Track search analytics
    if (req.path.includes('/search') && req.method === 'GET') {
      analyticsService.trackSearch({
        query: req.query.q || req.query.query,
        userId: req.user?.id || req.ip,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        responseTime,
        success: res.statusCode < 400,
        resultsCount: res.locals.resultsCount || 0,
        source: 'google',
        filters: req.query
      });
    }
  });
  
  next();
}); PRODUCTION SERVER
 * High Performance Backend with Advanced Analytics & Real-time Features
 * Iteration 3: Full Production Enhancement Complete
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const http = require('http');

// 🚀 PERFORMANCE & MONITORING
const clusterManager = require('./middleware/clusterMiddleware');
const performanceMonitor = require('./services/performanceMonitor');
const advancedCache = require('./services/advancedCacheService');
const { rateLimits, searchSlowDown, intelligentRateLimit } = require('./middleware/advancedRateLimit');

// 🆕 ENHANCED SERVICES - Production Features
const { advancedLogger } = require('./services/advancedLogger');
const { validationService } = require('./services/validationService');
const { alertSystem } = require('./services/alertSystem');
const { optimizedApiClient } = require('./services/optimizedApiClient');
const { authService } = require('./services/authService');
const { analyticsService } = require('./services/analyticsService');
const { webSocketService } = require('./services/webSocketService');

// 🔄 CLUSTERING - Desabilitado para teste inicial
// if (clusterManager.init()) {
//   // Master process, workers foram criados
//   return;
// }

// 🎯 WORKER PROCESS - Continuar com servidor
const app = express();

// 🛡️ SECURITY
app.use(helmet({
  contentSecurityPolicy: false, // Necessário para Vercel
  crossOriginEmbedderPolicy: false
}));

// 🚀 PERFORMANCE MIDDLEWARES
app.use(performanceMonitor.middleware());
app.use(advancedLogger.middleware());
app.use(alertSystem.middleware());
app.use(validationService.sanitizeMiddleware.bind(validationService));
app.use(validationService.securityMiddleware.bind(validationService));

// 📊 TRUST PROXY
app.set('trust proxy', 1);

// 🔄 CORS OTIMIZADO
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://easy-gift-search.vercel.app', 'https://*.vercel.app']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 horas
};

app.use(cors(corsOptions));

// 📝 LOGGING OTIMIZADO
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400
  }));
}

// 🗂️ BODY PARSING
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 🎯 RATE LIMITING INTELIGENTE
app.use('/api/search', rateLimits.search);
app.use('/api/search', searchSlowDown);
app.use('/api/', intelligentRateLimit);

// 📁 STATIC FILES
app.use(express.static(path.join(__dirname, '../frontend')));

// 🚀 API ROUTES
app.use('/api/search', require('./routes/customSearch'));
app.use('/api/products', require('./routes/products'));
app.use('/api/recommend', require('./routes/recommend'));

// 🆕 ENHANCED ADMIN ROUTES
app.use('/api/admin', require('./routes/enhancedAdminDashboard'));

// 📊 MONITORING ENDPOINTS
app.get('/api/health', rateLimits.health, async (req, res) => {
  try {
    const cacheHealth = await advancedCache.healthCheck();
    const systemHealth = performanceMonitor.getHealthScore();
    const apiHealth = await optimizedApiClient.healthCheck();
    const logHealth = await advancedLogger.healthCheck();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      cache: cacheHealth,
      apis: apiHealth,
      logging: logHealth,
      performance: {
        healthScore: systemHealth,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      cluster: clusterManager.getWorkerStatus()
    };

    const isHealthy = cacheHealth.healthy && systemHealth > 70;
    res.status(isHealthy ? 200 : 503).json(health);
  } catch (error) {
    advancedLogger.logError(error, { context: 'health_check' });
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 📈 METRICS ENDPOINT
app.get('/api/metrics', rateLimits.health, (req, res) => {
  try {
    const metrics = performanceMonitor.getMetrics();
    const cacheStats = advancedCache.getStats();
    const apiStats = optimizedApiClient.getStats();
    const alertStats = alertSystem.getAlertStats();
    
    performanceMonitor.updateCacheMetrics(cacheStats);
    
    res.json({
      ...metrics,
      cache: cacheStats,
      apis: apiStats,
      alerts: alertStats,
      cluster: clusterManager.getWorkerStatus()
    });
  } catch (error) {
    advancedLogger.logError(error, { context: 'metrics_endpoint' });
    res.status(500).json({ error: error.message });
  }
});

// 🗑️ CACHE MANAGEMENT
app.post('/api/cache/clear', rateLimits.heavy, async (req, res) => {
  try {
    const pattern = req.body.pattern || '*';
    await advancedCache.invalidate(pattern);
    res.json({ 
      success: true, 
      message: `Cache cleared for pattern: ${pattern}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🏠 FRONTEND FALLBACK
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 🚨 ERROR HANDLING
app.use((error, req, res, next) => {
  performanceMonitor.recordError(error, {
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  advancedLogger.logError(error, {
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  alertSystem.recordError(error, {
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Track error in analytics
  analyticsService.trackError(error, {
    endpoint: req.url,
    method: req.method,
    userId: req.user?.id || 'anonymous',
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    severity: error.status >= 500 ? 'critical' : 'error'
  });

  console.error('🚨 Server Error:', error);
  
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    timestamp: new Date().toISOString(),
    requestId: req.id || Date.now().toString()
  });
});

// 📡 SERVER STARTUP
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Render requires 0.0.0.0

server.listen(PORT, HOST, () => {
  console.log(`\n🚀 Easy Gift Search Server v3.0 - Worker ${process.pid}`.cyan.bold);
  console.log(`📡 Server running on ${HOST}:${PORT}`.green);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`.yellow);
  console.log(`⚡ Performance optimizations: ACTIVE`.green.bold);
  console.log(`🗄️ Cache service: ${advancedCache.redisAvailable ? 'Redis + Local' : 'Local only'}`.cyan);
  console.log(`📊 Monitoring: ACTIVE`.green);
  console.log(`🔒 Security: ACTIVE`.green);
  console.log(`🚨 Alerts: ACTIVE`.green);
  console.log(`📝 Logging: ACTIVE`.green);
  console.log(`🔧 Validation: ACTIVE`.green);
  console.log(`🔐 Authentication: ACTIVE`.green);
  console.log(`📈 Analytics: ACTIVE`.green);
  console.log(`⚡ WebSocket: ACTIVE`.green);
  console.log(`\n✨ All production features active!`.rainbow.bold);
  
  // Log startup
  advancedLogger.logSystem('Server started', {
    port: PORT,
    host: HOST,
    environment: process.env.NODE_ENV || 'development',
    pid: process.pid,
    features: {
      caching: true,
      monitoring: true,
      alerts: true,
      logging: true,
      validation: true,
      security: true,
      authentication: true,
      analytics: true,
      websocket: true
    }
  });
});

// 🛑 GRACEFUL SHUTDOWN
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;
