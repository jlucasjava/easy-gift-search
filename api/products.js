// Vercel serverless function for products endpoint
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import services
const amazonService = require('../backend/services/amazonService');
const shopeeService = require('../backend/services/shopeeService');
const aliexpressService = require('../backend/services/aliexpressService');
const mercadoLivreService = require('../backend/services/mercadoLivreService');

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'https://easy-gift-search.vercel.app',
    'http://localhost:3000',
    'http://localhost:5500'
  ],
  credentials: true
}));

app.use(express.json());

// Products endpoint
app.get('/', async (req, res) => {
  try {
    console.log('🔍 API /products chamada com query:', req.query);
    
    const filters = {
      palavra_chave: req.query.palavra_chave || '',
      precoMin: req.query.precoMin,
      precoMax: req.query.precoMax,
      idade: req.query.idade,
      genero: req.query.genero,
      page: req.query.page || 1
    };

    // Debug environment variables
    console.log('🔧 Environment Status:');
    console.log(`USE_REAL_SHOPEE_API: ${process.env.USE_REAL_SHOPEE_API}`);
    console.log(`SHOPEE_SCRAPER_API_KEY: ${process.env.SHOPEE_SCRAPER_API_KEY ? 'SET' : 'NOT SET'}`);

    // Buscar produtos de todos os marketplaces
    const [mercadoLivre, amazon, shopee, aliexpress] = await Promise.all([
      mercadoLivreService.buscarProdutos(filters),
      amazonService.buscarProdutos(filters),
      shopeeService.buscarProdutosShopee(filters),
      aliexpressService.buscarProdutos(filters)
    ]);

    // Combinar todos os produtos
    const todosProdutos = [
      ...mercadoLivre,
      ...amazon,
      ...shopee,
      ...aliexpress
    ];

    console.log(`✅ Total de produtos encontrados: ${todosProdutos.length}`);
    res.json(todosProdutos);

  } catch (error) {
    console.error('❌ Erro na busca de produtos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

module.exports = app;
