// Controller para gerenciar apenas as APIs do Google Search
const googleSearchService = require('../services/googleSearchService');

/**
 * Busca produtos usando Google Search API
 */
exports.buscarGoogle = async (req, res) => {
  try {
    const { query } = req.query;

    console.log('[GoogleSearch] Requisição recebida:', { query });

    if (!query) {
      return res.status(400).json({
        erro: 'Parâmetro "query" é obrigatório'
      });
    }

    const resultado = await googleSearchService.buscarPresentesGoogle({ categoria: query });

    console.log('[GoogleSearch] Resposta enviada:', {
      sucesso: resultado.sucesso,
      query: resultado.query,
      totalResultados: resultado.totalResultados
    });

    res.json(resultado);

  } catch (error) {
    console.error('[GoogleSearch] Erro no controller Google Search:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Testa a API do Google
 */
exports.testeAPIs = async (req, res) => {
  try {
    console.log('[Teste] Testando Google Custom Search API...');
    
    const testeGoogle = await googleSearchService.testarAPIsGoogle();
    
    const resultado = {
      timestamp: new Date().toISOString(),
      ambiente: process.env.NODE_ENV || 'development',
      google: {
        sucesso: testeGoogle.sucesso,
        resultados: testeGoogle.resultados,
        configuracao: testeGoogle.configuracao
      },
      resumo: {
        status_geral: testeGoogle.sucesso ? 'OPERACIONAL' : 'FALHA'
      }
    };
    
    console.log('[Teste] Resultado:', resultado);
    
    res.json(resultado);
    
  } catch (error) {
    console.error('[Teste] Erro no teste de API:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Busca integrada com Google Search
 */
exports.buscaIntegrada = async (req, res) => {
  try {
    const { query, categoria, idade, genero } = req.query;
    
    console.log('[BuscaIntegrada] Requisição recebida:', req.query);
    
    if (!query && !categoria && !idade && !genero) {
      return res.status(400).json({
        erro: 'É necessário fornecer pelo menos um parâmetro de busca (query, categoria, idade ou genero)'
      });
    }
    
    // Construir filtros para a busca
    const filtros = {
      categoria: categoria || query || '',
      idade,
      genero
    };
    
    // Buscar resultados usando o Google Search
    const resultado = await googleSearchService.buscarPresentesGoogle(filtros);
    
    // Formatar resposta
    const resposta = {
      sucesso: resultado.sucesso,
      termo_busca: resultado.query,
      total_resultados: resultado.produtos?.length || 0,
      produtos: resultado.produtos || [],
      fonte: 'Google Custom Search API',
      timestamp: new Date().toISOString()
    };
    
    console.log('[BuscaIntegrada] Resposta enviada:', {
      sucesso: resposta.sucesso,
      total: resposta.total_resultados
    });
    
    res.json(resposta);
    
  } catch (error) {
    console.error('[BuscaIntegrada] Erro na busca integrada:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Informações sobre as APIs disponíveis
 */
exports.apiInfo = async (req, res) => {
  try {
    res.json({
      titulo: "🚀 Easy Gift Search - API Google Custom Search",
      versao: "4.0.0",
      apis_disponiveis: {
        google_search: {
          nome: "Google Custom Search API",
          endpoint: "https://www.googleapis.com/customsearch/v1",
          funcionalidades: [
            "Busca de produtos em sites",
            "Pesquisa de presentes online",
            "Resultados de múltiplas fontes"
          ],
          rotas: [
            "GET /api/new-apis/google/buscar"
          ]
        }
      },
      rotas_especiais: {
        busca_integrada: "GET /api/new-apis/busca-integrada",
        teste_todas: "GET /api/new-apis/teste-todas"
      },
      configuracao: {
        google_api_key: process.env.GOOGLE_SEARCH_API_KEY ? "✅ Configurada" : "❌ Não configurada",
        google_cx: process.env.GOOGLE_SEARCH_CX ? "✅ Configurado" : "❌ Não configurado",
        google_ativo: process.env.USE_GOOGLE_SEARCH_API === 'true' ? "✅ Ativo" : "❌ Inativo"
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Info] Erro ao obter informações das APIs:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

module.exports = exports;
