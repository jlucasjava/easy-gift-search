/**
 * 🔄 REQUEST DEDUPLICATION MIDDLEWARE
 * Easy Gift Search - Performance Optimization
 * Sistema de deduplicação de requests idênticos
 */

const crypto = require('crypto');

class RequestDeduplication {
  constructor() {
    this.pendingRequests = new Map();
    this.maxAge = 30000;        // 30 segundos máximo para requests pendentes
    this.maxConcurrent = 100;   // Máximo 100 requests simultâneos
    this.cleanupInterval = 10000; // Limpeza a cada 10 segundos
    
    // Estatísticas
    this.stats = {
      deduplicated: 0,
      total: 0,
      errors: 0,
      timeouts: 0
    };

    this.startCleanup();
  }

  generateRequestId(req) {
    // Criar ID único baseado em método, URL, query params e corpo
    const method = req.method;
    const url = req.url;
    const body = req.body ? JSON.stringify(req.body) : '';
    const query = JSON.stringify(req.query || {});
    
    // Normalizar para evitar diferenças mínimas
    const normalizedUrl = url.toLowerCase().trim();
    const keyString = `${method}:${normalizedUrl}:${query}:${body}`;
    
    return crypto.createHash('sha256').update(keyString).digest('hex');
  }

  shouldDeduplicate(req) {
    // Apenas deduplicate requests específicos
    const deduplicableEndpoints = [
      '/api/products',
      '/api/custom-search',
      '/api/recommend',
      '/api/search'
    ];

    // Verificar se é endpoint deduplicável
    const isDeduplicable = deduplicableEndpoints.some(endpoint => 
      req.url.includes(endpoint)
    );

    // Apenas GET e POST para busca
    const isValidMethod = ['GET', 'POST'].includes(req.method);

    // Não deduplicate requests com headers especiais
    const hasNoCache = req.headers['cache-control'] === 'no-cache' ||
                      req.headers['x-no-dedup'] === 'true';

    return isDeduplicable && isValidMethod && !hasNoCache;
  }

  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, request] of this.pendingRequests) {
      if (now - request.startTime > this.maxAge) {
        // Request expirado - limpar
        this.pendingRequests.delete(id);
        cleaned++;
        
        if (request.reject) {
          request.reject(new Error('Request deduplication timeout'));
          this.stats.timeouts++;
        }
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired deduplication requests`);
    }

    // Log estatísticas periodicamente
    if (this.stats.total > 0 && this.stats.total % 100 === 0) {
      const dedupeRate = ((this.stats.deduplicated / this.stats.total) * 100).toFixed(2);
      console.log(`📊 Deduplication: ${this.stats.deduplicated}/${this.stats.total} (${dedupeRate}%)`);
    }
  }

  middleware() {
    return async (req, res, next) => {
      this.stats.total++;

      // Verificar se deve deduplicate
      if (!this.shouldDeduplicate(req)) {
        return next();
      }

      // Verificar limite de requests simultâneos
      if (this.pendingRequests.size >= this.maxConcurrent) {
        console.warn(`⚠️ Too many concurrent requests (${this.pendingRequests.size})`);
        return next();
      }

      const requestId = this.generateRequestId(req);
      
      // Verificar se já existe request pendente
      if (this.pendingRequests.has(requestId)) {
        this.stats.deduplicated++;
        console.log(`🔄 Deduplicating request: ${req.method} ${req.url}`);
        
        try {
          // Aguardar resultado do request original
          const result = await this.pendingRequests.get(requestId).promise;
          
          // Enviar mesmo resultado
          if (result.error) {
            return res.status(result.status || 500).json(result.data);
          } else {
            return res.status(result.status || 200).json(result.data);
          }
        } catch (error) {
          this.stats.errors++;
          console.error('❌ Deduplication error:', error.message);
          // Se falhou, continua para novo request
          this.pendingRequests.delete(requestId);
        }
      }

      // Criar nova promise para o request
      let resolveRequest, rejectRequest;
      const requestPromise = new Promise((resolve, reject) => {
        resolveRequest = resolve;
        rejectRequest = reject;
      });

      // Armazenar request pendente
      this.pendingRequests.set(requestId, {
        promise: requestPromise,
        resolve: resolveRequest,
        reject: rejectRequest,
        startTime: Date.now()
      });

      // Interceptar resposta
      const originalJson = res.json;
      const originalStatus = res.status;
      let responseStatus = 200;

      // Interceptar status
      res.status = function(code) {
        responseStatus = code;
        return originalStatus.call(this, code);
      };

      // Interceptar JSON response
      res.json = function(data) {
        // Resolver promise para outros requests aguardando
        const pendingRequest = this.pendingRequests.get(requestId);
        if (pendingRequest) {
          pendingRequest.resolve({
            data,
            status: responseStatus,
            error: responseStatus >= 400
          });
          
          // Remover após pequeno delay para permitir requests simultâneos
          setTimeout(() => {
            this.pendingRequests.delete(requestId);
          }, 1000);
        }

        return originalJson.call(this, data);
      }.bind(this);

      // Interceptar erros
      const originalEnd = res.end;
      res.end = function(...args) {
        // Se chegou aqui sem JSON, resolver com erro
        const pendingRequest = this.pendingRequests.get(requestId);
        if (pendingRequest) {
          pendingRequest.resolve({
            data: { error: 'Request completed without JSON response' },
            status: responseStatus,
            error: true
          });
          this.pendingRequests.delete(requestId);
        }

        return originalEnd.apply(this, args);
      }.bind(this);

      // Timeout de segurança
      const timeout = setTimeout(() => {
        const pendingRequest = this.pendingRequests.get(requestId);
        if (pendingRequest) {
          pendingRequest.reject(new Error('Request timeout'));
          this.pendingRequests.delete(requestId);
          this.stats.timeouts++;
        }
      }, this.maxAge);

      // Limpar timeout quando request completar
      requestPromise.finally(() => {
        clearTimeout(timeout);
      });

      next();
    };
  }

  getStats() {
    const dedupeRate = this.stats.total > 0 ? 
      ((this.stats.deduplicated / this.stats.total) * 100).toFixed(2) : 0;

    return {
      ...this.stats,
      deduplicationRate: dedupeRate,
      pendingRequests: this.pendingRequests.size,
      lastCleanup: new Date().toISOString()
    };
  }

  // Método para forçar limpeza
  forceClear() {
    this.pendingRequests.clear();
    console.log('🗑️ All pending requests cleared');
  }

  // Método para obter requests pendentes (debug)
  getPendingRequests() {
    const pending = [];
    for (const [id, request] of this.pendingRequests) {
      pending.push({
        id: id.substring(0, 8),
        age: Date.now() - request.startTime,
        startTime: new Date(request.startTime).toISOString()
      });
    }
    return pending;
  }
}

// Singleton instance
const deduplication = new RequestDeduplication();

// Graceful shutdown
process.on('SIGINT', () => {
  deduplication.forceClear();
});

process.on('SIGTERM', () => {
  deduplication.forceClear();
});

module.exports = deduplication;
