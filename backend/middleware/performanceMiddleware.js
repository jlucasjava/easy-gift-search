/**
 * 🚀 PERFORMANCE MIDDLEWARE
 * Easy Gift Search - Optimization Suite
 * Middleware para compressão, monitoramento e otimização
 */

const compression = require('compression');
const responseTime = require('response-time');

// Middleware de compressão inteligente
const compressionMiddleware = compression({
  filter: (req, res) => {
    // Não comprimir se o cliente não suporta
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Não comprimir imagens e arquivos já comprimidos
    const contentType = res.getHeader('content-type');
    if (contentType && (
      contentType.includes('image/') ||
      contentType.includes('video/') ||
      contentType.includes('audio/') ||
      contentType.includes('application/zip') ||
      contentType.includes('application/gzip')
    )) {
      return false;
    }

    return compression.filter(req, res);
  },
  threshold: 1024,        // Comprimir apenas se > 1KB
  level: 6,               // Nível de compressão balanceado (1-9)
  windowBits: 15,         // Janela de compressão
  memLevel: 8             // Nível de memória
});

// Middleware de tempo de resposta com logging inteligente
const responseTimeMiddleware = responseTime((req, res, time) => {
  // Headers de performance
  res.setHeader('X-Response-Time', `${time.toFixed(2)}ms`);
  res.setHeader('X-Powered-By', 'Easy-Gift-Search-v2.0');

  // Log baseado no tempo de resposta
  const timeString = time.toFixed(2);
  const method = req.method;
  const url = req.url;
  const status = res.statusCode;

  if (time < 100) {
    // Muito rápido - só log em debug
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${method} ${url} - ${timeString}ms (${status})`.green);
    }
  } else if (time < 500) {
    // Rápido - log normal
    console.log(`✅ ${method} ${url} - ${timeString}ms (${status})`.cyan);
  } else if (time < 2000) {
    // Médio - log com aviso
    console.log(`⚠️  ${method} ${url} - ${timeString}ms (${status})`.yellow);
  } else {
    // Lento - log crítico
    console.log(`🐌 SLOW: ${method} ${url} - ${timeString}ms (${status})`.red);
    
    // Log adicional para requests muito lentos
    if (time > 5000) {
      console.error(`🚨 CRITICAL SLOW REQUEST: ${method} ${url} took ${timeString}ms`);
    }
  }

  // Métricas para monitoramento
  if (global.performanceMetrics) {
    global.performanceMetrics.addRequest(time, req.url, status);
  }
});

// Middleware de otimização de JSON
const jsonOptimizer = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(obj) {
    if (obj && typeof obj === 'object') {
      // Otimizar objeto antes de enviar
      obj = optimizeJsonData(obj);
      
      // Adicionar headers de cache para dados estáticos
      if (shouldCache(req.url)) {
        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutos
        res.setHeader('ETag', generateETag(obj));
      }
    }
    
    return originalJson.call(this, obj);
  };
  
  next();
};

// Função para otimizar dados JSON
function optimizeJsonData(obj) {
  if (Array.isArray(obj)) {
    return obj
      .map(optimizeJsonData)
      .filter(item => item !== null && item !== undefined);
  }
  
  if (obj && typeof obj === 'object') {
    const optimized = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Remover campos vazios, null ou undefined
      if (value !== null && value !== undefined && value !== '' && !Array.isArray(value) || (Array.isArray(value) && value.length > 0)) {
        // Otimizar valores aninhados
        if (typeof value === 'object') {
          const optimizedValue = optimizeJsonData(value);
          if (optimizedValue !== null && 
              (!Array.isArray(optimizedValue) || optimizedValue.length > 0) &&
              (!isPlainObject(optimizedValue) || Object.keys(optimizedValue).length > 0)) {
            optimized[key] = optimizedValue;
          }
        } else {
          optimized[key] = value;
        }
      }
    }
    
    return optimized;
  }
  
  return obj;
}

// Verificar se deve cachear a URL
function shouldCache(url) {
  const cacheableEndpoints = [
    '/api/status',
    '/api/products',
    '/api/custom-search'
  ];
  
  return cacheableEndpoints.some(endpoint => url.includes(endpoint));
}

// Gerar ETag simples
function generateETag(data) {
  const crypto = require('crypto');
  const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  return `"${hash.substring(0, 16)}"`;
}

// Verificar se é objeto simples
function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

// Middleware de otimização de headers
const headerOptimizer = (req, res, next) => {
  // Headers de segurança e performance
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Headers de performance
  res.setHeader('X-DNS-Prefetch-Control', 'on');
  res.setHeader('X-Download-Options', 'noopen');
  
  // Remover headers desnecessários
  res.removeHeader('X-Powered-By');
  
  next();
};

// Middleware de detecção de bot/crawler
const botDetection = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const isBot = /bot|crawler|spider|scraper/i.test(userAgent);
  
  if (isBot) {
    // Headers especiais para bots
    res.setHeader('X-Robots-Tag', 'index, follow');
    req.isBot = true;
    
    // Log bots
    console.log(`🤖 Bot detected: ${userAgent.substring(0, 50)}...`);
  }
  
  next();
};

// Sistema de métricas global
class PerformanceMetrics {
  constructor() {
    this.requests = [];
    this.maxRequests = 1000; // Manter últimas 1000 requests
  }

  addRequest(time, url, status) {
    this.requests.push({
      time,
      url,
      status,
      timestamp: Date.now()
    });

    // Manter apenas as últimas requests
    if (this.requests.length > this.maxRequests) {
      this.requests = this.requests.slice(-this.maxRequests);
    }
  }

  getStats() {
    if (this.requests.length === 0) {
      return {
        count: 0,
        avgTime: 0,
        minTime: 0,
        maxTime: 0,
        slowRequests: 0,
        errorRate: 0
      };
    }

    const times = this.requests.map(r => r.time);
    const errors = this.requests.filter(r => r.status >= 400).length;
    const slowRequests = this.requests.filter(r => r.time > 2000).length;

    return {
      count: this.requests.length,
      avgTime: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2),
      minTime: Math.min(...times).toFixed(2),
      maxTime: Math.max(...times).toFixed(2),
      slowRequests,
      errorRate: ((errors / this.requests.length) * 100).toFixed(2)
    };
  }

  getSlowestEndpoints(limit = 5) {
    const endpointStats = {};
    
    this.requests.forEach(req => {
      const endpoint = req.url.split('?')[0]; // Remove query params
      if (!endpointStats[endpoint]) {
        endpointStats[endpoint] = {
          totalTime: 0,
          count: 0,
          maxTime: 0
        };
      }
      
      endpointStats[endpoint].totalTime += req.time;
      endpointStats[endpoint].count += 1;
      endpointStats[endpoint].maxTime = Math.max(endpointStats[endpoint].maxTime, req.time);
    });

    return Object.entries(endpointStats)
      .map(([endpoint, stats]) => ({
        endpoint,
        avgTime: (stats.totalTime / stats.count).toFixed(2),
        maxTime: stats.maxTime.toFixed(2),
        count: stats.count
      }))
      .sort((a, b) => parseFloat(b.avgTime) - parseFloat(a.avgTime))
      .slice(0, limit);
  }
}

// Inicializar métricas globais
if (!global.performanceMetrics) {
  global.performanceMetrics = new PerformanceMetrics();
}

// Middleware para endpoint de métricas
const metricsEndpoint = (req, res) => {
  const stats = global.performanceMetrics.getStats();
  const slowest = global.performanceMetrics.getSlowestEndpoints();
  
  res.json({
    performance: stats,
    slowestEndpoints: slowest,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

module.exports = {
  compressionMiddleware,
  responseTimeMiddleware,
  jsonOptimizer,
  headerOptimizer,
  botDetection,
  metricsEndpoint,
  PerformanceMetrics
};
