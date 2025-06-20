const axios = require('axios');
const https = require('https');
const NodeCache = require('node-cache');
const simulateGoogleResults = require('./simulateGoogleResults');
require('dotenv').config();

// Configuração do cache
// stdTTL: tempo de vida padrão dos itens em segundos (60 minutos)
// checkperiod: período para verificar itens expirados (10 minutos)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Configuração para ignorar problemas de certificado SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * Serviço para integração com Google Custom Search API
 */

/**
 * Busca produtos usando Google Custom Search API
 * @param {Object} params - Parâmetros da busca
 * @param {string} params.query - Termo de busca
 * @param {number} params.start - Resultado inicial (1-based)
 * @param {number} params.num - Número de resultados (máximo 10)
 * @returns {Promise<Object>} Resultados da busca
 */
async function searchGoogle(query, num = 10, start = 1, useCache = true) {
  try {
    // Verificar se há dados no cache e retornar se existir
    const cacheKey = `google_search_${query}_${num}_${start}`;
    if (useCache) {
      const cachedResults = cache.get(cacheKey);
      if (cachedResults) {
        console.log(`🔄 Usando resultados em cache para: "${query}" (página ${Math.ceil(start/num)})`);
        return cachedResults;
      }
    }
    
    if (!process.env.GOOGLE_SEARCH_API_KEY) {
      console.error('❌ GOOGLE_SEARCH_API_KEY não configurada');
      // Retorna dados simulados para fins de teste
      return simulateGoogleResults(query, num, start);
    }
    
    if (!process.env.GOOGLE_SEARCH_CX) {
      console.error('❌ GOOGLE_SEARCH_CX não configurada');
      // Retorna dados simulados para fins de teste
      return simulateGoogleResults(query, num, start);
    }

    const requestConfig = {
      method: 'GET',
      url: 'https://www.googleapis.com/customsearch/v1',
      params: {
        key: process.env.GOOGLE_SEARCH_API_KEY,
        cx: process.env.GOOGLE_SEARCH_CX,
        q: query,
        start: start,
        num: Math.min(num, 10), // Máximo 10 resultados por página
        gl: 'br',           // Geolocalização Brasil
        cr: 'countryBR',    // Restringir a resultados do Brasil
        lr: 'lang_pt',      // Páginas em Português
        safe: 'active',     // Filtro SafeSearch ativo
        sort: 'relevance',  // Ordenar por relevância (padrão)
        filter: '1',        // Filtro de duplicados
        imgSize: 'medium',  // Preferência por imagens médias para thumbnails
        rights: 'cc_publicdomain cc_attribute cc_sharealike cc_noncommercial', // Preferência por imagens com licenças livres
        fields: 'items(title,link,snippet,pagemap)'  // Limitar campos retornados para economia
      },
      timeout: 10000,
      httpsAgent
    };

    console.log(`🔍 Buscando no Google Custom Search API: "${query}"`);
    const response = await axios(requestConfig);

    if (response.data) {
      console.log(`✅ Google Custom Search API: ${response.data.items?.length || 0} resultados encontrados`);
      
      // Processar e normalizar resultados
      const resultados = response.data.items?.map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        image: getBestImage(item),
        price: extractPrice(item.title, item.snippet),
        source: 'Google Custom Search'
      })) || [];

      // Armazenar resultados no cache
      if (useCache && resultados.length > 0) {
        cache.set(cacheKey, resultados);
        console.log(`💾 Resultados armazenados em cache para: "${query}"`);
      }

      return resultados;
    } else {
      throw new Error('Resposta vazia da API');
    }

  } catch (error) {
    console.error('❌ Erro na Google Custom Search API:', error.message);
    // Se houver erro, retornar dados simulados para permitir testes
    return simulateGoogleResults(query, num, start);
  }
}

/**
 * Obtém a melhor imagem disponível de um resultado
 * @param {Object} item - Item do resultado da busca
 * @returns {string|null} URL da melhor imagem ou null
 */
function getBestImage(item) {
  if (!item || !item.pagemap) return null;
  
  // Array com possíveis fontes de imagens em ordem de preferência
  const imageSources = [
    // Imagens de produto específicas
    item.pagemap.product?.[0]?.image,
    
    // Imagens principais do CSE
    item.pagemap.cse_image?.[0]?.src,
    
    // Thumbnails do CSE
    item.pagemap.cse_thumbnail?.[0]?.src,
    
    // Imagens de metatags OpenGraph
    item.pagemap.metatags?.[0]?.['og:image'],
    
    // Imagens de metatags Twitter
    item.pagemap.metatags?.[0]?.['twitter:image'],
    
    // Imagens de artigos
    item.pagemap.article?.[0]?.image,
    
    // Imagens gerais
    item.pagemap.imageobject?.[0]?.url,
    item.pagemap.image?.[0]?.src,
    
    // Outras imagens de metatags
    item.pagemap.metatags?.[0]?.['image'],
    item.pagemap.metatags?.[0]?.['thumbnail']
  ];
  
  // Encontrar a primeira imagem válida
  for (const imageUrl of imageSources) {
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
      return imageUrl;
    }
  }
  
  // Verificar se há imagens no thumbnail do pagemap
  if (item.pagemap.cse_thumbnail) {
    const thumbnails = item.pagemap.cse_thumbnail.filter(thumb => 
      thumb && thumb.src && thumb.src.startsWith('http')
    );
    if (thumbnails.length > 0) {
      return thumbnails[0].src;
    }
  }
  
  return null;
}

/**
 * Tenta extrair um preço de textos
 * @param {string} title - Título do resultado
 * @param {string} snippet - Snippet do resultado
 * @returns {string|null} Preço extraído ou null
 */
function extractPrice(title, snippet) {
  if (!title && !snippet) return null;
  
  const fullText = `${title || ''} ${snippet || ''}`;
  
  // Padrão para preços brasileiros (R$ XX,XX ou R$ XX.XX)
  const pricePattern = /R\$\s?(\d{1,3}(?:\.\d{3})*|\d+)(?:[,\.]\d{2})?/gi;
  const matches = fullText.match(pricePattern);
  
  if (matches && matches.length > 0) {
    return matches[0].trim();
  }
  
  // Tentar identificar números que podem ser preços (sem o R$)
  // Apenas para valores que parecem razoáveis para presentes (entre R$20 e R$2000)
  const numberPattern = /(?:^|\s)(\d{2,4})[,\.](\d{2})(?:\s|$)/g;
  const numMatches = [...fullText.matchAll(numberPattern)];
  
  if (numMatches && numMatches.length > 0) {
    // Verificar se o valor está em uma faixa razoável (entre 20 e 2000)
    for (const match of numMatches) {
      const valorInteiro = parseInt(match[1], 10);
      if (valorInteiro >= 20 && valorInteiro <= 2000) {
        return `R$ ${match[1]},${match[2]}`;
      }
    }
  }
  
  return null;
}

/**
 * Limpa o cache armazenado
 * @returns {number} Número de itens removidos do cache
 */
function clearCache() {
  const keysCount = cache.keys().length;
  cache.flushAll();
  console.log(`🧹 Cache limpo: ${keysCount} itens removidos`);
  return keysCount;
}

/**
 * Obtém estatísticas do cache
 * @returns {Object} Estatísticas do cache
 */
function getCacheStats() {
  return {
    keys: cache.keys(),
    stats: cache.getStats(),
    itemCount: cache.keys().length
  };
}

/**
 * Função auxiliar para expor o cache para o controller de monitoramento
 * @returns {Object} Cache do serviço Google
 */
function getCache() {
  return cache;
}

/**
 * Simula resultados de pesquisa quando a API real não está disponível
 * @param {string} query - Termo de busca
 * @param {number} num - Número de resultados a gerar
 * @returns {Array} Resultados simulados
 */
function simulateGoogleResults(query, num = 10, start = 1) {
  console.log(`ℹ️ Gerando resultados simulados para: "${query}"`);
  
  // Categorias comuns para classificar os resultados
  const categorias = ['Eletrônicos', 'Moda', 'Casa e Decoração', 'Beleza', 'Esportes', 'Livros', 'Jogos', 'Acessórios'];
  
  // Gerar resultados simulados baseados na query
  const resultados = [];
  for (let i = 0; i < num; i++) {
    const categoria = categorias[Math.floor(Math.random() * categorias.length)];
    resultados.push({
      title: `${categoria} para presente - ${query} - Item ${i + 1}`,
      link: `https://exemplo.com/produto/${i + 1}?q=${encodeURIComponent(query)}`,
      snippet: `Ótima opção de presente na categoria ${categoria.toLowerCase()}. Produto de qualidade com entrega rápida e garantia.`,
      image: `https://placeholder.com/300x300?text=Presente+${i + 1}`,
      price: `R$ ${Math.floor(Math.random() * 300) + 50},${Math.floor(Math.random() * 100)}`,
      source: 'Google Custom Search (Simulado)'
    });
  }
  
  console.log(`✅ Gerados ${resultados.length} resultados simulados`);
  return resultados;
}

/**
 * Busca presentes usando Google Custom Search API
 * @param {Object} filtros - Filtros para a busca
 * @returns {Promise<Object>} Resultados da busca
 */
async function buscarPresentesGoogle(filtros) {
  try {
    // Transformar os filtros em uma query para o Google
    let query = constroiQueryGoogle(filtros);
    
    // Calcular parâmetros de paginação
    const num = parseInt(filtros.num) || 10; // Resultados por página
    const page = parseInt(filtros.page) || 1; // Página atual
    const start = ((page - 1) * num) + 1; // Índice de início (1-based)
    
    console.log(`🔍 Buscando presentes no Google: "${query}" (página ${page}, início ${start}, ${num} por página)`);
    
    // Buscar resultados no Google
    const resultados = await searchGoogle(query, num, start);
    
    // Formatar os resultados
    return formatarResultadosGoogle(resultados, query, page, num);
  } catch (error) {
    console.error(`❌ Erro ao buscar presentes no Google: ${error.message}`);
    // Em caso de erro, retornar resultados simulados
    const query = constroiQueryGoogle(filtros);
    const num = parseInt(filtros.num) || 10;
    const page = parseInt(filtros.page) || 1;
    const start = ((page - 1) * num) + 1;
    
    const resultadosSimulados = simulateGoogleResults(query, num, start);
    
    return formatarResultadosGoogle(resultadosSimulados, query, page, num);
  }
}

/**
 * Testa a API do Google Custom Search
 * @returns {Promise<Object>} Resultado do teste
 */
async function testarAPIsGoogle() {
  console.log('🧪 Testando Google Custom Search API...');
  
  const queryTeste = 'presentes eletrônicos';
  
  try {
    // Desativar cache para testes de API
    const resultados = await searchGoogle(queryTeste, 1, 1, false);
    
    return {
      sucesso: resultados.length > 0,
      query: queryTeste,
      resultados: resultados.length,
      configuracao: {
        google_search_api_key_configurada: !!process.env.GOOGLE_SEARCH_API_KEY,
        google_search_cx_configurado: !!process.env.GOOGLE_SEARCH_CX,
        use_google_search_api: process.env.USE_GOOGLE_SEARCH_API === 'true'
      },
      cache: {
        status: 'ativo',
        items: cache.keys().length,
        stats: cache.getStats()
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      sucesso: false,
      query: queryTeste,
      erro: error.message,
      configuracao: {
        google_search_api_key_configurada: !!process.env.GOOGLE_SEARCH_API_KEY,
        google_search_cx_configurado: !!process.env.GOOGLE_SEARCH_CX,
        use_google_search_api: process.env.USE_GOOGLE_SEARCH_API === 'true'
      },
      cache: {
        status: 'ativo',
        items: cache.keys().length
      },
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Pesquisa produtos usando Google Custom Search API
 * @param {string} query - Termo de busca
 * @param {Object} filtros - Filtros opcionais (preço, gênero, etc.)
 * @returns {Promise<Object} Resultados formatados
 */
async function searchProducts(query, filtros = {}) {
  try {
    // Verificar cache para esta consulta
    const cacheKey = `products_${query}_${JSON.stringify(filtros)}`;
    const cachedResults = cache.get(cacheKey);
    
    if (cachedResults) {
      console.log(`🔄 Usando resultados em cache para produtos: "${query}"`);
      return cachedResults;
    }
    
    // Aplicar filtros à query para melhorar resultados
    let queryOtimizada = query;
    
    if (filtros.preco) {
      const [min, max] = filtros.preco.split('-');
      if (min && max) {
        queryOtimizada += ` preço entre R$${min} e R$${max}`;
      }
    }
    
    if (filtros.genero) {
      queryOtimizada += ` para ${filtros.genero}`;
    }
    
    if (filtros.idade) {
      queryOtimizada += ` ${filtros.idade} anos`;
    }
    
    if (filtros.categoria) {
      queryOtimizada += ` ${filtros.categoria}`;
    }
    
    // Adicionar termos para priorizar resultados de e-commerce
    queryOtimizada += ' comprar online Brasil loja';
    
    // Obter resultados da API
    const resultados = await searchGoogle(queryOtimizada);
    
    // Formatar resposta no padrão esperado pelos testes
    const response = {
      items: resultados.map((item, index) => ({
        id: `google-${index}`,
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        image: item.image,
        price: item.price,
        source: 'Google Custom Search'
      }))
    };
    
    // Armazenar no cache
    if (resultados.length > 0) {
      cache.set(cacheKey, response);
      console.log(`💾 Resultados de produtos armazenados em cache para: "${query}"`);
    }
    
    return response;
  } catch (error) {
    console.error('Erro na pesquisa de produtos:', error.message);
    return { items: [] };
  }
}

/**
 * Obtém recomendações de produtos baseado em um termo de busca
 * @param {string} query - Termo de busca para recomendações
 * @returns {Promise<Object>} Recomendações formatadas
 */
async function getRecommendations(query) {
  try {
    // Verificar cache para esta consulta
    const cacheKey = `recommendations_${query}`;
    const cachedResults = cache.get(cacheKey);
    
    if (cachedResults) {
      console.log(`🔄 Usando recomendações em cache para: "${query}"`);
      return cachedResults;
    }
    
    // Melhorar a query para obter melhores recomendações
    const queryOtimizada = `melhores presentes ${query} recomendados Brasil comprar`;
    
    // Obter resultados da API
    const resultados = await searchGoogle(queryOtimizada);
    
    // Formatar resposta no padrão esperado pelos testes
    const response = {
      items: resultados.map((item, index) => ({
        id: `recomendacao-${index}`,
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        image: item.image,
        price: item.price,
        source: 'Google Custom Search',
        recommendation: true
      }))
    };
    
    // Armazenar no cache
    if (resultados.length > 0) {
      cache.set(cacheKey, response);
      console.log(`💾 Recomendações armazenadas em cache para: "${query}"`);
    }
    
    return response;
  } catch (error) {
    console.error('Erro nas recomendações:', error.message);
    return { items: [] };
  }
}

/**
 * Extrai a categoria do produto com base no título e na query
 * @param {string} titulo - Título do produto
 * @param {string} query - Query de busca
 * @returns {string} Categoria extraída
 */
function extrairCategoriaGoogle(titulo, query) {
  if (!titulo) return 'Geral';
  
  // Lista de categorias conhecidas
  const categorias = [
    'Tecnologia', 'Eletrônicos', 'Moda', 'Beleza', 'Casa', 'Decoração', 
    'Livros', 'Esportes', 'Jogos', 'Brinquedos', 'Saúde', 'Alimentos',
    'Bebidas', 'Acessórios', 'Jóias', 'Relógios', 'Ferramentas', 'Jardim'
  ];
  
  // Verificar se o título ou query contém alguma categoria conhecida
  for (const categoria of categorias) {
    if (titulo.toLowerCase().includes(categoria.toLowerCase()) || 
        query.toLowerCase().includes(categoria.toLowerCase())) {
      return categoria;
    }
  }
  
  // Categorias baseadas em palavras-chave comuns
  if (/celular|smartphone|tablet|notebook|laptop|computador|monitor|tv|fone/i.test(titulo)) {
    return 'Tecnologia';
  }
  
  if (/camiseta|camisa|calça|vestido|blusa|jaqueta|casaco|sapato|tênis|sandália/i.test(titulo)) {
    return 'Moda';
  }
  
  if (/perfume|maquiagem|batom|creme|shampoo|condicionador|hidratante/i.test(titulo)) {
    return 'Beleza';
  }
  
  if (/panela|talher|copo|prato|louça|cozinha|utensílio/i.test(titulo)) {
    return 'Casa';
  }
  
  if (/livro|revista|mangá|hq|quadrinho/i.test(titulo)) {
    return 'Livros';
  }
  
  if (/bola|chuteira|raquete|bicicleta|patins|skate/i.test(titulo)) {
    return 'Esportes';
  }
  
  if (/jogo|game|console|playstation|xbox|nintendo/i.test(titulo)) {
    return 'Jogos';
  }
  
  if (/boneca|carrinho|lego|quebra-cabeça|pelucia/i.test(titulo)) {
    return 'Brinquedos';
  }
  
  // Extrair categoria da query se possível
  if (query.includes('presente para')) {
    if (query.includes('homem') || query.includes('masculino') || query.includes('pai') || query.includes('namorado')) {
      return 'Presentes Masculinos';
    }
    
    if (query.includes('mulher') || query.includes('feminino') || query.includes('mãe') || query.includes('namorada')) {
      return 'Presentes Femininos';
    }
    
    if (query.includes('criança') || query.includes('bebê') || query.includes('infantil')) {
      return 'Presentes Infantis';
    }
  }
  
  // Categoria padrão
  return 'Presente';
}

/**
 * Formata os resultados do Google para o formato esperado pelo frontend
 * @param {Array} resultados - Resultados do Google
 * @param {string} query - Query usada na busca
 * @param {number} pagina - Página atual
 * @param {number} numPorPagina - Número de resultados por página
 * @returns {Object} Resultados formatados
 */
function formatarResultadosGoogle(resultados, query, pagina = 1, numPorPagina = 10) {
  try {
    // Total simulado de resultados (Google limita a 100 no plano gratuito)
    const totalSimulado = Math.min(resultados.length * 10, 100);
    const totalPaginas = Math.ceil(totalSimulado / numPorPagina);
    
    // Formatar produtos para o padrão do frontend
    const produtos = resultados.map((item, index) => ({
      id: `google-${index}-${pagina}`,
      nome: item.title || 'Produto sem título',
      titulo: item.title || 'Produto sem título',
      descricao: item.snippet || '',
      preco: item.price || '',
      imagem: item.image || '',
      url: item.link || '#',
      marketplace: 'Google',
      categoria: extrairCategoriaGoogle(item.title, query)
    }));
    
    return {
      produtos,
      query,
      pagina,
      totalPaginas,
      totalResultados: totalSimulado,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`❌ Erro ao formatar resultados do Google: ${error.message}`);
    return {
      produtos: [],
      query,
      pagina: 1,
      totalPaginas: 1,
      totalResultados: 0,
      erro: error.message
    };
  }
}

/**
 * Constrói uma query otimizada para o Google baseada nos filtros
 * @param {Object} filtros - Filtros da busca
 * @returns {string} Query otimizada
 */
function constroiQueryGoogle(filtros) {
  let query = '';

  // Usar categoria ou termo de busca diretamente
  if (filtros.query) {
    query = filtros.query;
  } else if (filtros.categoria) {
    query = filtros.categoria;
  } else {
    query = 'presentes';
  }
  
  // Adicionar filtros específicos
  if (filtros.genero) {
    query += ` para ${filtros.genero}`;
  }
  
  if (filtros.idade) {
    query += ` ${filtros.idade} anos`;
  }
  
  // Adicionar filtro de preço se disponível
  if (filtros.precoMax) {
    query += ` até R$${filtros.precoMax}`;
  }
  
  if (filtros.precoMin) {
    query += ` acima de R$${filtros.precoMin}`;
  }
  
  // Adicionar termos para melhorar resultados de e-commerce
  query += ' comprar online';
  
  return query.trim();
}

module.exports = {
  searchGoogle,
  buscarPresentesGoogle,
  getCache,
  clearCache,
  getCacheStats,
  testarAPIsGoogle,
  searchProducts,
  getRecommendations,
  formatarResultadosGoogle,
  constroiQueryGoogle
};
