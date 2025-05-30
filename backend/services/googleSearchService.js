
const axios = require('axios');
const https = require('https');
require('dotenv').config();

// Configuração para ignorar problemas de certificado SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * Serviço para integração com Google Search APIs via RapidAPI
 * API 1: https://googlesearch-api.p.rapidapi.com/search
 * API 2: https://google-search72.p.rapidapi.com/search
 */

/**
 * Busca produtos usando Google Search API (versão 1)
 * @param {Object} params - Parâmetros da busca
 * @param {string} params.query - Termo de busca
 * @param {number} params.start - Resultado inicial (1-based)
 * @param {string} params.gl - Geolocalização (US, BR, etc.)
 * @param {string} params.hl - Idioma (en, pt, etc.)
 * @param {string} params.lr - Restrição de idioma
 * @returns {Promise<Object>} Resultados da busca
 */
async function buscarGoogleAPI1(params) {
  try {
    const { 
      query, 
      start = 1, 
      gl = 'BR', 
      hl = 'pt', 
      lr = 'lang_pt' 
    } = params;
    
    if (!process.env.RAPIDAPI_KEY_NEW) {
      throw new Error('RAPIDAPI_KEY_NEW não configurada');
    }

    const requestConfig = {
      method: 'GET',
      url: 'https://googlesearch-api.p.rapidapi.com/search',
      params: {
        q: query,
        start: start,
        gl: gl,
        hl: hl,
        lr: lr
      },
      headers: {
        'x-rapidapi-host': 'googlesearch-api.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY_NEW
      },
      timeout: 10000,
      httpsAgent
    };

    console.log(`🔍 Buscando no Google API 1: "${query}"`);
    const response = await axios(requestConfig);

    if (response.data) {
      console.log(`✅ Google API 1: ${response.data.items?.length || 0} resultados encontrados`);
      
      // Processar e normalizar resultados
      const resultados = response.data.items?.map(item => ({
        titulo: item.title,
        link: item.link,
        snippet: item.snippet,
        fonte: 'Google Search API v1'
      })) || [];

      return {
        sucesso: true,
        fonte: 'Google Search API v1',
        query: query,
        totalResultados: resultados.length,
        resultados: resultados,
        timestamp: new Date().toISOString()
      };
    } else {
      throw new Error('Resposta vazia da API');
    }

  } catch (error) {
    console.error('❌ Erro na Google Search API 1:', error.message);
    
    return {
      sucesso: false,
      fonte: 'Google Search API v1',
      erro: error.message,
      query: params.query,
      resultados: [],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Busca produtos usando Google Search API (versão 2)
 * @param {Object} params - Parâmetros da busca
 * @param {string} params.query - Termo de busca
 * @param {string} params.lr - Restrição de idioma (en-US, pt-BR)
 * @param {number} params.num - Número de resultados (máximo 10)
 * @returns {Promise<Object>} Resultados da busca
 */
async function buscarGoogleAPI2(params) {
  try {
    const { 
      query, 
      lr = 'pt-BR', 
      num = 10 
    } = params;
    
    if (!process.env.RAPIDAPI_KEY_NEW) {
      throw new Error('RAPIDAPI_KEY_NEW não configurada');
    }

    const requestConfig = {
      method: 'GET',
      url: 'https://google-search72.p.rapidapi.com/search',
      params: {
        q: query,
        lr: lr,
        num: Math.min(num, 10) // Máximo 10 resultados
      },
      headers: {
        'x-rapidapi-host': 'google-search72.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY_NEW
      },
      timeout: 10000,
      httpsAgent
    };

    console.log(`🔍 Buscando no Google API 2: "${query}"`);
    const response = await axios(requestConfig);

    if (response.data) {
      console.log(`✅ Google API 2: ${response.data.items?.length || 0} resultados encontrados`);
      
      // Processar e normalizar resultados
      const resultados = response.data.items?.map(item => ({
        titulo: item.title,
        link: item.link,
        snippet: item.snippet,
        fonte: 'Google Search API v2'
      })) || [];

      return {
        sucesso: true,
        fonte: 'Google Search API v2',
        query: query,
        totalResultados: resultados.length,
        resultados: resultados,
        timestamp: new Date().toISOString()
      };
    } else {
      throw new Error('Resposta vazia da API');
    }

  } catch (error) {
    console.error('❌ Erro na Google Search API 2:', error.message);
    
    return {
      sucesso: false,
      fonte: 'Google Search API v2',
      erro: error.message,
      query: params.query,
      resultados: [],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Busca produtos relacionados a presentes
 * @param {Object} filtros - Filtros da busca
 * @param {string} filtros.categoria - Categoria do presente
 * @param {number} filtros.precoMin - Preço mínimo
 * @param {number} filtros.precoMax - Preço máximo
 * @returns {Promise<Object>} Resultados combinados das duas APIs
 */
async function buscarPresentesGoogle(filtros) {
  const { categoria, precoMin, precoMax } = filtros;
  
  // Construir query otimizada para presentes
  let query = `presentes ${categoria}`;
  if (precoMin && precoMax) {
    query += ` preço R$ ${precoMin} até R$ ${precoMax}`;
  }
  query += ' comprar online';

  console.log(`🎁 Buscando presentes: "${query}"`);

  // Buscar em paralelo nas duas APIs
  const [resultados1, resultados2] = await Promise.all([
    buscarGoogleAPI1({ query, gl: 'BR', hl: 'pt' }),
    buscarGoogleAPI2({ query, lr: 'pt-BR', num: 10 })
  ]);

  // Combinar resultados
  const todoResultados = [
    ...(resultados1.resultados || []),
    ...(resultados2.resultados || [])
  ];

  // Remover duplicatas baseado no link
  const resultadosUnicos = todoResultados.filter((item, index, arr) => 
    arr.findIndex(other => other.link === item.link) === index
  );

  return {
    sucesso: resultados1.sucesso || resultados2.sucesso,
    query: query,
    totalResultados: resultadosUnicos.length,
    resultados: resultadosUnicos.slice(0, 20), // Limitar a 20 resultados
    apis: {
      googleAPI1: {
        sucesso: resultados1.sucesso,
        count: resultados1.resultados?.length || 0
      },
      googleAPI2: {
        sucesso: resultados2.sucesso,
        count: resultados2.resultados?.length || 0
      }
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Testa ambas as APIs do Google
 * @returns {Promise<Object>} Resultado dos testes
 */
async function testarAPIsGoogle() {
  console.log('🧪 Testando APIs Google...');
  
  const queryTeste = 'presentes eletrônicos';
  
  const [teste1, teste2] = await Promise.all([
    buscarGoogleAPI1({ query: queryTeste }),
    buscarGoogleAPI2({ query: queryTeste })
  ]);

  return {
    sucesso: teste1.sucesso || teste2.sucesso,
    query: queryTeste,
    apis: {
      googleAPI1: {
        sucesso: teste1.sucesso,
        resultados: teste1.totalResultados,
        erro: teste1.erro
      },
      googleAPI2: {
        sucesso: teste2.sucesso,
        resultados: teste2.totalResultados,
        erro: teste2.erro
      }
    },
    configuracao: {
      rapidapi_key_configurada: !!process.env.RAPIDAPI_KEY_NEW,
      use_google_search_api: process.env.USE_GOOGLE_SEARCH_API === 'true',
      use_google_search72_api: process.env.USE_GOOGLE_SEARCH72_API === 'true'
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  buscarGoogleAPI1,
  buscarGoogleAPI2,
  buscarPresentesGoogle,
  testarAPIsGoogle
};
