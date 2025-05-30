
const express = require('express');
const router = express.Router();
const newApisController = require('../controllers/newApisController');

/**
 * Rotas para as novas APIs integradas:
 * - Llama AI (Open AI 21)
 * - Google Search APIs (2 versões)
 * - AliExpress DataHub API
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

// ===== ROTAS GOOGLE SEARCH =====

/**
 * GET /api/new-apis/google/buscar
 * Busca usando Google Search APIs
 * Query: ?query=termo&api=1|2|both
 */
router.get('/google/buscar', newApisController.buscarGoogle);

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
 * Query: ?query=termo&categoria=cat&idade=25&genero=m&orcamento=100
 */
router.get('/busca-integrada', newApisController.buscaIntegrada);

/**
 * GET /api/new-apis/teste-todas
 * Testa todas as novas APIs
 */
router.get('/teste-todas', newApisController.testarTodasApis);

// ===== ROTAS DE DEMONSTRAÇÃO =====

/**
 * GET /api/new-apis/demo/llama
 * Demonstração da API Llama
 */
router.get('/demo/llama', async (req, res) => {
  const resultado = await newApisController.gerarRecomendacao({
    body: {
      message: "Preciso de sugestões de presentes para uma pessoa de 30 anos que gosta de tecnologia",
      webAccess: false
    }
  }, { json: (data) => res.json(data) });
});

/**
 * GET /api/new-apis/demo/google
 * Demonstração das APIs Google Search
 */
router.get('/demo/google', async (req, res) => {
  const resultado = await newApisController.buscarGoogle({
    query: { query: 'presentes eletrônicos', api: 'both' }
  }, { json: (data) => res.json(data) });
});

/**
 * GET /api/new-apis/demo/aliexpress
 * Demonstração da API AliExpress
 */
router.get('/demo/aliexpress', async (req, res) => {
  const resultado = await newApisController.detalheAliExpress({
    params: { itemId: '1005005244562338' }
  }, { json: (data) => res.json(data) });
});

/**
 * GET /api/new-apis/info
 * Informações sobre as APIs disponíveis
 */
router.get('/info', (req, res) => {
  res.json({
    titulo: "🚀 Easy Gift Search - Novas APIs Integradas",
    versao: "1.0.0",
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
      }
    },
    rotas_especiais: {
      busca_integrada: "GET /api/new-apis/busca-integrada",
      teste_todas: "GET /api/new-apis/teste-todas",
      demos: [
        "GET /api/new-apis/demo/llama",
        "GET /api/new-apis/demo/google",
        "GET /api/new-apis/demo/aliexpress"
      ]
    },
    configuracao: {
      chave_api: process.env.RAPIDAPI_KEY_NEW ? "✅ Configurada" : "❌ Não configurada",
      llama_ativo: process.env.USE_LLAMA_API === 'true' ? "✅ Ativo" : "❌ Inativo",
      google_ativo: process.env.USE_GOOGLE_SEARCH_API === 'true' ? "✅ Ativo" : "❌ Inativo",
      aliexpress_ativo: process.env.USE_ALIEXPRESS_DATAHUB_API === 'true' ? "✅ Ativo" : "❌ Inativo"
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
