/**
 * Controlador para o Motor de Busca Híbrido
 * Oferece endpoints para o novo motor de busca otimizado
 */

const hybridSearchService = require('../services/hybridSearchService');

/**
 * Busca produtos usando o motor híbrido
 * GET /api/hybrid-search/buscar
 */
exports.buscarProdutos = async (req, res) => {
  try {
    console.log('[HybridSearch] Requisição recebida:', req.query);
    
    const { query, categoria, precoMin, precoMax, idade, genero, num = 10 } = req.query;
    
    // Validar parâmetros
    if (!query && !categoria && !genero && !idade) {
      return res.status(400).json({
        erro: 'É necessário fornecer pelo menos um parâmetro de busca (query, categoria, genero ou idade)'
      });
    }
    
    // Construir filtros
    const filtros = {
      query,
      categoria,
      precoMin: precoMin ? parseInt(precoMin) : undefined,
      precoMax: precoMax ? parseInt(precoMax) : undefined,
      idade,
      genero,
      num: parseInt(num)
    };
    
    // Registrar hora de início
    const inicio = Date.now();
    
    // Executar busca
    const produtos = await hybridSearchService.buscarProdutos(filtros);
    
    // Calcular tempo de execução
    const tempoExecucao = Date.now() - inicio;
    
    // Construir resposta
    const resultado = {
      sucesso: true,
      termo: query || categoria || 'personalizado',
      totalResultados: produtos.length,
      produtos: produtos,
      fonte: 'Motor de Busca Híbrido',
      filtros: filtros,
      tempoExecucao: `${tempoExecucao}ms`,
      timestamp: new Date().toISOString()
    };
    
    console.log('[HybridSearch] Resposta enviada:', {
      sucesso: resultado.sucesso,
      totalResultados: resultado.totalResultados,
      tempoExecucao: resultado.tempoExecucao
    });
    
    res.json(resultado);
  } catch (error) {
    console.error('[HybridSearch] Erro no controller:', error);
    
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao processar a busca',
      detalhes: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Limpa o cache do motor de busca
 * GET /api/hybrid-search/limpar-cache
 */
exports.limparCache = (req, res) => {
  try {
    hybridSearchService.limparCache();
    
    res.json({
      sucesso: true,
      mensagem: 'Cache limpo com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[HybridSearch] Erro ao limpar cache:', error);
    
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao limpar cache',
      detalhes: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Obtém estatísticas do cache
 * GET /api/hybrid-search/estatisticas-cache
 */
exports.obterEstatisticasCache = (req, res) => {
  try {
    const estatisticas = hybridSearchService.obterEstatisticasCache();
    
    res.json({
      sucesso: true,
      estatisticas,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[HybridSearch] Erro ao obter estatísticas do cache:', error);
    
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao obter estatísticas do cache',
      detalhes: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
