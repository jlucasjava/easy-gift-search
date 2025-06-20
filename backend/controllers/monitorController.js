// Controller para monitoramento da API
const apiMonitorService = require('../services/apiMonitorService');
const googleSearchService = require('../services/googleSearchService');

// Verificar status e quota da API do Google
exports.checkApiQuota = async (req, res) => {
  try {
    const result = await apiMonitorService.checkApiQuota();
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao verificar quota da API:', error.message);
    res.status(500).json({ 
      erro: 'Erro ao verificar quota da API', 
      detalhes: error.message 
    });
  }
};

// Obter estatísticas do cache
exports.getCacheStats = (req, res) => {
  try {
    const cache = googleSearchService.getCache();
    if (!cache) {
      return res.status(404).json({ erro: 'Cache não disponível' });
    }
    
    const stats = apiMonitorService.getCacheStats(cache);
    res.json(stats);
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas do cache:', error.message);
    res.status(500).json({ 
      erro: 'Erro ao obter estatísticas do cache', 
      detalhes: error.message 
    });
  }
};

// Limpar o cache
exports.clearCache = (req, res) => {
  try {
    const cache = googleSearchService.getCache();
    if (!cache) {
      return res.status(404).json({ erro: 'Cache não disponível' });
    }
    
    const result = apiMonitorService.clearCache(cache);
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error.message);
    res.status(500).json({ 
      erro: 'Erro ao limpar cache', 
      detalhes: error.message 
    });
  }
};
