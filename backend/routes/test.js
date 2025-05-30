// Rota de teste para Amazon RapidAPI
const express = require('express');
const router = express.Router();
const amazonService = require('../services/amazonService');

// GET /api/test/amazon - Testa a integração Amazon
router.get('/amazon', async (req, res) => {
  try {
    console.log('🧪 Testando API Amazon via endpoint');
    
    const { query = 'electronics', useReal = 'false' } = req.query;
    
    // Temporariamente força o uso da API real se solicitado
    const originalEnv = process.env.USE_REAL_AMAZON_API;
    if (useReal === 'true') {
      process.env.USE_REAL_AMAZON_API = 'true';
    }
    
    const resultado = await amazonService.buscarProdutos({ genero: query });
    
    // Restaura configuração original
    process.env.USE_REAL_AMAZON_API = originalEnv;
    
    res.json({
      sucesso: true,
      fonte: useReal === 'true' ? 'API Real (RapidAPI)' : 'Mock Data',
      query: query,
      totalProdutos: resultado.length,
      produtos: resultado,
      configuracao: {
        rapidapi_key_configurada: !!process.env.RAPIDAPI_KEY,
        use_real_api: process.env.USE_REAL_AMAZON_API === 'true'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no teste Amazon:', error.message);
    res.status(500).json({
      sucesso: false,
      erro: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/test/amazon/real - Força teste da API real
router.get('/amazon/real', async (req, res) => {
  try {
    console.log('🚀 Testando API Amazon REAL diretamente');
    
    const { query = 'gift' } = req.query;
    
    const resultado = await amazonService.buscarProdutosAmazonReal({ genero: query });
    
    res.json({
      sucesso: true,
      fonte: 'API Real (RapidAPI)',
      query: query,
      totalProdutos: resultado.length,
      produtos: resultado
    });
    
  } catch (error) {
    console.error('❌ Erro no teste Amazon real:', error.message);
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

module.exports = router;
