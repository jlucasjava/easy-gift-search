// Controller para integrar o motor de busca personalizado
const googleSearchService = require('../services/googleSearchService');
const customSearchService = require('../services/customSearchService');

/**
 * Busca produtos usando motor personalizado
 */
exports.buscarCustom = async (req, res) => {
  try {
    const { query, precoMin, precoMax, idade, genero, num = 10 } = req.query;

    console.log('[CustomSearch] Requisição recebida:', req.query);

    if (!query) {
      return res.status(400).json({
        erro: 'Parâmetro "query" é obrigatório'
      });
    }

    const filtros = {
      query,
      precoMin: precoMin ? parseInt(precoMin) : undefined,
      precoMax: precoMax ? parseInt(precoMax) : undefined,
      idade,
      genero,
      num: parseInt(num)
    };

    const produtos = await customSearchService.buscarProdutos(filtros);

    const resultado = {
      sucesso: true,
      query: query,
      totalResultados: produtos.length,
      produtos: produtos,
      fonte: 'Motor de Busca Personalizado',
      filtros: filtros,
      timestamp: new Date().toISOString()
    };

    console.log('[CustomSearch] Resposta enviada:', {
      sucesso: resultado.sucesso,
      totalResultados: resultado.totalResultados
    });

    res.json(resultado);

  } catch (error) {
    console.error('[CustomSearch] Erro no controller Custom Search:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Busca comparativa entre Google e motor personalizado
 */
exports.buscaComparativa = async (req, res) => {
  try {
    const { query, precoMax, idade, genero } = req.query;
    
    console.log('[BuscaComparativa] Requisição recebida:', req.query);
    
    if (!query) {
      return res.status(400).json({
        erro: 'É necessário fornecer o parâmetro "query" para busca'
      });
    }
    
    // Construir filtros para a busca
    const filtrosGoogle = {
      categoria: query,
      precoMax: precoMax ? parseInt(precoMax) : undefined,
      idade,
      genero,
      num: 5
    };

    const filtrosCustom = {
      query,
      precoMax: precoMax ? parseInt(precoMax) : undefined,
      idade,
      genero,
      num: 5
    };
    
    // Executar ambas as buscas em paralelo
    const [resultadoGoogle, resultadoCustom] = await Promise.all([
      googleSearchService.buscarPresentesGoogle(filtrosGoogle),
      customSearchService.buscarProdutos(filtrosCustom)
    ]);
    
    // Formatar resposta
    const resposta = {
      sucesso: true,
      termo_busca: query,
      filtros: {
        precoMax,
        idade,
        genero
      },
      google: {
        produtos: resultadoGoogle.produtos || [],
        total: resultadoGoogle.produtos?.length || 0,
        fonte: 'Google Custom Search API'
      },
      personalizado: {
        produtos: resultadoCustom || [],
        total: resultadoCustom?.length || 0,
        fonte: 'Motor de Busca Personalizado'
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('[BuscaComparativa] Resposta enviada:', {
      sucesso: resposta.sucesso,
      total_google: resposta.google.total,
      total_personalizado: resposta.personalizado.total
    });
    
    res.json(resposta);
    
  } catch (error) {
    console.error('[BuscaComparativa] Erro na busca comparativa:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Limpa o cache do motor personalizado
 */
exports.limparCache = async (req, res) => {
  try {
    const itemsRemovidos = customSearchService.limparCache();
    
    res.json({
      sucesso: true,
      mensagem: `Cache limpo com sucesso: ${itemsRemovidos} itens removidos`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[LimparCache] Erro ao limpar cache:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

module.exports = exports;
