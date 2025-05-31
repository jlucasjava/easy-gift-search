const axios = require('axios');
const https = require('https');
require('dotenv').config();

// Configuração para ignorar problemas de certificado SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * Serviço para integração com Bing Web Search API via RapidAPI
 * Permite busca avançada na web com filtros específicos para e-commerce
 */

/**
 * Realiza busca na web usando Bing Web Search API
 * @param {Object} params - Parâmetros da busca
 * @param {string} params.query - Termo de busca
 * @param {string} params.mkt - Mercado/região (ex: 'pt-br', 'en-us')
 * @param {string} params.safeSearch - Filtro seguro ('Off', 'Moderate', 'Strict')
 * @param {string} params.textFormat - Formato do texto ('Raw', 'HTML')
 * @param {string} params.freshness - Filtro de tempo ('Day', 'Week', 'Month')
 * @param {number} params.count - Número de resultados (max 50)
 * @param {number} params.offset - Deslocamento para paginação
 * @returns {Promise<Object>} Resultados da busca
 */
async function buscarWeb(params) {
  try {
    const {
      query,
      mkt = 'pt-br',
      safeSearch = 'Moderate',
      textFormat = 'Raw',
      freshness = 'Day',
      count = 10,
      offset = 0
    } = params;

    if (!query) {
      throw new Error('Query é obrigatória para busca web');
    }

    const config = {
      method: 'GET',
      url: 'https://bing-web-search1.p.rapidapi.com/search',
      params: {
        q: query,
        mkt,
        safeSearch,
        textFormat,
        freshness,
        count,
        offset
      },
      headers: {
        'x-rapidapi-host': 'bing-web-search1.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY_NEW || process.env.RAPIDAPI_KEY
      },
      httpsAgent,
      timeout: 10000
    };

    console.log('🔍 Bing Web Search - Buscando:', query);
    const response = await axios(config);

    if (response.data && response.data.webPages) {
      const resultados = response.data.webPages.value.map(page => ({
        titulo: page.name,
        url: page.url,
        descricao: page.snippet,
        dataPublicacao: page.dateLastCrawled,
        relevancia: page.displayUrl
      }));

      return {
        sucesso: true,
        total: response.data.webPages.totalEstimatedMatches || 0,
        resultados,
        fonte: 'Bing Web Search',
        parametros: params
      };
    }

    throw new Error('Resposta inválida da API Bing');

  } catch (error) {
    console.error('❌ Erro Bing Web Search:', error.message);
    
    // Fallback com resultados mock para demonstração
    return {
      sucesso: false,
      erro: error.message,
      resultados: [
        {
          titulo: `Resultado para "${params.query}" - Amazon`,
          url: 'https://www.amazon.com.br',
          descricao: 'Encontre os melhores presentes na Amazon com entrega rápida',
          dataPublicacao: new Date().toISOString(),
          relevancia: 'amazon.com.br'
        },
        {
          titulo: `${params.query} - Mercado Livre`,
          url: 'https://www.mercadolivre.com.br',
          descricao: 'Compre e venda com segurança no Mercado Livre',
          dataPublicacao: new Date().toISOString(),
          relevancia: 'mercadolivre.com.br'
        }
      ],
      fonte: 'Bing Web Search (Fallback)',
      parametros: params
    };
  }
}

/**
 * Busca específica para produtos de e-commerce
 * @param {Object} params - Parâmetros da busca
 * @param {string} params.produto - Nome do produto
 * @param {string} params.categoria - Categoria do produto
 * @param {string} params.preco - Faixa de preço
 * @param {string} params.marketplace - Marketplace específico
 * @returns {Promise<Object>} Resultados de produtos
 */
async function buscarProdutos(params) {
  try {
    const { produto, categoria, preco, marketplace } = params;
    
    // Construir query específica para e-commerce
    let query = produto;
    
    if (categoria) {
      query += ` ${categoria}`;
    }
    
    if (preco) {
      query += ` preço ${preco}`;
    }
    
    if (marketplace) {
      query += ` site:${marketplace}`;
    } else {
      // Buscar em principais marketplaces brasileiros
      query += ' (site:amazon.com.br OR site:mercadolivre.com.br OR site:magazineluiza.com.br OR site:americanas.com.br)';
    }

    return await buscarWeb({
      query,
      mkt: 'pt-br',
      safeSearch: 'Moderate',
      count: 15,
      freshness: 'Week'
    });

  } catch (error) {
    console.error('❌ Erro busca produtos:', error.message);
    throw error;
  }
}

/**
 * Busca recomendações de presentes baseadas em perfil
 * @param {Object} params - Parâmetros do perfil
 * @param {string} params.idade - Faixa etária
 * @param {string} params.genero - Gênero
 * @param {string} params.interesses - Interesses/hobbies
 * @param {string} params.orcamento - Faixa de orçamento
 * @returns {Promise<Object>} Recomendações de presentes
 */
async function buscarRecomendacoes(params) {
  try {
    const { idade, genero, interesses, orcamento } = params;
    
    // Construir query inteligente para recomendações
    const query = `presentes para ${genero} ${idade} anos ${interesses} até ${orcamento} reais`;
    
    const resultados = await buscarWeb({
      query,
      mkt: 'pt-br',
      safeSearch: 'Strict',
      count: 20,
      freshness: 'Month'
    });

    // Filtrar e processar resultados para melhor relevância
    if (resultados.sucesso && resultados.resultados) {
      resultados.resultados = resultados.resultados
        .filter(item => {
          const texto = (item.titulo + ' ' + item.descricao).toLowerCase();
          return texto.includes('presente') || 
                 texto.includes('gift') || 
                 texto.includes('comprar') ||
                 texto.includes('oferta');
        })
        .slice(0, 10); // Limitar a 10 melhores resultados
    }

    return resultados;

  } catch (error) {
    console.error('❌ Erro busca recomendações:', error.message);
    throw error;
  }
}

/**
 * Busca tendências de presentes
 * @param {string} categoria - Categoria de interesse
 * @returns {Promise<Object>} Tendências atuais
 */
async function buscarTendencias(categoria = 'presentes') {
  try {
    const query = `tendências ${categoria} 2025 mais vendidos populares`;
    
    return await buscarWeb({
      query,
      mkt: 'pt-br',
      safeSearch: 'Moderate',
      count: 10,
      freshness: 'Day'
    });

  } catch (error) {
    console.error('❌ Erro busca tendências:', error.message);
    throw error;
  }
}

module.exports = {
  buscarWeb,
  buscarProdutos,
  buscarRecomendacoes,
  buscarTendencias
};
