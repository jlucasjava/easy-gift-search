/**
 * 🚀 ADVANCED LOGGING SERVICE
 * Easy Gift Search - Production Grade Logging
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Criar diretório de logs se não existir
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Formatador customizado
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      msg += `\nStack: ${stack}`;
    }
    
    if (Object.keys(metadata).length > 0) {
      msg += `\nMetadata: ${JSON.stringify(metadata, null, 2)}`;
    }
    
    return msg;
  })
);

// Configuração de transports
const transports = [
  // Console para desenvolvimento
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),

  // Arquivo para erros
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    handleExceptions: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: logFormat
  }),

  // Arquivo para todos os logs
  new DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    format: logFormat
  }),

  // Arquivo para requests
  new DailyRotateFile({
    filename: path.join(logDir, 'requests-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    maxSize: '50m',
    maxFiles: '7d',
    format: logFormat
  }),

  // Arquivo para performance
  new DailyRotateFile({
    filename: path.join(logDir, 'performance-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '10m',
    maxFiles: '14d',
    format: logFormat
  })
];

// Criar logger principal
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exitOnError: false
});

// Logger especializado para requests
const requestLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new DailyRotateFile({
      filename: path.join(logDir, 'requests-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '50m',
      maxFiles: '7d'
    })
  ]
});

// Logger especializado para performance
const performanceLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, 'performance-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '14d'
    })
  ]
});

// Logger especializado para APIs
const apiLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new DailyRotateFile({
      filename: path.join(logDir, 'api-calls-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

// Métodos de logging estruturado
class AdvancedLogger {
  
  // Log de request HTTP
  logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };

    if (responseTime > 2000) {
      logger.warn('Slow request detected', logData);
    } else {
      requestLogger.info('Request processed', logData);
    }
  }

  // Log de chamada de API
  logApiCall(apiName, endpoint, success, responseTime, statusCode, error = null) {
    const logData = {
      api: apiName,
      endpoint,
      success,
      responseTime: `${responseTime}ms`,
      statusCode,
      timestamp: new Date().toISOString()
    };

    if (error) {
      logData.error = error.message;
      apiLogger.error(`API call failed: ${apiName}`, logData);
    } else if (responseTime > 3000) {
      apiLogger.warn(`Slow API call: ${apiName}`, logData);
    } else {
      apiLogger.info(`API call: ${apiName}`, logData);
    }
  }

  // Log de performance
  logPerformance(metric, value, context = {}) {
    performanceLogger.info(`Performance metric: ${metric}`, {
      metric,
      value,
      context,
      timestamp: new Date().toISOString()
    });
  }

  // Log de erro estruturado
  logError(error, context = {}) {
    logger.error('Application error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  // Log de sistema
  logSystem(message, data = {}) {
    logger.info(`System: ${message}`, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Log de cache
  logCache(operation, key, hit, ttl = null) {
    const logData = {
      operation,
      key,
      hit,
      timestamp: new Date().toISOString()
    };

    if (ttl) {
      logData.ttl = ttl;
    }

    logger.info(`Cache ${operation}`, logData);
  }

  // Log de segurança
  logSecurity(event, details = {}) {
    logger.warn(`Security event: ${event}`, {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Middleware de logging para Express
  middleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        this.logRequest(req, res, responseTime);
      });

      next();
    };
  }

  // Health check dos logs
  async healthCheck() {
    try {
      // Verificar se consegue escrever logs
      logger.info('Health check - logging system');
      
      // Verificar espaço em disco
      const stats = fs.statSync(logDir);
      
      return {
        status: 'healthy',
        logDirectory: logDir,
        lastWrite: new Date().toISOString(),
        diskAvailable: true
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

// Exportar instância única
const advancedLogger = new AdvancedLogger();

module.exports = {
  logger,
  requestLogger,
  performanceLogger,
  apiLogger,
  advancedLogger
};
