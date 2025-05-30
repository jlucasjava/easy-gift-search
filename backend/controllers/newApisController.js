
const llamaService = require('../services/llamaService');
const googleSearchService = require('../services/googleSearchService');
const aliexpressService = require('../services/aliexpressService');

/**
 * Controller para gerenciar as novas APIs integradas:
 * - Llama AI (Open AI 21)
 * - Google Search APIs (2 versões)
 * - AliExpress DataHub API
 */

/**
 * Gera recomendações usando Llama AI
 */
exports.gerarRecomendacao = async (req, res) => {
  try {
    const { message, webAccess } = req.body;

    if (!message) {
      return res.status(400).json({
        erro: 'Parâmetro "message" é obrigatório'
      });
    }

    const resultado = await llamaService.gerarRecomendacaoLlama({
      message,
      webAccess: webAccess || false
    });

    res.json(resultado);

  } catch (error) {
    console.error('Erro no controller de recomendação:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Sugere presentes baseado em perfil usando Llama AI
 */
exports.sugerirPresentes = async (req, res) => {
  try {
    const { idade, genero, interesses, orcamento } = req.body;

    if (!idade || !genero || !interesses || !orcamento) {
      return res.status(400).json({
        erro: 'Parâmetros obrigatórios: idade, genero, interesses, orcamento'
      });
    }

    const resultado = await llamaService.sugerirPresentes({
      idade,
      genero,
      interesses,
      orcamento
    });

    res.json(resultado);

  } catch (error) {
    console.error('Erro no controller de sugestões:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Busca produtos usando Google Search APIs
 */
exports.buscarGoogle = async (req, res) => {
  try {
    const { query, api = 'both' } = req.query;

    if (!query) {
      return res.status(400).json({
        erro: 'Parâmetro "query" é obrigatório'
      });
    }

    let resultado;

    switch (api) {
      case '1':
        resultado = await googleSearchService.buscarGoogleAPI1({ query });
        break;
      case '2':
        resultado = await googleSearchService.buscarGoogleAPI2({ query });
        break;
      case 'both':
      default:
        resultado = await googleSearchService.buscarPresentesGoogle({ categoria: query });
        break;
    }

    res.json(resultado);

  } catch (error) {
    console.error('Erro no controller Google Search:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Busca detalhes de produto no AliExpress
 */
exports.detalheAliExpress = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({
        erro: 'Parâmetro "itemId" é obrigatório'
      });
    }

    const resultado = await aliexpressService.buscarDetalheProdutoAliExpress(itemId);

    res.json(resultado);

  } catch (error) {
    console.error('Erro no controller AliExpress:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Busca integrada combinando múltiplas APIs
 */
exports.buscaIntegrada = async (req, res) => {
  try {
    const { 
      query, 
      categoria = 'eletrônicos',
      idade = '25',
      genero = 'unissex',
      orcamento = '100'
    } = req.query;

    if (!query) {
      return res.status(400).json({
        erro: 'Parâmetro "query" é obrigatório'
      });
    }

    console.log(`🔄 Iniciando busca integrada para: "${query}"`);

    // Executar buscas em paralelo
    const [
      resultadosGoogle,
      recomendacaoLlama
    ] = await Promise.all([
      googleSearchService.buscarPresentesGoogle({ categoria: query }),
      llamaService.sugerirPresentes({
        idade,
        genero,
        interesses: query,
        orcamento
      })
    ]);

    const resultado = {
      sucesso: true,
      query: query,
      timestamp: new Date().toISOString(),
      dados: {
        busca_google: {
          sucesso: resultadosGoogle.sucesso,
          total_resultados: resultadosGoogle.totalResultados,
          resultados: resultadosGoogle.resultados?.slice(0, 10) || [] // Limitar a 10
        },
        recomendacao_ia: {
          sucesso: recomendacaoLlama.sucesso,
          resposta: recomendacaoLlama.resposta
        }
      },
      estatisticas: {
        total_fontes: 2,
        fontes_ativas: [
          resultadosGoogle.sucesso ? 'Google Search' : null,
          recomendacaoLlama.sucesso ? 'Llama AI' : null
        ].filter(Boolean),
        tempo_resposta: new Date().toISOString()
      }
    };

    res.json(resultado);

  } catch (error) {
    console.error('Erro na busca integrada:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Testa todas as novas APIs
 */
exports.testarTodasApis = async (req, res) => {
  try {
    console.log('🧪 Iniciando teste de todas as APIs...');

    const [
      testeLlama,
      testeGoogle,
      testeAliExpress
    ] = await Promise.all([
      llamaService.testarAPILlama(),
      googleSearchService.testarAPIsGoogle(),
      aliexpressService.testarAPIAliExpress()
    ]);

    const resultado = {
      sucesso: true,
      timestamp: new Date().toISOString(),
      testes: {
        llama_ai: {
          sucesso: testeLlama.sucesso,
          configuracao: testeLlama.configuracao,
          erro: testeLlama.erro
        },
        google_search: {
          sucesso: testeGoogle.sucesso,
          apis: testeGoogle.apis,
          configuracao: testeGoogle.configuracao
        },
        aliexpress: {
          sucesso: testeAliExpress.sucesso,
          configuracao: testeAliExpress.configuracao,
          erro: testeAliExpress.erro
        }
      },
      resumo: {
        total_apis: 4, // Llama + Google v1 + Google v2 + AliExpress
        apis_funcionando: [
          testeLlama.sucesso ? 'Llama AI' : null,
          testeGoogle.apis?.googleAPI1?.sucesso ? 'Google Search v1' : null,
          testeGoogle.apis?.googleAPI2?.sucesso ? 'Google Search v2' : null,
          testeAliExpress.sucesso ? 'AliExpress' : null
        ].filter(Boolean),
        status_geral: (testeLlama.sucesso || testeGoogle.sucesso || testeAliExpress.sucesso) ? 'OPERACIONAL' : 'FALHA'
      }
    };

    res.json(resultado);

  } catch (error) {
    console.error('Erro no teste geral:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

module.exports = exports;
