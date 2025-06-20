/**
 * Controller para recomendações de presentes - Versão Google Custom Search
 */

const googleSearchService = require('../services/googleSearchService');

/**
 * Obtém recomendações de presentes baseado nos critérios
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
async function getRecommendation(req, res) {
  try {
    const { query, filtros = {} } = req.body;
    
    if (!query) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O parâmetro "query" é obrigatório'
      });
    }
    
    console.log(`📊 Processando recomendação para: "${query}"`);
    
    // Obter recomendações usando o serviço do Google
    const resultados = await googleSearchService.getRecommendations(query);
    
    return res.json({
      sucesso: true,
      recomendacoes: resultados.items || [],
      query: query,
      cacheStatus: resultados.fromCache ? 'hit' : 'miss',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter recomendações:', error.message);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao processar recomendações',
      erro: error.message
    });
  }
}

/**
 * Obtém recomendações aleatórias de presentes
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
async function getRandomRecommendation(req, res) {
  try {
    // Lista de queries para presentes populares
    const popularQueries = [
      'presente tecnologia',
      'presente decoração casa',
      'presente aniversário',
      'presente namorado',
      'presente namorada',
      'presente amigo secreto',
      'presente criativo',
      'presente útil'
    ];
    
    // Selecionar uma query aleatória
    const randomQuery = popularQueries[Math.floor(Math.random() * popularQueries.length)];
    
    console.log(`🎲 Processando recomendação aleatória: "${randomQuery}"`);
    
    // Obter recomendações usando o serviço do Google
    const resultados = await googleSearchService.getRecommendations(randomQuery);
    
    return res.json({
      sucesso: true,
      recomendacoes: resultados.items || [],
      query: randomQuery,
      tipo: 'aleatório',
      cacheStatus: resultados.fromCache ? 'hit' : 'miss',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter recomendações aleatórias:', error.message);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao processar recomendações aleatórias',
      erro: error.message
    });
  }
}

/**
 * Limpa o cache de resultados
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
async function clearCache(req, res) {
  try {
    const removedItems = googleSearchService.clearCache();
    
    return res.json({
      sucesso: true,
      mensagem: `Cache limpo com sucesso: ${removedItems} itens removidos`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao limpar cache:', error.message);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao limpar cache',
      erro: error.message
    });
  }
}

/**
 * Obtém estatísticas do cache
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
async function getCacheStats(req, res) {
  try {
    const stats = googleSearchService.getCacheStats();
    
    return res.json({
      sucesso: true,
      stats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas do cache:', error.message);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao obter estatísticas do cache',
      erro: error.message
    });
  }
}

module.exports = {
  getRecommendation,
  getRandomRecommendation,
  clearCache,
  getCacheStats
};
