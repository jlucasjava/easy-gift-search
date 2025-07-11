/**
 * 🚀 PERFORMANCE MONITORING SERVICE
 * Easy Gift Search - Real-time monitoring
 */

const EventEmitter = require('events');

class PerformanceMonitor extends EventEmitter {
  constructor() {
    super();
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        avgResponseTime: 0,
        slowRequests: 0
      },
      system: {
        cpuUsage: 0,
        memoryUsage: 0,
        uptime: process.uptime()
      },
      apis: {},
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0
      },
      errors: []
    };

    this.responseTimes = [];
    this.maxResponseTimes = 1000; // Manter últimas 1000 respostas
    this.slowThreshold = 2000; // 2 segundos
    
    this.startSystemMonitoring();
  }

  // Monitoramento do sistema
  startSystemMonitoring() {
    setInterval(() => {
      const usage = process.cpuUsage();
      const memUsage = process.memoryUsage();
      
      this.metrics.system = {
        cpuUsage: (usage.user + usage.system) / 1000000, // Convert to seconds
        memoryUsage: {
          rss: Math.round(memUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024)
        },
        uptime: process.uptime()
      };
      
      this.emit('systemUpdate', this.metrics.system);
    }, 30000); // A cada 30 segundos
  }

  // Registrar request
  recordRequest(req, res, responseTime) {
    this.metrics.requests.total++;
    
    if (res.statusCode >= 200 && res.statusCode < 400) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }

    // Tempo de resposta
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > this.maxResponseTimes) {
      this.responseTimes.shift();
    }

    this.metrics.requests.avgResponseTime = 
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;

    if (responseTime > this.slowThreshold) {
      this.metrics.requests.slowRequests++;
      this.emit('slowRequest', {
        url: req.url,
        method: req.method,
        responseTime,
        timestamp: new Date()
      });
    }

    this.emit('requestComplete', {
      url: req.url,
      method: req.method,
      statusCode: res.statusCode,
      responseTime
    });
  }

  // Registrar erro
  recordError(error, context = {}) {
    const errorRecord = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date(),
      id: Date.now().toString()
    };

    this.metrics.errors.push(errorRecord);
    
    // Manter apenas últimos 100 erros
    if (this.metrics.errors.length > 100) {
      this.metrics.errors.shift();
    }

    this.emit('error', errorRecord);
  }

  // Registrar performance de API
  recordApiCall(apiName, responseTime, success = true) {
    if (!this.metrics.apis[apiName]) {
      this.metrics.apis[apiName] = {
        calls: 0,
        successful: 0,
        failed: 0,
        avgResponseTime: 0,
        responseTimes: []
      };
    }

    const api = this.metrics.apis[apiName];
    api.calls++;
    
    if (success) {
      api.successful++;
    } else {
      api.failed++;
    }

    api.responseTimes.push(responseTime);
    if (api.responseTimes.length > 100) {
      api.responseTimes.shift();
    }

    api.avgResponseTime = 
      api.responseTimes.reduce((a, b) => a + b, 0) / api.responseTimes.length;
  }

  // Atualizar métricas de cache
  updateCacheMetrics(stats) {
    this.metrics.cache = {
      ...stats,
      hitRate: parseFloat(stats.hitRate)
    };
  }

  // Obter métricas completas
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date(),
      performance: {
        requestsPerSecond: this.metrics.requests.total / (process.uptime() || 1),
        errorRate: (this.metrics.requests.failed / this.metrics.requests.total * 100) || 0,
        slowRequestRate: (this.metrics.requests.slowRequests / this.metrics.requests.total * 100) || 0
      }
    };
  }

  // Health score
  getHealthScore() {
    const errorRate = this.metrics.requests.failed / this.metrics.requests.total;
    const slowRate = this.metrics.requests.slowRequests / this.metrics.requests.total;
    const memUsage = this.metrics.system.memoryUsage.heapUsed / this.metrics.system.memoryUsage.heapTotal;
    
    let score = 100;
    score -= (errorRate * 100) * 0.5;           // Erros reduzem score
    score -= (slowRate * 100) * 0.3;            // Requests lentas reduzem score
    score -= Math.max(0, (memUsage - 0.8) * 200); // Alta memória reduz score
    
    return Math.max(0, Math.round(score));
  }

  // Middleware de monitoramento
  middleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        this.recordRequest(req, res, responseTime);
      });

      next();
    };
  }
}

module.exports = new PerformanceMonitor();
