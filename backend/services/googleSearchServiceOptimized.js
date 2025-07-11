/**
 * 🚀 OPTIMIZED GOOGLE SEARCH SERVICE
 * Easy Gift Search - Performance Optimization
 * Sistema de busca otimizado com cache inteligente e rate limiting
 */

const axios = require('axios');
const https = require('https');
const cacheService = require('./cacheService');
const simulateGoogleResults = require('./simulateGoogleResults');
const { performance } = require('perf_hooks');
require('dotenv').config();

// Configuração HTTPS otimizada
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50,
  timeout: 10000
});

// Configuração do axios otimizada
const axiosInstance = axios.create({
  httpsAgent,
  timeout: 15000,
  headers: {
    'User-Agent': 'Easy-Gift-Search/2.0 (Performance Optimized)',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br'
  }
});

class OptimizedGoogleSearchService {
  constructor() {
    this.requestQueue = new Map();          // Deduplicação de requests
    this.lastRequestTime = 0;               // Rate limiting
    this.minInterval = 100;                 // 100ms entre requests
    this.maxRetries = 3;                    // Máximo de tentativas
    this.retryDelay = 1000;                 // Delay entre tentativas
    
    // Estatísticas
    this.stats = {
      requests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      duplicates: 0,
      avgResponseTime: 0,
      totalResponseTime: 0
    };

    // Configuração de rate limiting dinâmico
    this.rateLimitConfig = {
      requestsPerMinute: 100,
      currentRequests: 0,
      resetTime: Date.now() + 60000
    };
  }

  /**
   * Busca produtos otimizada
   */
  async searchProducts(query, options = {}) {
    const startTime = performance.now();
    
    try {
      // Normalizar parâmetros
      const normalizedOptions = this.normalizeOptions(options);
      const { num = 10, start = 1, useCache = true, filtros = {} } = normalizedOptions;

      // Gerar chave de cache inteligente
      const cacheKey = cacheService.generateKey('google_search', query, {
        num,
        start,
        ...filtros
      });

      this.stats.requests++;

      // 1. Verificar cache primeiro
      if (useCache) {
        const cachedResult = await cacheService.get(cacheKey);
        if (cachedResult) {
          this.stats.cacheHits++;
          const duration = performance.now() - startTime;
          console.log(`🚀 Cache hit for: "${query}" (${duration.toFixed(2)}ms)`);
          this.updateResponseTime(duration);
          return cachedResult;
        }
      }

      this.stats.cacheMisses++;

      // 2. Verificar deduplicação
      if (this.requestQueue.has(cacheKey)) {
        this.stats.duplicates++;
        console.log(`⏳ Aguardando request duplicado: "${query}"`);
        return await this.requestQueue.get(cacheKey);
      }

      // 3. Executar busca otimizada
      const searchPromise = this.executeOptimizedSearch(query, normalizedOptions);
      this.requestQueue.set(cacheKey, searchPromise);

      const result = await searchPromise;
      this.requestQueue.delete(cacheKey);

      // 4. Cache resultado com TTL dinâmico
      if (useCache && result) {
        const ttl = cacheService.calculateDynamicTTL(result.products);
        await cacheService.set(cacheKey, result, ttl);
      }

      const duration = performance.now() - startTime;
      this.updateResponseTime(duration);
      console.log(`✅ Search completed: "${query}" (${duration.toFixed(2)}ms)`);

      return result;

    } catch (error) {
      this.stats.errors++;
      const duration = performance.now() - startTime;
      console.error(`❌ Search error for "${query}" (${duration.toFixed(2)}ms):`, error.message);
      
      // Fallback para dados simulados
      return this.getFallbackResults(query, options);
    }
  }

  /**
   * Executar busca otimizada com retry e rate limiting
   */
  async executeOptimizedSearch(query, options) {
    const { num, start, filtros } = options;

    // Verificar se pode usar API real
    if (!this.canUseRealAPI()) {
      console.log(`🔄 Usando dados simulados para: "${query}"`);
      return simulateGoogleResults(query, num, start);
    }

    // Rate limiting inteligente
    await this.respectRateLimit();

    // Preparar query otimizada
    const optimizedQuery = this.optimizeQuery(query, filtros);

    // Executar busca com retry
    return await this.executeWithRetry(optimizedQuery, num, start);
  }

  /**
   * Executar request com retry automático
   */
  async executeWithRetry(query, num, start, attempt = 1) {
    try {
      const url = 'https://www.googleapis.com/customsearch/v1';
      const params = {
        key: process.env.GOOGLE_SEARCH_API_KEY,
        cx: process.env.GOOGLE_SEARCH_CX,
        q: query,
        num: Math.min(num, 10),
        start: Math.max(start, 1),
        safe: 'medium',
        lr: 'lang_pt',
        gl: 'br',
        hl: 'pt-br'
      };

      const response = await axiosInstance.get(url, { params });
      
      if (!response.data) {
        throw new Error('Empty response from Google API');
      }

      return this.processGoogleResponse(response.data, query);

    } catch (error) {
      console.error(`❌ Tentativa ${attempt} falhou:`, error.message);

      if (attempt < this.maxRetries) {
        // Delay exponencial
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(query, num, start, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Processar resposta do Google de forma otimizada
   */
  processGoogleResponse(data, originalQuery) {
    const items = data.items || [];
    const products = [];
    
    items.forEach(item => {
      try {
        const product = this.extractProductInfo(item, originalQuery);
        if (product && this.isValidProduct(product)) {
          products.push(product);
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao processar item:`, error.message);
      }
    });

    return {
      products,
      totalResults: data.searchInformation?.totalResults || 0,
      searchTime: data.searchInformation?.searchTime || 0,
      query: originalQuery,
      source: 'google_api',
      cached: false,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Extrair informações do produto de forma otimizada
   */
  extractProductInfo(item, query) {
    const priceExtractor = require('./priceExtractor');
    
    // Extrair preço do título e snippet
    const titlePrice = priceExtractor.extractPrice(item.title || '');
    const snippetPrice = priceExtractor.extractPrice(item.snippet || '');
    const finalPrice = titlePrice || snippetPrice;

    // Detectar domínio da loja
    const domain = this.extractDomain(item.link);
    const store = this.identifyStore(domain);

    return {
      title: this.cleanTitle(item.title || 'Produto sem título'),
      description: this.cleanDescription(item.snippet || ''),
      price: finalPrice,
      originalPrice: finalPrice,
      discount: 0,
      link: item.link,
      image: this.extractImage(item),
      store: store,
      domain: domain,
      source: 'google_search',
      relevanceScore: this.calculateRelevance(item, query),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calcular relevância do produto
   */
  calculateRelevance(item, query) {
    const queryWords = query.toLowerCase().split(' ');
    const titleWords = (item.title || '').toLowerCase();
    const snippetWords = (item.snippet || '').toLowerCase();
    
    let score = 0;
    
    queryWords.forEach(word => {
      if (titleWords.includes(word)) score += 2;
      if (snippetWords.includes(word)) score += 1;
    });

    return Math.min(score, 10); // Máximo 10
  }

  /**
   * Validar se é um produto válido
   */
  isValidProduct(product) {
    return product.title && 
           product.title.length > 5 && 
           product.link && 
           product.link.startsWith('http') &&
           !product.link.includes('google.com');
  }

  /**
   * Extrair domínio da URL
   */
  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  }

  /**
   * Identificar loja pelo domínio
   */
  identifyStore(domain) {
    const storeMap = {
      'amazon.com.br': 'Amazon',
      'mercadolivre.com.br': 'Mercado Livre',
      'shopee.com.br': 'Shopee',
      'aliexpress.com': 'AliExpress',
      'submarino.com.br': 'Submarino',
      'americanas.com.br': 'Americanas',
      'extra.com.br': 'Extra',
      'casasbahia.com.br': 'Casas Bahia',
      'pontofrio.com.br': 'Ponto Frio',
      'magazineluiza.com.br': 'Magazine Luiza',
      'kabum.com.br': 'KaBuM',
      'netshoes.com.br': 'Netshoes'
    };

    return storeMap[domain] || domain;
  }

  /**
   * Extrair imagem do item
   */
  extractImage(item) {
    if (item.pagemap?.cse_image?.[0]?.src) {
      return item.pagemap.cse_image[0].src;
    }
    
    if (item.pagemap?.metatags?.[0]?.['og:image']) {
      return item.pagemap.metatags[0]['og:image'];
    }

    return null;
  }

  /**
   * Limpar título do produto
   */
  cleanTitle(title) {
    return title
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-àáâãäåāăąèéêëēęěìíîïīįįòóôõöøōœúùûüūůűųñç]/gi, '')
      .trim()
      .substring(0, 100);
  }

  /**
   * Limpar descrição do produto
   */
  cleanDescription(description) {
    return description
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-àáâãäåāăąèéêëēęěìíîïīįįòóôõöøōœúùûüūůűųñç.,!?]/gi, '')
      .trim()
      .substring(0, 200);
  }

  /**
   * Otimizar query para melhor performance
   */
  optimizeQuery(query, filtros = {}) {
    let optimized = query.trim().toLowerCase();
    
    // Adicionar filtros específicos
    if (filtros.priceRange) {
      optimized += ` preço ${filtros.priceRange}`;
    }
    
    if (filtros.category) {
      optimized += ` ${filtros.category}`;
    }

    if (filtros.store) {
      optimized += ` site:${filtros.store}`;
    }

    // Adicionar termos brasileiros para melhor localização
    if (!optimized.includes('brasil') && !optimized.includes('br')) {
      optimized += ' brasil';
    }

    return optimized;
  }

  /**
   * Normalizar opções de busca
   */
  normalizeOptions(options) {
    return {
      num: Math.min(parseInt(options.num) || 10, 10),
      start: Math.max(parseInt(options.start) || 1, 1),
      useCache: options.useCache !== false,
      filtros: options.filtros || {}
    };
  }

  /**
   * Verificar se pode usar API real
   */
  canUseRealAPI() {
    return process.env.GOOGLE_SEARCH_API_KEY && 
           process.env.GOOGLE_SEARCH_CX && 
           process.env.USE_GOOGLE_SEARCH_API === 'true';
  }

  /**
   * Rate limiting inteligente
   */
  async respectRateLimit() {
    const now = Date.now();
    
    // Reset contador se passou 1 minuto
    if (now > this.rateLimitConfig.resetTime) {
      this.rateLimitConfig.currentRequests = 0;
      this.rateLimitConfig.resetTime = now + 60000;
    }

    // Verificar limite
    if (this.rateLimitConfig.currentRequests >= this.rateLimitConfig.requestsPerMinute) {
      const waitTime = this.rateLimitConfig.resetTime - now;
      console.log(`⏳ Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.rateLimitConfig.currentRequests = 0;
      this.rateLimitConfig.resetTime = Date.now() + 60000;
    }

    // Interval mínimo entre requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
    this.rateLimitConfig.currentRequests++;
  }

  /**
   * Obter resultados fallback
   */
  getFallbackResults(query, options) {
    const { num = 10, start = 1 } = options;
    console.log(`🔄 Using fallback data for: "${query}"`);
    return simulateGoogleResults(query, num, start);
  }

  /**
   * Atualizar tempo de resposta médio
   */
  updateResponseTime(duration) {
    this.stats.totalResponseTime += duration;
    this.stats.avgResponseTime = this.stats.totalResponseTime / this.stats.requests;
  }

  /**
   * Obter estatísticas do serviço
   */
  getStats() {
    const cacheHitRate = this.stats.requests > 0 ? 
      ((this.stats.cacheHits / this.stats.requests) * 100).toFixed(2) : 0;
    
    const errorRate = this.stats.requests > 0 ? 
      ((this.stats.errors / this.stats.requests) * 100).toFixed(2) : 0;

    return {
      ...this.stats,
      cacheHitRate,
      errorRate,
      avgResponseTime: this.stats.avgResponseTime.toFixed(2),
      pendingRequests: this.requestQueue.size,
      rateLimitStatus: this.rateLimitConfig
    };
  }
}

// Singleton instance
const googleSearchService = new OptimizedGoogleSearchService();

// Função de compatibilidade com código existente
async function searchGoogle(query, num = 10, start = 1, useCache = true, filtros = {}) {
  const result = await googleSearchService.searchProducts(query, {
    num,
    start,
    useCache,
    filtros
  });
  
  return result;
}

// Exportar tanto o serviço quanto a função legacy
module.exports = {
  searchGoogle,
  googleSearchService,
  OptimizedGoogleSearchService
};
