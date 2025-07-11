/**
 * 🚀 ADVANCED RATE LIMITING
 * Easy Gift Search - Intelligent rate limiting
 */

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Rate limiting por tipo de endpoint
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message, retryAfter: windowMs },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000),
        timestamp: new Date().toISOString()
      });
    }
  });
};

// Rate limits diferenciados
const rateLimits = {
  // API de busca - mais restritivo
  search: createRateLimit(
    60 * 1000,  // 1 minuto
    30,         // 30 requests
    'Muitas buscas. Tente novamente em 1 minuto.'
  ),

  // APIs gerais
  general: createRateLimit(
    60 * 1000,  // 1 minuto
    100,        // 100 requests
    'Limite de requisições excedido. Tente novamente em 1 minuto.'
  ),

  // Health checks
  health: createRateLimit(
    60 * 1000,  // 1 minuto
    200,        // 200 requests
    'Muitas verificações de saúde.'
  ),

  // Upload/heavy operations
  heavy: createRateLimit(
    5 * 60 * 1000,  // 5 minutos
    10,             // 10 requests
    'Muitas operações pesadas. Aguarde 5 minutos.'
  )
};

// Slow down middleware para degradação gradual
const searchSlowDown = slowDown({
  windowMs: 60 * 1000,  // 1 minuto
  delayAfter: 20,       // Após 20 requests
  delayMs: 500,         // Atraso de 500ms
  maxDelayMs: 5000,     // Máximo 5s de atraso
  skipFailedRequests: true
});

// Rate limiting inteligente baseado em IP e User-Agent
const intelligentRateLimit = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const isBot = /bot|crawler|spider|scraper/i.test(userAgent);
  
  if (isBot) {
    // Rate limit mais restritivo para bots
    return createRateLimit(
      5 * 60 * 1000,  // 5 minutos
      20,             // 20 requests
      'Bot detectado. Rate limit aplicado.'
    )(req, res, next);
  }
  
  return rateLimits.general(req, res, next);
};

module.exports = {
  rateLimits,
  searchSlowDown,
  intelligentRateLimit
};
