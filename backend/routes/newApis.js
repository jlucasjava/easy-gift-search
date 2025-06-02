const express = require('express');
const router = express.Router();
const newApisController = require('../controllers/newApisController');

/**
 * Rotas para as novas APIs integradas:
 * - Llama AI (Open AI 21)
 * - Google Search APIs (2 versões)
 * - AliExpress DataHub API
 * - Bing Web Search API
 * - Google Maps API
 */

// ===== ROTAS LLAMA AI =====

/**
 * POST /api/new-apis/llama/recomendacao
 * Gera recomendação usando Llama AI
 * Body: { message: string, webAccess?: boolean }
 */
router.post('/llama/recomendacao', newApisController.gerarRecomendacao);

/**
 * POST /api/new-apis/llama/sugestoes
 * Sugere presentes baseado em perfil
 * Body: { idade: string, genero: string, interesses: string, orcamento: number }
 */
router.post('/llama/sugestoes', newApisController.sugerirPresentes);

/**
 * POST /api/new-apis/llama2/conversar
 * Gera resposta usando Meta Llama-2 API
 * Body: { model?: string, messages: array }
 */
router.post('/llama2/conversar', newApisController.gerarRespostaLlama2);

// ===== ROTAS GOOGLE SEARCH =====

/**
 * GET /api/new-apis/google/buscar
 * Busca usando Google Search APIs
 * Query: ?query=termo&api=1|2|both
 */
router.get('/google/buscar', newApisController.buscarGoogle);

// ===== ROTAS BING WEB SEARCH =====

/**
 * GET /api/new-apis/bing/buscar
 * Busca na web usando Bing Web Search API
 * Query: ?query=termo&mkt=pt-br&safeSearch=Moderate&freshness=Week&count=10&offset=0
 */
router.get('/bing/buscar', newApisController.buscarWeb);

/**
 * GET /api/new-apis/bing/produtos
 * Busca produtos específicos usando Bing Web Search
 * Query: ?produto=nome&categoria=categoria&preco=faixa&marketplace=site
 */
router.get('/bing/produtos', newApisController.buscarProdutosWeb);

/**
 * GET /api/new-apis/bing/recomendacoes
 * Busca recomendações de presentes usando Bing Web Search
 * Query: ?idade=25&genero=masculino&interesses=esportes&orcamento=100-500
 */
router.get('/bing/recomendacoes', newApisController.buscarRecomendacoesWeb);

/**
 * GET /api/new-apis/bing/tendencias
 * Busca tendências atuais de presentes
 * Query: ?categoria=presentes
 */
router.get('/bing/tendencias', newApisController.buscarTendencias);

// ===== ROTAS GOOGLE MAPS =====

/**
 * GET /api/new-apis/maps/localizacao
 * Busca informações de localização usando Google Maps API
 * Query: ?text=local&place=referencia&city=cidade&country=pais&latitude=lat&longitude=lng
 */
router.get('/maps/localizacao', newApisController.buscarLocalizacao);

/**
 * GET /api/new-apis/maps/lojas
 * Busca lojas próximas usando Google Maps API
 * Query: ?categoria=tipo&latitude=lat&longitude=lng&radius=metros&cidade=cidade
 */
router.get('/maps/lojas', newApisController.buscarLojasProximas);

/**
 * GET /api/new-apis/maps/shoppings
 * Busca shopping centers usando Google Maps API
 * Query: ?cidade=cidade&estado=estado
 */
router.get('/maps/shoppings', newApisController.buscarShoppings);

/**
 * GET /api/new-apis/maps/entrega
 * Busca informações de entrega usando Google Maps API
 * Query: ?cep=cep&endereco=endereco&cidade=cidade
 */
router.get('/maps/entrega', newApisController.buscarInfoEntrega);

// ===== ROTAS ALIEXPRESS =====

/**
 * GET /api/new-apis/aliexpress/detalhes/:itemId
 * Busca detalhes de produto específico no AliExpress
 * Params: itemId (ID do produto)
 */
router.get('/aliexpress/detalhes/:itemId', newApisController.detalheAliExpress);

// ===== ROTAS INTEGRADAS =====

/**
 * GET /api/new-apis/busca-integrada
 * Busca combinando múltiplas APIs
 * Query: ?query=termo&categoria=categoria&idade=idade&genero=genero&cidade=cidade
 */
router.get('/busca-integrada', newApisController.buscaIntegrada);

// ===== ROTAS DE DEMONSTRAÇÃO =====

/**
 * GET /api/new-apis/demo/llama
 * Demonstração da API Llama
 */
router.get('/demo/llama', async (req, res) => {
  try {
    await newApisController.gerarRecomendacao({
      body: {
        message: "Preciso de sugestões de presentes para uma pessoa de 30 anos que gosta de tecnologia",
        webAccess: false
      }
    }, res);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

/**
 * GET /api/new-apis/demo/google
 * Demonstração das APIs Google Search
 */
router.get('/demo/google', async (req, res) => {
  try {
    await newApisController.buscarGoogle({
      query: { query: 'presentes eletrônicos', api: 'both' }
    }, res);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

/**
 * GET /api/new-apis/demo/aliexpress
 * Demonstração da API AliExpress
 */
router.get('/demo/aliexpress', async (req, res) => {
  try {
    await newApisController.detalheAliExpress({
      params: { itemId: '1005005244562338' }
    }, res);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

/**
 * GET /api/new-apis/demo/bing
 * Demonstração da API Bing Web Search
 */
router.get('/demo/bing', async (req, res) => {
  try {
    await newApisController.buscarWeb({
      query: { query: 'presentes tecnologia 2025', mkt: 'pt-br', count: '5' }
    }, res);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

/**
 * GET /api/new-apis/demo/maps
 * Demonstração da API Google Maps
 */
router.get('/demo/maps', async (req, res) => {
  try {
    await newApisController.buscarShoppings({
      query: { cidade: 'São Paulo', estado: 'SP' }
    }, res);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

/**
 * GET /api/new-apis/info
 * Informações sobre as APIs disponíveis
 */
router.get('/info', (req, res) => {
  res.json({
    titulo: "🚀 Easy Gift Search - APIs Integradas Expandidas",
    versao: "2.0.0",
    apis_disponiveis: {
      llama_ai: {
        nome: "Llama AI (Open AI 21)",
        endpoint: "https://open-ai21.p.rapidapi.com/conversationllama",
        funcionalidades: [
          "Geração de recomendações de presentes",
          "Sugestões baseadas em perfil",
          "Conversação natural"
        ],
        rotas: [
          "POST /api/new-apis/llama/recomendacao",
          "POST /api/new-apis/llama/sugestoes"
        ]
      },
      google_search: {
        nome: "Google Search APIs",
        endpoints: [
          "https://googlesearch-api.p.rapidapi.com/search",
          "https://google-search72.p.rapidapi.com/search"
        ],
        funcionalidades: [
          "Busca de produtos em sites",
          "Pesquisa de presentes online",
          "Resultados de múltiplas fontes"
        ],
        rotas: [
          "GET /api/new-apis/google/buscar"
        ]
      },
      aliexpress: {
        nome: "AliExpress DataHub",
        endpoint: "https://aliexpress-datahub.p.rapidapi.com/item_detail_2",
        funcionalidades: [
          "Detalhes de produtos específicos",
          "Informações de preços e avaliações",
          "Especificações técnicas"
        ],
        rotas: [
          "GET /api/new-apis/aliexpress/detalhes/:itemId"
        ]
      },
      bing_web_search: {
        nome: "Bing Web Search API",
        endpoint: "https://bing-web-search.p.rapidapi.com/search",
        funcionalidades: [
          "Busca na web",
          "Pesquisa de produtos",
          "Recomendações de presentes",
          "Tendências de presentes"
        ],
        rotas: [
          "GET /api/new-apis/bing/buscar",
          "GET /api/new-apis/bing/produtos",
          "GET /api/new-apis/bing/recomendacoes",
          "GET /api/new-apis/bing/tendencias"
        ]
      },
      google_maps: {
        nome: "Google Maps API",
        endpoint: "https://google-maps30.p.rapidapi.com/geocode",
        funcionalidades: [
          "Busca de localização",
          "Lojas e shoppings próximos",
          "Informações de entrega"
        ],
        rotas: [
          "GET /api/new-apis/maps/localizacao",
          "GET /api/new-apis/maps/lojas",
          "GET /api/new-apis/maps/shoppings",
          "GET /api/new-apis/maps/entrega"
        ]
      }
    },
    rotas_especiais: {
      busca_integrada: "GET /api/new-apis/busca-integrada",
      teste_todas: "GET /api/new-apis/teste-todas",
      demos: [
        "GET /api/new-apis/demo/llama",
        "GET /api/new-apis/demo/google",
        "GET /api/new-apis/demo/aliexpress",
        "GET /api/new-apis/demo/bing",
        "GET /api/new-apis/demo/maps"
      ]
    },
    configuracao: {
      chave_api: process.env.RAPIDAPI_KEY_NEW ? "✅ Configurada" : "❌ Não configurada",
      llama_ativo: process.env.USE_LLAMA_API === 'true' ? "✅ Ativo" : "❌ Inativo",
      google_ativo: process.env.USE_GOOGLE_SEARCH_API === 'true' ? "✅ Ativo" : "❌ Inativo",
      aliexpress_ativo: process.env.USE_ALIEXPRESS_DATAHUB_API === 'true' ? "✅ Ativo" : "❌ Inativo",
      bing_ativo: process.env.USE_BING_WEB_SEARCH_API === 'true' ? "✅ Ativo" : "❌ Inativo",
      maps_ativo: process.env.USE_GOOGLE_MAPS_API === 'true' ? "✅ Ativo" : "❌ Inativo"
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
