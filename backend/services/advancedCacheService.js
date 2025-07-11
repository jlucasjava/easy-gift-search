/**
 * 🚀 REDIS CACHE SERVICE - OPTIMIZED
 * Easy Gift Search - High Performance Cache
 */

const Redis = require('ioredis');
const NodeCache = require('node-cache');
const crypto = require('crypto');

class AdvancedCacheService {
  constructor() {
    // Cache local para fallback
    this.localCache = new NodeCache({ 
      stdTTL: 1800,        // 30 minutos
      checkperiod: 60,     // Check a cada 1 min
      maxKeys: 2000,       // Mais chaves em memória
      useClones: false
    });
    
    // Redis cluster configuration
    this.redisCluster = null;
    this.redisAvailable = false;
    
    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      errors: 0,
      localHits: 0,
      redisHits: 0,
      compressionRatio: 0,
      avgResponseTime: 0
    };
    
    // Cache layers por tipo
    this.cacheLayers = {
      search: { ttl: 3600, compress: true },      // 1 hora
      product: { ttl: 7200, compress: true },     // 2 horas
      price: { ttl: 1800, compress: false },      // 30 min
      ai: { ttl: 86400, compress: true },         // 24 horas
      static: { ttl: 604800, compress: true }     // 7 dias
    };
    
    this.initializeRedis();
  }

  async initializeRedis() {
    try {
      const redisConfig = {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000
      };

      if (process.env.REDIS_URL) {
        this.redisCluster = new Redis(process.env.REDIS_URL, {
          ...redisConfig,
          retryDelayOnFailover: 100,
          enableOfflineQueue: false
        });
      } else if (process.env.NODE_ENV === 'production') {
        this.redisCluster = new Redis(redisConfig);
      }

      if (this.redisCluster) {
        this.redisCluster.on('connect', () => {
          console.log('✅ Redis connected successfully'.green);
          this.redisAvailable = true;
        });

        this.redisCluster.on('error', (err) => {
          console.warn('⚠️ Redis error, falling back to local cache:', err.message);
          this.redisAvailable = false;
          this.stats.errors++;
        });
      }
    } catch (error) {
      console.warn('⚠️ Redis initialization failed, using local cache only');
      this.redisAvailable = false;
    }
  }

  // Geração de chave otimizada
  generateKey(prefix, data) {
    if (typeof data === 'string') {
      return `${prefix}:${crypto.createHash('md5').update(data).digest('hex')}`;
    }
    return `${prefix}:${crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')}`;
  }

  // Compressão de dados
  compress(data) {
    if (typeof data === 'string' && data.length > 1000) {
      const zlib = require('zlib');
      return {
        compressed: true,
        data: zlib.gzipSync(data).toString('base64')
      };
    }
    return { compressed: false, data };
  }

  // Descompressão de dados
  decompress(cachedData) {
    if (cachedData.compressed) {
      const zlib = require('zlib');
      return zlib.gunzipSync(Buffer.from(cachedData.data, 'base64')).toString();
    }
    return cachedData.data;
  }

  // Get com multi-layer
  async get(key, type = 'search') {
    const startTime = Date.now();
    
    try {
      // Tentar Redis primeiro
      if (this.redisAvailable && this.redisCluster) {
        const redisData = await this.redisCluster.get(key);
        if (redisData) {
          this.stats.hits++;
          this.stats.redisHits++;
          const parsed = JSON.parse(redisData);
          return this.decompress(parsed);
        }
      }

      // Fallback para cache local
      const localData = this.localCache.get(key);
      if (localData) {
        this.stats.hits++;
        this.stats.localHits++;
        return this.decompress(localData);
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.warn('Cache get error:', error.message);
      this.stats.errors++;
      return null;
    } finally {
      this.updateResponseTime(Date.now() - startTime);
    }
  }

  // Set com multi-layer e compressão
  async set(key, value, type = 'search') {
    try {
      const config = this.cacheLayers[type] || this.cacheLayers.search;
      const processedData = config.compress ? this.compress(value) : { compressed: false, data: value };
      
      // Salvar no Redis
      if (this.redisAvailable && this.redisCluster) {
        await this.redisCluster.setex(key, config.ttl, JSON.stringify(processedData));
      }

      // Salvar no cache local também
      this.localCache.set(key, processedData, config.ttl);
      
      this.stats.sets++;
      return true;
    } catch (error) {
      console.warn('Cache set error:', error.message);
      this.stats.errors++;
      return false;
    }
  }

  // Invalidação inteligente
  async invalidate(pattern) {
    try {
      if (this.redisAvailable && this.redisCluster) {
        const keys = await this.redisCluster.keys(pattern);
        if (keys.length > 0) {
          await this.redisCluster.del(...keys);
        }
      }
      
      // Limpar cache local
      this.localCache.flushAll();
      return true;
    } catch (error) {
      console.warn('Cache invalidation error:', error.message);
      return false;
    }
  }

  // Estatísticas de performance
  updateResponseTime(time) {
    this.stats.avgResponseTime = (this.stats.avgResponseTime + time) / 2;
  }

  getStats() {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) * 100;
    return {
      ...this.stats,
      hitRate: hitRate.toFixed(2) + '%',
      redisAvailable: this.redisAvailable,
      localCacheSize: this.localCache.keys().length
    };
  }

  // Health check
  async healthCheck() {
    const startTime = Date.now();
    try {
      const testKey = 'health_check_' + Date.now();
      const testValue = 'ok';
      
      await this.set(testKey, testValue, 'static');
      const retrieved = await this.get(testKey, 'static');
      
      const isHealthy = retrieved === testValue;
      const responseTime = Date.now() - startTime;
      
      // Limpar teste
      await this.invalidate(testKey);
      
      return {
        healthy: isHealthy,
        responseTime,
        redisAvailable: this.redisAvailable,
        localCacheActive: true
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }
}

module.exports = new AdvancedCacheService();
