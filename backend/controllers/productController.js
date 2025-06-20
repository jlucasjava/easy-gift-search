// Controller de produtos: Simplificado para usar apenas Google Search API
const googleSearchService = require('../services/googleSearchService');

exports.searchProducts = async (req, res) => {
  try {
    console.log('🔍 API /products/search chamada com query:', req.query);
    const { 
      precoMin, 
      precoMax, 
      idade, 
      genero, 
      page = 1, 
      num = 10,
      query 
    } = req.query;
    
    const filtros = { 
      precoMin, 
      precoMax, 
      idade, 
      genero, 
      page: parseInt(page),
      num: parseInt(num),
      categoria: query 
    };
    
    // Usar apenas Google Search API
    const resultado = await googleSearchService.buscarPresentesGoogle(filtros);
    
    res.json({
      produtos: resultado.produtos || [],
      pagina: resultado.pagina || parseInt(page),
      totalPaginas: resultado.totalPaginas || 1,
      totalResultados: resultado.totalResultados || resultado.produtos?.length || 0,
      query: resultado.query || query,
      timestamp: new Date().toISOString(),
      fonte: 'Google Search API'
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error.message);
    res.status(500).json({ 
      erro: 'Erro interno do servidor', 
      detalhes: error.message 
    });
  }
};

// Endpoint de recomendação - Simplificado para usar Google Search
exports.getRecommendation = async (req, res) => {
  try {
    console.log('🧠 API /recommend chamada com body:', req.body);
    const { precoMax, idade, genero, interesses } = req.body;
    
    // Construir query baseada nos interesses
    const filtros = {
      precoMax,
      idade,
      genero,
      categoria: interesses || 'interessantes'
    };
    
    // Usar Google Search API para recomendações
    const resultado = await googleSearchService.buscarPresentesGoogle(filtros);
    
    res.json({
      sucesso: true,
      recomendacoes: resultado.produtos || [],
      total: resultado.produtos?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Erro ao gerar recomendações:', error.message);
    res.status(500).json({ 
      erro: 'Erro interno do servidor', 
      detalhes: error.message 
    });
  }
};

// Endpoint de teste para verificar a conexão com a API
exports.testApi = async (req, res) => {
  try {
    const teste = await googleSearchService.testarAPIsGoogle();
    
    res.json({
      status: 'OK',
      message: 'API Easy Gift Search está funcionando!',
      google_api: teste.sucesso ? 'Operacional' : 'Falha',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro no teste de API:', error.message);
    res.status(500).json({ 
      erro: 'Erro interno do servidor', 
      detalhes: error.message 
    });
  }
};
