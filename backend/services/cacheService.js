/**
 * 🚀 UNIFIED CACHE SERVICE
 * Easy Gift Search - Performance Optimization
 * Sistema de cache unificado com fallback automático
 */

const NodeCache = require('node-cache');
const crypto = require('crypto');

class UnifiedCacheService {
  constructor() {
    // Cache local primário
    this.localCache = new NodeCache({ 
      stdTTL: 3600,        // 1 hora padrão
      checkperiod: 120,    // Verificar expiração a cada 2 min
      maxKeys: 1000,       // Máximo 1000 chaves em memória
      useClones: false     // Performance boost
    });
    
    // Redis para produção (opcional)
    this.redisClient = null;
    this.redisAvailable = false;
    
    // Estatísticas de performance
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      errors: 0,
      localHits: 0,
      redisHits: 0
    };
    
    this.initializeRedis();
    this.setupCleanup();
  }

  async initializeRedis() {
    if (process.env.REDIS_URL || process.env.NODE_ENV === 'production') {
      try {
        const redis = require('redis');
        this.redisClient = redis.createClient({
          url: process.env.REDIS_URL || 'redis://localhost:6379',
          socket: {
            connectTimeout: 5000,
            lazyConnect: true
          },
          retry_strategy: (options) => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
              console.warn('⚠️ Redis connection refused, using local cache only');
              return null;
            }
            return Math.min(options.attempt * 100, 3000);
          }
        });

        this.redisClient.on('error', (err) => {
          console.warn('⚠️ Redis error:', err.message);
          this.redisAvailable = false;
        });

        this.redisClient.on('connect', () => {
          console.log('✅ Redis cache connected');
          this.redisAvailable = true;
        });

        // Tentar conectar sem bloquear
        setTimeout(async () => {
          try {
            await this.redisClient.connect();
          } catch (error) {
            console.warn('⚠️ Redis not available, using local cache only');
          }
        }, 100);

      } catch (error) {
        console.warn('⚠️ Redis setup failed, using local cache only:', error.message);
      }
    }
  }

  setupCleanup() {
    // Limpeza periódica de estatísticas
    setInterval(() => {
      const totalRequests = this.stats.hits + this.stats.misses;
      if (totalRequests > 1000) {
        console.log(`📊 Cache Stats - Hits: ${this.stats.hits}, Misses: ${this.stats.misses}, Hit Rate: ${((this.stats.hits / totalRequests) * 100).toFixed(2)}%`);
        // Reset stats
        Object.keys(this.stats).forEach(key => this.stats[key] = 0);
      }
    }, 300000); // A cada 5 minutos
  }

  generateKey(prefix, query, filters = {}) {
    // Normalizar filtros para gerar chave consistente
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((result, key) => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          result[key] = filters[key];
        }
        return result;
      }, {});
    
    // Criar hash da combinação
    const keyString = `${prefix}:${query.toLowerCase().trim()}:${JSON.stringify(sortedFilters)}`;
    return crypto.createHash('md5').update(keyString).digest('hex');
  }

  async get(key) {
    try {
      // Primeiro nível: cache local (mais rápido)
      let data = this.localCache.get(key);
      if (data) {
        this.stats.hits++;
        this.stats.localHits++;
        return data;
      }

      // Segundo nível: Redis (se disponível)
      if (this.redisAvailable && this.redisClient) {
        try {
          const redisData = await this.redisClient.get(key);
          if (redisData) {
            data = JSON.parse(redisData);
            // Repopular cache local com TTL reduzido
            this.localCache.set(key, data, 1800); // 30 minutos
            this.stats.hits++;
            this.stats.redisHits++;
            return data;
          }
        } catch (redisError) {
          console.warn('⚠️ Redis get error:', redisError.message);
          this.redisAvailable = false;
        }
      }

      this.stats.misses++;
      return null;

    } catch (error) {
      this.stats.errors++;
      console.error('❌ Cache get error:', error.message);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      // Validar dados antes de cachear
      if (value === null || value === undefined) {
        return false;
      }

      // Cache local sempre
      this.localCache.set(key, value, ttl);

      // Cache Redis (se disponível)
      if (this.redisAvailable && this.redisClient) {
        try {
          await this.redisClient.setEx(key, ttl, JSON.stringify(value));
        } catch (redisError) {
          console.warn('⚠️ Redis set error:', redisError.message);
          this.redisAvailable = false;
        }
      }

      this.stats.sets++;
      return true;

    } catch (error) {
      this.stats.errors++;
      console.error('❌ Cache set error:', error.message);
      return false;
    }
  }

  async invalidate(pattern) {
    try {
      // Invalidar cache local
      const keys = this.localCache.keys();
      keys.forEach(key => {
        if (key.includes(pattern)) {
          this.localCache.del(key);
        }
      });

      // Invalidar Redis (se disponível)
      if (this.redisAvailable && this.redisClient) {
        try {
          const redisKeys = await this.redisClient.keys(`*${pattern}*`);
          if (redisKeys.length > 0) {
            await this.redisClient.del(redisKeys);
          }
        } catch (redisError) {
          console.warn('⚠️ Redis invalidate error:', redisError.message);
        }
      }

      console.log(`🗑️ Cache invalidated for pattern: ${pattern}`);
      return true;

    } catch (error) {
      console.error('❌ Cache invalidate error:', error.message);
      return false;
    }
  }

  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: totalRequests > 0 ? ((this.stats.hits / totalRequests) * 100).toFixed(2) : 0,
      localCacheSize: this.localCache.keys().length,
      redisAvailable: this.redisAvailable
    };
  }

  // Método para calcular TTL dinâmico baseado na qualidade dos dados
  calculateDynamicTTL(data, defaultTTL = 3600) {
    if (!data) return 300; // 5 minutos para dados vazios

    // Para arrays de produtos
    if (Array.isArray(data)) {
      if (data.length === 0) return 300;           // 5 min - sem resultados
      if (data.length < 5) return 1800;            // 30 min - poucos resultados
      if (data.length >= 10) return 7200;          // 2 horas - muitos resultados
      return defaultTTL;                           // 1 hora - padrão
    }

    // Para objetos de dados
    if (typeof data === 'object') {
      const keys = Object.keys(data);
      if (keys.length < 3) return 1800;            // 30 min - dados incompletos
      if (data.products && data.products.length > 10) return 7200; // 2 horas - dados ricos
      return defaultTTL;                           // 1 hora - padrão
    }

    return defaultTTL;
  }

  // Método de limpeza forçada
  async flush() {
    try {
      this.localCache.flushAll();
      
      if (this.redisAvailable && this.redisClient) {
        await this.redisClient.flushAll();
      }
      
      console.log('🧹 Cache completely flushed');
      return true;
    } catch (error) {
      console.error('❌ Cache flush error:', error.message);
      return false;
    }
  }

  // Cleanup no encerramento
  async close() {
    if (this.redisClient) {
      try {
        await this.redisClient.disconnect();
        console.log('👋 Redis connection closed');
      } catch (error) {
        console.warn('⚠️ Redis close error:', error.message);
      }
    }
  }
}

// Singleton instance
const cacheService = new UnifiedCacheService();

// Graceful shutdown
process.on('SIGINT', async () => {
  await cacheService.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cacheService.close();
  process.exit(0);
});

module.exports = cacheService;
