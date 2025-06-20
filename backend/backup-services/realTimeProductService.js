// Real-Time Product Search API Service
// API Documentation: https://real-time-product-search.p.rapidapi.com
require('dotenv').config();
const axios = require('axios');

class RealTimeProductSearchService {
  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY_NEW;
    this.baseURL = 'https://real-time-product-search.p.rapidapi.com';
    this.useRealAPI = process.env.USE_REAL_REALTIME_API === 'true';
    
    console.log('🕒 === REAL-TIME PRODUCT SEARCH SERVICE - VERIFICAÇÃO DE CONFIGURAÇÃO ===');
    console.log(`📋 USE_REAL_REALTIME_API: ${this.useRealAPI}`);
    console.log(`🔑 API Key disponível: ${this.apiKey ? 'SIM ✅' : 'NÃO ❌'}`);
    console.log(`🎯 DECISÃO: ${this.useRealAPI && this.apiKey ? 'USAR API REAL 🚀' : 'USAR DADOS MOCK 📦'}`);
    console.log('='.repeat(75));
  }

  async buscarProdutos(filtros) {
    if (!this.useRealAPI || !this.apiKey) {
      console.log('📦 Executando busca com DADOS MOCK...');
      return this.getMockData(filtros);
    }

    try {
      console.log('🌐 Executando busca com API REAL do Real-Time Product Search...');
      console.log(`📊 Filtros recebidos:`, filtros);
      
      // Build search query based on filters
      const searchQuery = this.buildSearchQuery(filtros);
      console.log(`🔍 Query de busca: ${searchQuery}`);      const response = await axios.get(`${this.baseURL}/search`, {
        params: {
          q: searchQuery,
          country: 'US',
          language: 'en',
          page: filtros.page || 1,
          limit: 20,
          sort_by: 'RELEVANCE',
          product_condition: 'ANY'
        },
        headers: {
          'x-rapidapi-host': 'real-time-product-search.p.rapidapi.com',
          'x-rapidapi-key': this.apiKey,
          'Accept': 'application/json'
        },
        timeout: 15000
      });

      console.log(`✅ API Real-Time Product Search respondeu com ${response.data?.data?.length || 0} produtos`);
      
      if (response.data && response.data.data) {
        return this.formatProducts(response.data.data, filtros);
      } else {
        console.log('⚠️ Resposta da API não contém produtos válidos');
        return this.getMockData(filtros);
      }

    } catch (error) {
      console.log(`❌ Erro na busca real Real-Time Product Search: ${error.message}`);
      console.log('🔄 Retornando dados mock devido ao erro');
      return this.getMockData(filtros);
    }
  }

  buildSearchQuery(filtros) {
    let query = '';
    
    if (filtros.palavra_chave) {
      query += filtros.palavra_chave + ' ';
    }
    
    if (filtros.genero) {
      if (filtros.genero === 'masculino') query += 'men male ';
      if (filtros.genero === 'feminino') query += 'women female ';
      if (filtros.genero === 'unisex') query += 'unisex ';
    }
    
    if (filtros.idade) {
      const idade = parseInt(filtros.idade);
      if (idade < 18) query += 'kids children ';
      else if (idade < 30) query += 'young adult ';
      else if (idade < 50) query += 'adult ';
      else query += 'senior ';
    }
    
    // Default to gift if no specific keyword
    if (!query.trim()) {
      query = 'gift present';
    }
    
    return query.trim();
  }

  formatProducts(products, filtros) {
    const formatted = products.map(product => {
      // Convert price from string to number
      let preco = 0;
      if (product.typical_price_range && product.typical_price_range[0]) {
        preco = parseFloat(product.typical_price_range[0].replace(/[^0-9.]/g, ''));
      } else if (product.offer && product.offer.price) {
        preco = parseFloat(product.offer.price.replace(/[^0-9.]/g, ''));
      }

      // Convert USD to BRL (approximate rate: 1 USD = 5.2 BRL)
      preco = preco * 5.2;

      return {
        nome: product.product_title || 'Produto sem nome',
        preco: preco.toFixed(2),
        link: product.product_page_url || '#',
        imagem: product.product_photos?.[0] || 'https://via.placeholder.com/300x300?text=Produto',
        marketplace: 'Real-Time Search',
        fonte: 'Real-Time Product Search API',
        rating: product.product_rating || 0,
        reviews: product.product_num_reviews || 0,
        disponibilidade: product.offer?.availability || 'Em estoque',
        categoria: product.product_category || 'Geral',
        api_usado: 'real-time-product-search'
      };
    });

    // Apply local filters
    return this.applyFilters(formatted, filtros);
  }

  applyFilters(produtos, filtros) {
    let filtered = produtos;

    // Filter by price range
    if (filtros.precoMin || filtros.precoMax) {
      const precoMin = parseFloat(filtros.precoMin) || 0;
      const precoMax = parseFloat(filtros.precoMax) || Infinity;
      
      filtered = filtered.filter(produto => {
        const preco = parseFloat(produto.preco);
        return preco >= precoMin && preco <= precoMax;
      });
      
      console.log(`Filtro preço: ${filtered.length} produtos restantes`);
    }

    // Additional filtering can be added here

    console.log(`✅ ${filtered.length} produtos encontrados após filtros`);
    return filtered;
  }

  getMockData(filtros) {
    console.log('🕒 Buscando produtos do Real-Time Search (MOCK)');
    console.log('Filtros:', filtros);

    const mockProducts = [
      {
        nome: 'Smartwatch Fitness Tracker Pro',
        preco: '89.90',
        link: '#',
        imagem: 'https://via.placeholder.com/300x300?text=Smartwatch',
        marketplace: 'Real-Time Search',
        fonte: 'Real-Time Product Search (MOCK)',
        rating: 4.5,
        reviews: 1250,
        disponibilidade: 'Em estoque',
        categoria: 'Eletrônicos',
        api_usado: 'real-time-product-search-mock'
      },
      {
        nome: 'Wireless Earbuds Premium',
        preco: '129.90',
        link: '#',
        imagem: 'https://via.placeholder.com/300x300?text=Earbuds',
        marketplace: 'Real-Time Search',
        fonte: 'Real-Time Product Search (MOCK)',
        rating: 4.7,
        reviews: 890,
        disponibilidade: 'Em estoque',
        categoria: 'Eletrônicos',
        api_usado: 'real-time-product-search-mock'
      },
      {
        nome: 'Portable Bluetooth Speaker',
        preco: '79.90',
        link: '#',
        imagem: 'https://via.placeholder.com/300x300?text=Speaker',
        marketplace: 'Real-Time Search',
        fonte: 'Real-Time Product Search (MOCK)',
        rating: 4.3,
        reviews: 567,
        disponibilidade: 'Em estoque',
        categoria: 'Eletrônicos',
        api_usado: 'real-time-product-search-mock'
      },
      {
        nome: 'Gaming Mouse RGB LED',
        preco: '59.90',
        link: '#',
        imagem: 'https://via.placeholder.com/300x300?text=Gaming+Mouse',
        marketplace: 'Real-Time Search',
        fonte: 'Real-Time Product Search (MOCK)',
        rating: 4.6,
        reviews: 423,
        disponibilidade: 'Em estoque',
        categoria: 'Gaming',
        api_usado: 'real-time-product-search-mock'
      },
      {
        nome: 'USB-C Fast Charger 65W',
        preco: '49.90',
        link: '#',
        imagem: 'https://via.placeholder.com/300x300?text=Charger',
        marketplace: 'Real-Time Search',
        fonte: 'Real-Time Product Search (MOCK)',
        rating: 4.4,
        reviews: 321,
        disponibilidade: 'Em estoque',
        categoria: 'Acessórios',
        api_usado: 'real-time-product-search-mock'
      }
    ];

    // Apply filters to mock data
    return this.applyFilters(mockProducts, filtros);
  }
}

// Export service functions
const realTimeService = new RealTimeProductSearchService();

async function buscarProdutos(filtros) {
  return await realTimeService.buscarProdutos(filtros);
}

module.exports = {
  buscarProdutos,
  RealTimeProductSearchService
};
