const llamaService = require('../services/llamaService');
const googleSearchService = require('../services/googleSearchService');
const aliexpressService = require('../services/aliexpressService');
const bingSearchService = require('../services/bingSearchService');
const googleMapsService = require('../services/googleMapsService');

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
 * Busca na web usando Bing Web Search API
 */
exports.buscarWeb = async (req, res) => {
  try {
    const { query, mkt, safeSearch, freshness, count, offset } = req.query;

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

    res.json(resultado);

  } catch (error) {
    console.error('Erro na busca web:', error);
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
    const { categoria, latitude, longitude, radius, cidade } = req.query;

    if (!categoria) {
      return res.status(400).json({
        erro: 'Parâmetro "categoria" é obrigatório'
      });
    }

    const resultado = await googleMapsService.buscarLojasProximas({
      categoria,
      latitude,
      longitude,
      radius,
      cidade: cidade || 'São Paulo'
    });

    res.json(resultado);

  } catch (error) {
    console.error('Erro na busca de lojas próximas:', error);
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
    const { cidade, estado } = req.query;

    const resultado = await googleMapsService.buscarShoppings({
      cidade: cidade || 'São Paulo',
      estado: estado || 'SP'
    });

    res.json(resultado);

  } catch (error) {
    console.error('Erro na busca de shoppings:', error);
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

module.exports = exports;
