/**
 * 🚀 ADMIN DASHBOARD ROUTES
 * Easy Gift Search - Administration Interface
 */

const express = require('express');
const router = express.Router();
const { advancedLogger } = require('../services/advancedLogger');
const { alertSystem } = require('../services/alertSystem');
const advancedCache = require('../services/advancedCacheService');

// Middleware de autenticação básica (pode ser melhorado)
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const validToken = process.env.ADMIN_TOKEN || 'admin123';
  
  if (!token || token !== validToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// Dashboard principal
router.get('/', authMiddleware, async (req, res) => {
  try {
    const dashboardData = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        environment: process.env.NODE_ENV || 'development',
        version: require('../package.json').version
      },
      cache: await advancedCache.getStats(),
      alerts: alertSystem.getAlertStats(),
      // Adicionar mais métricas conforme necessário
    };

    res.json(dashboardData);
  } catch (error) {
    advancedLogger.logError(error, { context: 'admin_dashboard' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Métricas de sistema
router.get('/system', authMiddleware, (req, res) => {
  const systemInfo = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    platform: process.platform,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  };

  res.json(systemInfo);
});

// Métricas de cache
router.get('/cache', authMiddleware, async (req, res) => {
  try {
    const cacheStats = await advancedCache.getStats();
    const cacheHealth = await advancedCache.healthCheck();
    
    res.json({
      stats: cacheStats,
      health: cacheHealth,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    advancedLogger.logError(error, { context: 'admin_cache' });
    res.status(500).json({ error: 'Cache metrics unavailable' });
  }
});

// Limpar cache
router.post('/cache/clear', authMiddleware, async (req, res) => {
  try {
    const pattern = req.body.pattern || '*';
    const result = await advancedCache.invalidate(pattern);
    
    advancedLogger.logSystem('Cache cleared via admin', { pattern, admin: true });
    
    res.json({
      success: result,
      pattern,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    advancedLogger.logError(error, { context: 'admin_cache_clear' });
    res.status(500).json({ error: 'Cache clear failed' });
  }
});

// Alertas
router.get('/alerts', authMiddleware, (req, res) => {
  const alertStats = alertSystem.getAlertStats();
  res.json({
    ...alertStats,
    timestamp: new Date().toISOString()
  });
});

// Logs recentes
router.get('/logs', authMiddleware, async (req, res) => {
  try {
    const logHealth = await advancedLogger.healthCheck();
    
    res.json({
      logging: logHealth,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Logs unavailable' });
  }
});

// Configurações
router.get('/config', authMiddleware, (req, res) => {
  const config = {
    apis: {
      googleSearch: !!process.env.GOOGLE_SEARCH_API_KEY,
      redis: !!process.env.REDIS_URL,
      slack: !!process.env.SLACK_WEBHOOK_URL,
      email: !!process.env.SMTP_HOST
    },
    features: {
      clustering: process.env.DISABLE_CLUSTER !== 'true',
      caching: true,
      monitoring: true,
      alerts: true
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  };

  res.json(config);
});

module.exports = router;
