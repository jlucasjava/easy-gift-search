// Serviço de integração com API da Shopee
const axios = require('axios');
const axiosRetry = require('axios-retry');
const { v4: uuidv4 } = require('uuid');

// Configurar retry em caso de falhas
axiosRetry(axios, { 
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           (error.response && error.response.status >= 500);
  }
});

class ShopeeAPIService {
  constructor() {
    // Chaves e configuração da API
    this.apiKey = process.env.SHOPEE_API_KEY || '';
    this.baseUrl = 'https://shopee.com.br/api/v4';
    this.searchEndpoint = '/search/search_items';
    this.itemEndpoint = '/item/get';
    this.defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-API-SOURCE': 'pc',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Shopee-Language': 'pt-br'
    };
    
    // Estatísticas para monitoramento
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      lastError: null,
      lastSuccess: null
    };
    
    // Lista de User-Agents para rotação
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
    ];
  }
  
  /**
   * Obtém um User-Agent aleatório da lista
   * @returns {string} - User-Agent aleatório
   */
  getRandomUserAgent() {
    const index = Math.floor(Math.random() * this.userAgents.length);
    return this.userAgents[index];
  }
  
  /**
   * Busca produtos na API da Shopee
   * @param {string} query - Termo de busca
   * @param {number} limit - Limite de resultados
   * @param {number} page - Página de resultados
   * @returns {Promise<Array>} - Lista de produtos
   */
  async searchProducts(query, limit = 20, page = 0) {
    try {
      this.stats.totalRequests++;
      
      // Parâmetros da API de busca da Shopee
      const params = {
        by: 'relevancy',
        keyword: query,
        limit: limit,
        newest: page * limit,
        order: 'desc',
        page_type: 'search',
        scenario: 'PAGE_GLOBAL_SEARCH',
        version: 2
      };
      
      // Construir URL com os parâmetros
      const urlParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        urlParams.append(key, value);
      });
      
      // Preparar headers com User-Agent aleatório
      const headers = {
        ...this.defaultHeaders,
        'User-Agent': this.getRandomUserAgent(),
        'X-Request-Id': uuidv4()
      };
      
      // Fazer a requisição
      const response = await axios.get(`${this.baseUrl}${this.searchEndpoint}?${urlParams.toString()}`, {
        headers,
        timeout: 10000
      });
      
      // Verificar se a resposta é válida
      if (!response.data || !response.data.items) {
        throw new Error('Resposta inválida da API da Shopee');
      }
      
      // Registrar sucesso
      this.stats.successfulRequests++;
      this.stats.lastSuccess = new Date().toISOString();
      
      // Transformar os resultados no formato padrão
      return this.transformShopeeResults(response.data.items);
    } catch (error) {
      // Registrar falha
      this.stats.failedRequests++;
      this.stats.lastError = {
        message: error.message,
        timestamp: new Date().toISOString()
      };
      
      console.error('Erro ao buscar produtos na Shopee:', error.message);
      return [];
    }
  }
  
  /**
   * Transforma os resultados da Shopee para o formato padrão da aplicação
   * @param {Array} items - Itens retornados pela API da Shopee
   * @returns {Array} - Produtos no formato padrão
   */
  transformShopeeResults(items) {
    if (!Array.isArray(items)) {
      return [];
    }
    
    return items.map(item => {
      const itemData = item.item_basic || item;
      
      // Calcular preço com desconto, se disponível
      let price = itemData.price / 100000; // Preço na Shopee é multiplicado por 100000
      if (itemData.price_before_discount && itemData.price_before_discount > itemData.price) {
        price = itemData.price / 100000;
      }
      
      // Construir URL da imagem
      const imageId = itemData.image || 'default';
      const imageUrl = `https://cf.shopee.com.br/file/${imageId}_tn`;
      
      // Construir URL do produto
      const name = itemData.name.replace(/\s+/g, '-').toLowerCase();
      const shopId = itemData.shopid;
      const itemId = itemData.itemid;
      const productUrl = `https://shopee.com.br/${name}-i.${shopId}.${itemId}`;
      
      return {
        title: itemData.name,
        link: productUrl,
        price: price,
        image: imageUrl,
        domain: 'shopee.com.br',
        marketplace: 'Shopee',
        rating: (itemData.item_rating && itemData.item_rating.rating_star) ? itemData.item_rating.rating_star.toFixed(1) : null,
        source: 'shopee-api'
      };
    });
  }
  
  /**
   * Retorna estatísticas de uso da API
   * @returns {Object} - Estatísticas
   */
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalRequests > 0 
        ? (this.stats.successfulRequests / this.stats.totalRequests * 100).toFixed(2) + '%' 
        : '0%'
    };
  }
}

// Exportar o serviço
module.exports = new ShopeeAPIService();
