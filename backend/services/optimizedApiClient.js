/**
 * 🚀 OPTIMIZED API CLIENT
 * Easy Gift Search - Enhanced API Performance
 */

const axios = require('axios');
const axiosRetry = require('axios-retry');
const { advancedLogger } = require('./advancedLogger');
const { alertSystem } = require('./alertSystem');

class OptimizedApiClient {
  constructor() {
    // Connection pooling configuration
    this.httpAgent = new (require('http').Agent)({
      keepAlive: true,
      maxSockets: 50,
      maxFreeSockets: 10,
      timeout: 30000,
      freeSocketTimeout: 30000
    });

    this.httpsAgent = new (require('https').Agent)({
      keepAlive: true,
      maxSockets: 50,
      maxFreeSockets: 10,
      timeout: 30000,
      freeSocketTimeout: 30000
    });

    // Circuit breaker state
    this.circuitBreakers = new Map();
    
    // Request batching
    this.requestBatches = new Map();
    
    // API client configurations
    this.apiClients = this.createApiClients();
    
    // Request statistics
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      circuitBreakerTrips: 0
    };
  }

  // Create optimized API clients
  createApiClients() {
    const clients = {};

    // Google Search API Client
    clients.googleSearch = axios.create({
      baseURL: 'https://www.googleapis.com/customsearch/v1',
      timeout: 10000,
      httpAgent: this.httpAgent,
      httpsAgent: this.httpsAgent,
      headers: {
        'User-Agent': 'Easy-Gift-Search/2.0',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate'
      }
    });

    // Amazon API Client
    clients.amazon = axios.create({
      baseURL: 'https://api.amazon.com',
      timeout: 15000,
      httpAgent: this.httpAgent,
      httpsAgent: this.httpsAgent,
      headers: {
        'User-Agent': 'Easy-Gift-Search/2.0',
        'Accept': 'application/json'
      }
    });

    // Mercado Livre API Client
    clients.mercadoLivre = axios.create({
      baseURL: 'https://api.mercadolibre.com',
      timeout: 12000,
      httpAgent: this.httpAgent,
      httpsAgent: this.httpsAgent,
      headers: {
        'User-Agent': 'Easy-Gift-Search/2.0',
        'Accept': 'application/json'
      }
    });

    // Configure retry logic for all clients
    Object.values(clients).forEach(client => {
      this.configureRetryLogic(client);
    });

    return clients;
  }

  // Configure retry logic with exponential backoff
  configureRetryLogic(client) {
    axiosRetry(client, {
      retries: 3,
      retryDelay: (retryCount) => {
        return Math.min(1000 * Math.pow(2, retryCount), 10000);
      },
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
               (error.response && error.response.status >= 500);
      },
      onRetry: (retryCount, error, requestConfig) => {
        advancedLogger.logSystem(`Retrying request: ${requestConfig.url}`, {
          retryCount,
          error: error.message,
          url: requestConfig.url
        });
      }
    });
  }

  // Circuit breaker implementation
  isCircuitBreakerOpen(apiName) {
    const breaker = this.circuitBreakers.get(apiName);
    if (!breaker) return false;

    const now = Date.now();
    
    // Check if circuit is open
    if (breaker.state === 'open') {
      if (now - breaker.lastFailure > breaker.timeout) {
        breaker.state = 'half-open';
        breaker.failures = 0;
        advancedLogger.logSystem(`Circuit breaker half-open: ${apiName}`);
      } else {
        return true;
      }
    }

    return false;
  }

  // Record API call result for circuit breaker
  recordApiResult(apiName, success) {
    if (!this.circuitBreakers.has(apiName)) {
      this.circuitBreakers.set(apiName, {
        failures: 0,
        lastFailure: 0,
        state: 'closed',
        timeout: 60000, // 1 minute
        threshold: 5
      });
    }

    const breaker = this.circuitBreakers.get(apiName);

    if (success) {
      breaker.failures = 0;
      if (breaker.state === 'half-open') {
        breaker.state = 'closed';
        advancedLogger.logSystem(`Circuit breaker closed: ${apiName}`);
      }
    } else {
      breaker.failures++;
      breaker.lastFailure = Date.now();

      if (breaker.failures >= breaker.threshold) {
        breaker.state = 'open';
        this.stats.circuitBreakerTrips++;
        advancedLogger.logSystem(`Circuit breaker opened: ${apiName}`, {
          failures: breaker.failures,
          threshold: breaker.threshold
        });
        
        alertSystem.recordApiFailure(apiName, new Error('Circuit breaker tripped'));
      }
    }
  }

  // Make API request with optimizations
  async makeRequest(apiName, config) {
    const startTime = Date.now();
    
    // Check circuit breaker
    if (this.isCircuitBreakerOpen(apiName)) {
      const error = new Error(`Circuit breaker is open for ${apiName}`);
      this.recordApiResult(apiName, false);
      throw error;
    }

    // Get appropriate client
    const client = this.apiClients[apiName];
    if (!client) {
      throw new Error(`API client not found: ${apiName}`);
    }

    try {
      this.stats.totalRequests++;
      
      // Make request
      const response = await client(config);
      const responseTime = Date.now() - startTime;
      
      // Update statistics
      this.stats.successfulRequests++;
      this.stats.averageResponseTime = 
        (this.stats.averageResponseTime + responseTime) / 2;
      
      // Record success
      this.recordApiResult(apiName, true);
      alertSystem.recordApiSuccess(apiName, config.url);
      
      // Log successful call
      advancedLogger.logApiCall(
        apiName, 
        config.url, 
        true, 
        responseTime, 
        response.status
      );

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Update statistics
      this.stats.failedRequests++;
      
      // Record failure
      this.recordApiResult(apiName, false);
      alertSystem.recordApiFailure(apiName, error, config.url);
      
      // Log failed call
      advancedLogger.logApiCall(
        apiName, 
        config.url, 
        false, 
        responseTime, 
        error.response?.status || 0, 
        error
      );

      throw error;
    }
  }

  // Batch requests (for APIs that support it)
  async batchRequests(apiName, requests, batchSize = 10) {
    const results = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(request => 
        this.makeRequest(apiName, request).catch(error => ({ error }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches to avoid overwhelming APIs
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  // Google Search API with optimization
  async searchGoogle(query, options = {}) {
    const config = {
      method: 'GET',
      url: '',
      params: {
        key: process.env.GOOGLE_SEARCH_API_KEY,
        cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
        q: query,
        num: options.limit || 10,
        ...options
      }
    };

    return this.makeRequest('googleSearch', config);
  }

  // Amazon API with optimization
  async searchAmazon(query, options = {}) {
    const config = {
      method: 'GET',
      url: '/search',
      params: {
        query,
        limit: options.limit || 10,
        ...options
      }
    };

    return this.makeRequest('amazon', config);
  }

  // Mercado Livre API with optimization
  async searchMercadoLivre(query, options = {}) {
    const config = {
      method: 'GET',
      url: '/sites/MLB/search',
      params: {
        q: query,
        limit: options.limit || 10,
        ...options
      }
    };

    return this.makeRequest('mercadoLivre', config);
  }

  // Get API statistics
  getStats() {
    const circuitBreakerStats = {};
    
    for (const [apiName, breaker] of this.circuitBreakers.entries()) {
      circuitBreakerStats[apiName] = {
        state: breaker.state,
        failures: breaker.failures,
        lastFailure: breaker.lastFailure ? new Date(breaker.lastFailure).toISOString() : null
      };
    }

    return {
      ...this.stats,
      circuitBreakers: circuitBreakerStats,
      timestamp: new Date().toISOString()
    };
  }

  // Health check
  async healthCheck() {
    const health = {
      status: 'healthy',
      apis: {},
      timestamp: new Date().toISOString()
    };

    // Check each API
    for (const [apiName, client] of Object.entries(this.apiClients)) {
      try {
        const startTime = Date.now();
        
        // Simple health check request
        await client.get('/health', { timeout: 5000 }).catch(() => {
          // Ignore errors for health check, just measure connectivity
        });
        
        const responseTime = Date.now() - startTime;
        const breaker = this.circuitBreakers.get(apiName);
        
        health.apis[apiName] = {
          status: breaker?.state === 'open' ? 'circuit_open' : 'available',
          responseTime,
          circuitBreaker: breaker?.state || 'closed'
        };
      } catch (error) {
        health.apis[apiName] = {
          status: 'error',
          error: error.message
        };
      }
    }

    return health;
  }
}

// Export singleton instance
const optimizedApiClient = new OptimizedApiClient();

module.exports = {
  optimizedApiClient,
  OptimizedApiClient
};
