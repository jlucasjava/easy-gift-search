/**
 * 🚀 ENHANCED ADMIN DASHBOARD ROUTES
 * Easy Gift Search - Advanced Administration Interface
 */

const express = require('express');
const router = express.Router();
const { advancedLogger } = require('../services/advancedLogger');
const { alertSystem } = require('../services/alertSystem');
const { analyticsService } = require('../services/analyticsService');
const { authService } = require('../services/authService');
const { webSocketService } = require('../services/webSocketService');
const advancedCache = require('../services/advancedCacheService');

// Authentication routes
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.authenticateUser(email, password);
    
    if (result.success) {
      advancedLogger.info('Admin login successful', { email });
      res.json(result);
    } else {
      res.status(401).json({ error: result.message });
    }

  } catch (error) {
    advancedLogger.error('Admin login error', { error: error.message });
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const result = await authService.refreshAccessToken(refreshToken);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json({ error: result.message });
    }

  } catch (error) {
    advancedLogger.error('Token refresh error', { error: error.message });
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

router.post('/auth/logout', authService.authMiddleware(), (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      authService.revokeRefreshToken(refreshToken);
    }

    advancedLogger.info('Admin logout', { userId: req.user.userId });
    res.json({ message: 'Logged out successfully' });

  } catch (error) {
    advancedLogger.error('Logout error', { error: error.message });
    res.status(500).json({ error: 'Logout failed' });
  }
});

// System overview
router.get('/system', authService.authMiddleware(['admin']), async (req, res) => {
  try {
    const systemInfo = {
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        version: process.version,
        platform: process.platform
      },
      cache: await advancedCache.getStats(),
      connections: webSocketService.getConnectionStats(),
      analytics: analyticsService.getRealTimeData(),
      alerts: alertSystem.getRecentAlerts(10),
      auth: authService.getUserStats()
    };

    res.json(systemInfo);

  } catch (error) {
    advancedLogger.error('System info error', { error: error.message });
    res.status(500).json({ error: 'Failed to get system info' });
  }
});

// Analytics endpoints
router.get('/analytics/searches', authService.authMiddleware(['admin']), (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    const analytics = analyticsService.getSearchAnalytics(timeRange);
    res.json(analytics);

  } catch (error) {
    advancedLogger.error('Search analytics error', { error: error.message });
    res.status(500).json({ error: 'Failed to get search analytics' });
  }
});

router.get('/analytics/users', authService.authMiddleware(['admin']), (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    const analytics = analyticsService.getUserAnalytics(timeRange);
    res.json(analytics);

  } catch (error) {
    advancedLogger.error('User analytics error', { error: error.message });
    res.status(500).json({ error: 'Failed to get user analytics' });
  }
});

router.get('/analytics/performance', authService.authMiddleware(['admin']), (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    const analytics = analyticsService.getPerformanceAnalytics(timeRange);
    res.json(analytics);

  } catch (error) {
    advancedLogger.error('Performance analytics error', { error: error.message });
    res.status(500).json({ error: 'Failed to get performance analytics' });
  }
});

router.get('/analytics/errors', authService.authMiddleware(['admin']), (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    const analytics = analyticsService.getErrorAnalytics(timeRange);
    res.json(analytics);

  } catch (error) {
    advancedLogger.error('Error analytics error', { error: error.message });
    res.status(500).json({ error: 'Failed to get error analytics' });
  }
});

router.get('/analytics/business', authService.authMiddleware(['admin']), (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const analytics = analyticsService.getBusinessIntelligence(timeRange);
    res.json(analytics);

  } catch (error) {
    advancedLogger.error('Business analytics error', { error: error.message });
    res.status(500).json({ error: 'Failed to get business analytics' });
  }
});

// Cache management
router.get('/cache/stats', authService.authMiddleware(['admin']), async (req, res) => {
  try {
    const stats = await advancedCache.getStats();
    res.json(stats);

  } catch (error) {
    advancedLogger.error('Cache stats error', { error: error.message });
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

router.post('/cache/clear', authService.authMiddleware(['admin']), async (req, res) => {
  try {
    await advancedCache.clearAll();
    
    advancedLogger.info('Cache cleared by admin', { userId: req.user.userId });
    webSocketService.broadcastSystemNotification('Cache cleared by administrator', 'info');
    
    res.json({ message: 'Cache cleared successfully' });

  } catch (error) {
    advancedLogger.error('Cache clear error', { error: error.message });
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

router.delete('/cache/key/:key', authService.authMiddleware(['admin']), async (req, res) => {
  try {
    const { key } = req.params;
    await advancedCache.delete(key);
    
    advancedLogger.info('Cache key deleted by admin', { key, userId: req.user.userId });
    res.json({ message: 'Cache key deleted successfully' });

  } catch (error) {
    advancedLogger.error('Cache key delete error', { error: error.message });
    res.status(500).json({ error: 'Failed to delete cache key' });
  }
});

// Alert management
router.get('/alerts', authService.authMiddleware(['admin']), (req, res) => {
  try {
    const { limit = 50, type, severity } = req.query;
    const alerts = alertSystem.getRecentAlerts(parseInt(limit), type, severity);
    res.json(alerts);

  } catch (error) {
    advancedLogger.error('Get alerts error', { error: error.message });
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

router.post('/alerts/test', authService.authMiddleware(['admin']), async (req, res) => {
  try {
    const { type = 'test', message = 'Test alert from admin panel' } = req.body;
    
    await alertSystem.sendAlert({
      type,
      message,
      severity: 'info',
      source: 'admin-panel',
      userId: req.user.userId
    });

    res.json({ message: 'Test alert sent successfully' });

  } catch (error) {
    advancedLogger.error('Test alert error', { error: error.message });
    res.status(500).json({ error: 'Failed to send test alert' });
  }
});

// Logs management
router.get('/logs', authService.authMiddleware(['admin']), (req, res) => {
  try {
    const { level = 'info', limit = 100, search } = req.query;
    const logs = advancedLogger.getLogs(level, parseInt(limit), search);
    res.json(logs);

  } catch (error) {
    advancedLogger.error('Get logs error', { error: error.message });
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

router.get('/logs/download', authService.authMiddleware(['admin']), (req, res) => {
  try {
    const { date } = req.query;
    const logPath = advancedLogger.getLogFilePath(date);
    
    res.download(logPath, `logs-${date || 'current'}.log`);

  } catch (error) {
    advancedLogger.error('Log download error', { error: error.message });
    res.status(500).json({ error: 'Failed to download logs' });
  }
});

// Configuration management
router.get('/config', authService.authMiddleware(['admin']), (req, res) => {
  try {
    const config = {
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3000,
      cacheEnabled: process.env.CACHE_ENABLED !== 'false',
      alertsEnabled: process.env.ALERTS_ENABLED !== 'false',
      logLevel: process.env.LOG_LEVEL || 'info',
      maxCacheSize: process.env.MAX_CACHE_SIZE || '100mb',
      rateLimit: {
        windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000,
        max: process.env.RATE_LIMIT_MAX || 100
      },
      features: {
        realTimeAnalytics: true,
        advancedCaching: true,
        alertSystem: true,
        webSocketUpdates: true
      }
    };

    res.json(config);

  } catch (error) {
    advancedLogger.error('Get config error', { error: error.message });
    res.status(500).json({ error: 'Failed to get configuration' });
  }
});

// User management
router.get('/users', authService.authMiddleware(['admin']), (req, res) => {
  try {
    const users = authService.getAllUsers();
    res.json(users);

  } catch (error) {
    advancedLogger.error('Get users error', { error: error.message });
    res.status(500).json({ error: 'Failed to get users' });
  }
});

router.post('/users', authService.authMiddleware(['admin']), async (req, res) => {
  try {
    const { email, password, role, permissions } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.createUser({
      email,
      password,
      role: role || 'user',
      permissions: permissions || ['read']
    });

    if (result.success) {
      advancedLogger.info('User created by admin', { 
        email, 
        role,
        createdBy: req.user.userId 
      });
      res.json(result);
    } else {
      res.status(400).json({ error: result.message });
    }

  } catch (error) {
    advancedLogger.error('Create user error', { error: error.message });
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/users/:userId', authService.authMiddleware(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    const result = await authService.updateUser(userId, updates);

    if (result.success) {
      advancedLogger.info('User updated by admin', { 
        userId, 
        updates: Object.keys(updates),
        updatedBy: req.user.userId 
      });
      res.json(result);
    } else {
      res.status(400).json({ error: result.message });
    }

  } catch (error) {
    advancedLogger.error('Update user error', { error: error.message });
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:userId', authService.authMiddleware(['admin']), (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete own account' });
    }

    const result = authService.deleteUser(userId);

    if (result.success) {
      advancedLogger.info('User deleted by admin', { 
        userId, 
        deletedBy: req.user.userId 
      });
      res.json(result);
    } else {
      res.status(400).json({ error: result.message });
    }

  } catch (error) {
    advancedLogger.error('Delete user error', { error: error.message });
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// WebSocket connection endpoint
router.get('/ws-info', authService.authMiddleware(['admin']), (req, res) => {
  try {
    const connectionStats = webSocketService.getConnectionStats();
    res.json({
      ...connectionStats,
      endpoints: {
        socketIO: '/socket.io',
        webSocket: '/ws'
      }
    });

  } catch (error) {
    advancedLogger.error('WebSocket info error', { error: error.message });
    res.status(500).json({ error: 'Failed to get WebSocket info' });
  }
});

// System actions
router.post('/system/restart', authService.authMiddleware(['admin']), (req, res) => {
  try {
    advancedLogger.info('System restart requested by admin', { userId: req.user.userId });
    webSocketService.broadcastSystemNotification('System restart initiated by administrator', 'warning');
    
    res.json({ message: 'System restart initiated' });
    
    // Graceful shutdown
    setTimeout(() => {
      process.exit(0);
    }, 2000);

  } catch (error) {
    advancedLogger.error('System restart error', { error: error.message });
    res.status(500).json({ error: 'Failed to restart system' });
  }
});

module.exports = router;
