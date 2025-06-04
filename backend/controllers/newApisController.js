const llamaService = require('../services/llamaService');
const googleSearchService = require('../services/googleSearchService');
const aliexpressService = require('../services/aliexpressService');
const bingSearchService = require('../services/bingSearchService');
const googleMapsService = require('../services/googleMapsService');
const gpt35Service = require('../services/gpt35Service');
const llama2Service = require('../services/llama2Service');
const overpassService = require('../services/overpassService');

/**
 * Controller para gerenciar as novas APIs integradas:
 * - Llama AI (Open AI 21)
 * - Google Search APIs (2 versões)
 * - AliExpress DataHub API
 * - Bing Web Search API
 * - Google Maps API
 */

/**
 * Gera recomendações usando Llama AI
 */
exports.gerarRecomendacao = async (req, res) => {
  try {
    const { message, webAccess } = req.body;

    console.log('[Llama] Requisição recebida:', { message, webAccess });

    if (!message) {
      return res.status(400).json({
        erro: 'Parâmetro "message" é obrigatório'
      });
    }

    const resultado = await llamaService.gerarRecomendacaoLlama({
      message,
      webAccess: webAccess || false
    });

    console.log('[Llama] Resposta enviada:', resultado);

    res.json(resultado);

  } catch (error) {
    console.error('[Llama] Erro no controller de recomendação:', error);
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

    console.log('[Llama] Requisição recebida:', { idade, genero, interesses, orcamento });

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

    console.log('[Llama] Resposta enviada:', resultado);

    res.json(resultado);

  } catch (error) {
    console.error('[Llama] Erro no controller de sugestões:', error);
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

    console.log('[GoogleSearch] Requisição recebida:', { query, api });

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

    console.log('[GoogleSearch] Resposta enviada:', resultado);

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
 * Busca detalhes de produto no AliExpress
 */
exports.detalheAliExpress = async (req, res) => {
  try {
    const { itemId } = req.params;

    console.log('[AliExpress] Requisição recebida:', { itemId });

    if (!itemId) {
      return res.status(400).json({
        erro: 'Parâmetro "itemId" é obrigatório'
      });
    }

    const resultado = await aliexpressService.buscarDetalheProdutoAliExpress(itemId);

    console.log('[AliExpress] Resposta enviada:', resultado);

    res.json(resultado);

  } catch (error) {
    console.error('[AliExpress] Erro no controller AliExpress:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Busca na web usando Bing Web Search API
 */
exports.buscarWeb = async (req, res) => {
  try {
    const { query, mkt, safeSearch, freshness, count, offset } = req.query;

    console.log('[BingWeb] Requisição recebida:', { query, mkt, safeSearch, freshness, count, offset });

    if (!query) {
      return res.status(400).json({
        erro: 'Parâmetro "query" é obrigatório'
      });
    }

    const resultado = await bingSearchService.buscarWeb({
      query,
      mkt: mkt || 'pt-br',
      safeSearch: safeSearch || 'Moderate',
      freshness: freshness || 'Week',
      count: parseInt(count) || 10,
      offset: parseInt(offset) || 0
    });

    console.log('[BingWeb] Resposta enviada:', resultado);

    res.json(resultado);

  } catch (error) {
    console.error('[BingWeb] Erro na busca web:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Busca produtos específicos usando Bing Web Search
 */
exports.buscarProdutosWeb = async (req, res) => {
  try {
    const { produto, categoria, preco, marketplace } = req.query;

    if (!produto) {
      return res.status(400).json({
        erro: 'Parâmetro "produto" é obrigatório'
      });
    }

    const resultado = await bingSearchService.buscarProdutos({
      produto,
      categoria,
      preco,
      marketplace
    });

    res.json(resultado);

  } catch (error) {
    console.error('Erro na busca de produtos web:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Busca recomendações de presentes usando Bing Web Search
 */
exports.buscarRecomendacoesWeb = async (req, res) => {
  try {
    const { idade, genero, interesses, orcamento } = req.query;

    if (!idade || !genero) {
      return res.status(400).json({
        erro: 'Parâmetros "idade" e "genero" são obrigatórios'
      });
    }

    const resultado = await bingSearchService.buscarRecomendacoes({
      idade,
      genero,
      interesses: interesses || 'geral',
      orcamento: orcamento || '100-500'
    });

    res.json(resultado);

  } catch (error) {
    console.error('Erro na busca de recomendações web:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Busca tendências usando Bing Web Search
 */
exports.buscarTendencias = async (req, res) => {
  try {
    const { categoria } = req.query;

    const resultado = await bingSearchService.buscarTendencias(categoria);

    res.json(resultado);

  } catch (error) {
    console.error('Erro na busca de tendências:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Busca localização usando Google Maps API
 */
exports.buscarLocalizacao = async (req, res) => {
  try {
    const { text, place, city, country, latitude, longitude } = req.query;

    if (!text) {
      return res.status(400).json({
        erro: 'Parâmetro "text" é obrigatório'
      });
    }

    const resultado = await googleMapsService.buscarLocalizacao({
      text,
      place,
      city,
      country: country || 'Brasil',
      latitude,
      longitude
    });

    res.json(resultado);

  } catch (error) {
    console.error('Erro na busca de localização:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Busca lojas próximas usando Google Maps API
 */
exports.buscarLojasProximas = async (req, res) => {
  try {
    const { categoria, cidade } = req.query;

    if (!categoria) {
      return res.status(400).json({ erro: 'Parâmetro "categoria" é obrigatório' });
    }
    if (!cidade) {
      return res.status(400).json({ erro: 'Parâmetro "cidade" é obrigatório' });
    }

    const resultado = await overpassService.buscarLojasProximas({ categoria, cidade });

    res.json(resultado);

  } catch (error) {
    console.error('Erro na busca de lojas próximas (Overpass):', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Busca shopping centers usando Google Maps API
 */
exports.buscarShoppings = async (req, res) => {
  try {
    const { cidade } = req.query;

    if (!cidade) {
      return res.status(400).json({ erro: 'Parâmetro "cidade" é obrigatório' });
    }

    const resultado = await overpassService.buscarShoppings({ cidade });

    res.json(resultado);

  } catch (error) {
    console.error('Erro na busca de shoppings (Overpass):', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Busca informações de entrega usando Google Maps API
 */
exports.buscarInfoEntrega = async (req, res) => {
  try {
    const { cep, endereco, cidade } = req.query;

    if (!cep && !endereco) {
      return res.status(400).json({
        erro: 'Parâmetro "cep" ou "endereco" é obrigatório'
      });
    }

    const resultado = await googleMapsService.buscarInfoEntrega({
      cep,
      endereco,
      cidade
    });

    res.json(resultado);

  } catch (error) {
    console.error('Erro na busca de informações de entrega:', error);
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
    const { query, idade, genero, cidade, categoria } = req.query;

    if (!query) {
      return res.status(400).json({
        erro: 'Parâmetro "query" é obrigatório'
      });
    }

    // Executar buscas em paralelo
    const promises = [];

    // Busca web geral
    promises.push(
      bingSearchService.buscarWeb({
        query,
        mkt: 'pt-br',
        count: 5
      }).catch(error => ({ erro: error.message, fonte: 'Bing Web Search' }))
    );

    // Busca de produtos específicos se categoria fornecida
    if (categoria) {
      promises.push(
        bingSearchService.buscarProdutos({
          produto: query,
          categoria
        }).catch(error => ({ erro: error.message, fonte: 'Bing Produtos' }))
      );
    }

    // Busca de localização se cidade fornecida
    if (cidade) {
      promises.push(
        googleMapsService.buscarLojasProximas({
          categoria: query,
          cidade
        }).catch(error => ({ erro: error.message, fonte: 'Google Maps' }))
      );
    }

    // Recomendações personalizadas se perfil fornecido
    if (idade && genero) {
      promises.push(
        bingSearchService.buscarRecomendacoes({
          idade,
          genero,
          interesses: query,
          orcamento: '100-500'
        }).catch(error => ({ erro: error.message, fonte: 'Bing Recomendações' }))
      );
    }

    const resultados = await Promise.all(promises);

    const resposta = {
      sucesso: true,
      query,
      parametros: { idade, genero, cidade, categoria },
      resultados: {
        web: resultados[0] || null,
        produtos: categoria ? resultados[1] || null : null,
        localizacao: cidade ? (categoria ? resultados[2] : resultados[1]) || null : null,
        recomendacoes: (idade && genero) ? resultados[resultados.length - 1] || null : null
      },
      total_fontes: promises.length,
      tempo_resposta: new Date().toISOString()
    };

    res.json(resposta);

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

/**
 * Gera resposta usando GPT-3.5 (Open AI32)
 */
exports.gerarRespostaGPT35 = async (req, res) => {
  try {
    const { message, webAccess } = req.body;
    if (!message) {
      return res.status(400).json({ erro: 'Parâmetro "message" é obrigatório' });
    }
    const resultado = await gpt35Service.gerarRespostaGPT35({
      message,
      webAccess: webAccess || false
    });
    res.json(resultado);
  } catch (error) {
    console.error('Erro no controller GPT-3.5:', error);
    res.status(500).json({ erro: 'Erro interno do servidor', detalhes: error.message });
  }
};

/**
 * Gera resposta usando Meta Llama-2 API
 */
exports.gerarRespostaLlama2 = async (req, res) => {
  try {
    const { model, messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ erro: 'Parâmetro "messages" (array) é obrigatório' });
    }
    const resultado = await llama2Service.gerarRespostaLlama2({
      model: model || 'meta-llama/Llama-2-70b-chat-hf',
      messages
    });
    res.json(resultado);
  } catch (error) {
    console.error('Erro no controller Llama-2:', error);
    res.status(500).json({ erro: 'Erro interno do servidor', detalhes: error.message });
  }
};

/**
 * Busca produtos na Amazon (real-time-amazon-data)
 * Query: ?genero=string&precoMin=number&precoMax=number
 */
exports.buscarProdutosAmazon = async (req, res) => {
  try {
    const filtros = req.query;
    console.log('[Amazon] Requisição recebida:', filtros);
    const amazonService = require('../services/amazonService');
    const resultado = await amazonService.buscarProdutos(filtros);
    console.log('[Amazon] Resposta enviada:', resultado);
    res.json({ produtos: resultado, total: resultado.length });
  } catch (error) {
    console.error('[Amazon] Erro no controller:', error);
    res.status(500).json({ erro: 'Erro interno do servidor', detalhes: error.message });
  }
};

/**
 * Busca produtos best sellers na Amazon (real-time-amazon-data)
 * Query: ?categoria=string&country=string
 */
exports.buscarBestSellersAmazon = async (req, res) => {
  try {
    const { categoria = 'electronics', country = 'US' } = req.query;
    const axios = require('axios');
    const https = require('https');
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY_NEW || process.env.RAPIDAPI_KEY;
    if (!RAPIDAPI_KEY) throw new Error('RAPIDAPI_KEY_NEW não configurada');
    const options = {
      method: 'GET',
      url: 'https://real-time-amazon-data.p.rapidapi.com/best-sellers',
      params: { category: categoria, country },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
      },
      timeout: 10000,
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    };
    console.log('[Amazon] Buscando Best Sellers:', options.params);
    const response = await axios.request(options);
    res.json({ produtos: response.data.data?.products || [], total: response.data.data?.products?.length || 0 });
  } catch (error) {
    console.error('[Amazon] Erro Best Sellers:', error);
    res.status(500).json({ erro: 'Erro ao buscar best sellers', detalhes: error.message });
  }
};

/**
 * Busca perfil de influencer Amazon (real-time-amazon-data)
 * Query: ?profile_url=string
 */
exports.buscarInfluencerAmazon = async (req, res) => {
  try {
    const { profile_url } = req.query;
    if (!profile_url) return res.status(400).json({ erro: 'Parâmetro "profile_url" é obrigatório' });
    const axios = require('axios');
    const https = require('https');
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY_NEW || process.env.RAPIDAPI_KEY;
    if (!RAPIDAPI_KEY) throw new Error('RAPIDAPI_KEY_NEW não configurada');
    const options = {
      method: 'GET',
      url: 'https://real-time-amazon-data.p.rapidapi.com/influencer-profile',
      params: { profile_url },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
      },
      timeout: 10000,
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    };
    console.log('[Amazon] Buscando Influencer Profile:', profile_url);
    const response = await axios.request(options);
    res.json(response.data);
  } catch (error) {
    console.error('[Amazon] Erro Influencer Profile:', error);
    res.status(500).json({ erro: 'Erro ao buscar influencer', detalhes: error.message });
  }
};

/**
 * Busca hot products do AliExpress (free-aliexpress-api)
 * Query: ?category=string&page=number
 */
exports.buscarHotAliExpress = async (req, res) => {
  try {
    const { category = 'electronics', page = 1 } = req.query;
    const axios = require('axios');
    const https = require('https');
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY_NEW || process.env.RAPIDAPI_KEY;
    if (!RAPIDAPI_KEY) throw new Error('RAPIDAPI_KEY_NEW não configurada');
    const options = {
      method: 'GET',
      url: 'https://free-aliexpress-api.p.rapidapi.com/hot-products',
      params: { category, page },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'free-aliexpress-api.p.rapidapi.com'
      },
      timeout: 10000,
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    };
    console.log('[AliExpress] Buscando Hot Products:', options.params);
    const response = await axios.request(options);
    res.json({ produtos: response.data.products || [], total: response.data.products?.length || 0 });
  } catch (error) {
    console.error('[AliExpress] Erro Hot Products:', error);
    res.status(500).json({ erro: 'Erro ao buscar hot products', detalhes: error.message });
  }
};

/**
 * Busca produtos AliExpress DataHub (aliexpress-datahub)
 * Query: ?q=string&page=number&min_price=number
 */
exports.buscarAliExpressDataHub = async (req, res) => {
  try {
    const { q = 'gift', page = 1, min_price = 0 } = req.query;
    const axios = require('axios');
    const https = require('https');
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY_NEW || process.env.RAPIDAPI_KEY;
    if (!RAPIDAPI_KEY) throw new Error('RAPIDAPI_KEY_NEW não configurada');
    const options = {
      method: 'GET',
      url: 'https://aliexpress-datahub.p.rapidapi.com/item_search',
      params: { q, page, min_price },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'aliexpress-datahub.p.rapidapi.com'
      },
      timeout: 10000,
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    };
    console.log('[AliExpress] Buscando DataHub:', options.params);
    const response = await axios.request(options);
    res.json({ produtos: response.data.result?.resultList || [], total: response.data.result?.resultList?.length || 0 });
  } catch (error) {
    console.error('[AliExpress] Erro DataHub:', error);
    res.status(500).json({ erro: 'Erro ao buscar DataHub', detalhes: error.message });
  }
};

module.exports = exports;
