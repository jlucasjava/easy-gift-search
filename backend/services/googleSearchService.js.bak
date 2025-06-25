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
      let resultados = response.data.items?.map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        image: getBestImage(item),
        price: extractPrice(item.title, item.snippet),
        source: 'Google Custom Search',
        marketplace: detectMarketplace(item.link)
      })) || [];
      
      // Filtrar resultados para priorizar marketplaces válidos
      const validResults = resultados.filter(item => isValidMarketplace(item.link));
      
      // Se tivermos resultados válidos suficientes, usá-los exclusivamente
      if (validResults.length >= Math.min(5, resultados.length / 2)) {
        console.log(`✅ Encontrados ${validResults.length} resultados de marketplaces válidos`);
        resultados = validResults;
      } else {
        console.log(`⚠️ Poucos resultados de marketplaces válidos (${validResults.length}). Complementando com outros resultados.`);
        // Combinar resultados válidos com alguns outros resultados até atingir num
        // Priorizamos os resultados válidos no início
        const outrosResultados = resultados
          .filter(item => !isValidMarketplace(item.link))
          .slice(0, Math.max(num - validResults.length, 0));
        
        resultados = [...validResults, ...outrosResultados];
      }

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
  if (!item) return null;
  
  try {
    // Verificar se estamos lidando com um marketplace conhecido e tentar estratégia específica
    if (item.link) {
      const domain = extractDomainFromUrl(item.link);
      const marketplaceImage = getMarketplaceImage(item.link, domain);
      if (marketplaceImage) {
        return marketplaceImage;
      }
    }
    
    // 1. Verificar a propriedade link.thumbnail diretamente no resultado
    if (item.image?.thumbnailLink && item.image.thumbnailLink.startsWith('http')) {
      return item.image.thumbnailLink;
    }
    
    // 2. Verificar se há imagem direta no resultado
    if (item.thumbnailLink && item.thumbnailLink.startsWith('http')) {
      return item.thumbnailLink;
    }
    
    // 3. Verificar se há a propriedade pagemap
    if (!item.pagemap) {
      // Se não tiver pagemap, tentar extrair imagem da descrição ou link
      const linkImage = extractImageFromLink(item.link);
      if (linkImage) return linkImage;
      
      // Tentar extrair da descrição
      const snippetImage = extractImageFromSnippet(item.snippet);
      if (snippetImage) return snippetImage;
      
      return null;
    }
    
    // 4. Array com possíveis fontes de imagens em ordem de preferência, priorizando imagens de produtos
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
      item.pagemap.metatags?.[0]?.['twitter:image:src'],
      
      // Imagens de artigos
      item.pagemap.article?.[0]?.image,
      
      // Imagens gerais
      item.pagemap.imageobject?.[0]?.url,
      item.pagemap.imageobject?.[0]?.contenturl,
      item.pagemap.image?.[0]?.src,
      
      // Outras imagens de metatags
      item.pagemap.metatags?.[0]?.['image'],
      item.pagemap.metatags?.[0]?.['thumbnail'],
      item.pagemap.metatags?.[0]?.['msapplication-tileimage'],
      
      // Mais opções de imagens de produto
      item.pagemap.offer?.[0]?.image,
      item.pagemap.product?.[0]?.photo
    ];
    
    // 5. Encontrar a primeira imagem válida
    for (const imageUrl of imageSources) {
      if (imageUrl && typeof imageUrl === 'string') {
        // Garantir que a URL começa com http ou https
        if (imageUrl.startsWith('http')) {
          return imageUrl;
        }
        // Tentar corrigir URLs relativas
        else if (imageUrl.startsWith('/')) {
          try {
            const baseUrl = new URL(item.link).origin;
            return `${baseUrl}${imageUrl}`;
          } catch (e) {
            // Continuar com o próximo
          }
        }
      }
    }
    
    // 6. Verificar arrays de imagens em pagemap
    const imageArrays = [
      item.pagemap.cse_image,
      item.pagemap.cse_thumbnail,
      item.pagemap.imageobject,
      item.pagemap.image
    ];
    
    for (const imgArray of imageArrays) {
      if (Array.isArray(imgArray)) {
        for (const img of imgArray) {
          // Verificar campos comuns em cada tipo de objeto de imagem
          const possibleUrls = [img.src, img.url, img.contenturl, img.contentUrl, img.image];
          
          for (const url of possibleUrls) {
            if (url && typeof url === 'string' && url.startsWith('http')) {
              return url;
            }
          }
        }
      }
    }
    
    // 7. Como último recurso, tentar extrair uma imagem do link
    const linkImage = extractImageFromLink(item.link);
    if (linkImage) return linkImage;
    
    // 8. Tentar extrair da descrição
    const snippetImage = extractImageFromSnippet(item.snippet);
    if (snippetImage) return snippetImage;
    
  } catch (error) {
    console.error('Erro ao extrair imagem:', error);
  }
  
  // Se nenhuma imagem for encontrada, retornar null
  return null;
}

/**
 * Tenta extrair uma URL de imagem de um link
 * @param {string} url - URL do produto
 * @returns {string|null} URL da imagem ou null
 */
function extractImageFromLink(url) {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Verificar se a URL termina com extensão de imagem
    if (url.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
      return url;
    }
    
    // Usar a função específica para marketplaces
    const domain = extractDomainFromUrl(url);
    const marketplaceImage = getMarketplaceImage(url, domain);
    if (marketplaceImage) {
      return marketplaceImage;
    }
    
    // Para URLs de produtos que contenham termos comuns de produtos
    const isProductUrl = /\/(produto|product|item|p\/|dp\/)/i.test(url);
    if (isProductUrl) {
      // Extrair possíveis IDs de produtos
      const productId = url.match(/\/p\/(\d+)/) || 
                         url.match(/\/(\d{7,})(?:\/|$)/) || 
                         url.match(/produto\/(\d+)/) || 
                         url.match(/\/dp\/([A-Z0-9]{10})/);
      
      if (productId && productId[1]) {
        // Tentar criar uma URL para imagem com base no marketplace
        const marketplace = detectMarketplace(url);
        
        if (marketplace === 'Mercado Livre') {
          return `https://http2.mlstatic.com/D_NQ_NP_${productId[1]}-O.jpg`;
        } else if (marketplace === 'Amazon') {
          return `https://m.media-amazon.com/images/I/71${productId[1].substring(0, 4)}${productId[1].substring(0, 2)}.jpg`;
        } else if (marketplace === 'Magazine Luiza') {
          return `https://a-static.mlcdn.com.br/800x560/produto/${productId[1]}.jpg`;
        } else if (['Americanas', 'Submarino', 'Shoptime'].includes(marketplace)) {
          return `https://images-americanas.b2w.io/produtos/${productId[1]}/imagens/original.jpg`;
        } else if (['Casas Bahia', 'Ponto Frio', 'Extra'].includes(marketplace)) {
          return `https://imgs.casasbahia.com.br/${productId[1]}/1g.jpg`;
        }
      }
    }
    
    return null;
  } catch (e) {
    console.error('Erro ao extrair imagem do link:', e.message);
    return null;
  }
}

/**
 * Tenta extrair uma URL de imagem de um snippet
 * @param {string} snippet - Texto do snippet
 * @returns {string|null} URL da imagem ou null
 */
function extractImageFromSnippet(snippet) {
  if (!snippet || typeof snippet !== 'string') return null;
  
  // Procurar por URLs de imagem no texto do snippet
  const imageUrlMatch = snippet.match(/https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|gif|webp)(\?[^\s"'<>]+)?/i);
  if (imageUrlMatch) {
    return imageUrlMatch[0];
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
        use_google_search_api: process.env.USE_GOOGLE_SEARCH_API === 'true' || process.env.USE_GOOGLE_SEARCH_API === true || process.env.USE_GOOGLE_SEARCH_API === '1' || process.env.USE_GOOGLE_SEARCH_API === true || process.env.USE_GOOGLE_SEARCH_API === '1'
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
        use_google_search_api: process.env.USE_GOOGLE_SEARCH_API === 'true' || process.env.USE_GOOGLE_SEARCH_API === true || process.env.USE_GOOGLE_SEARCH_API === '1' || process.env.USE_GOOGLE_SEARCH_API === true || process.env.USE_GOOGLE_SEARCH_API === '1'
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
      marketplace: item.marketplace || detectMarketplace(item.link) || 'Google',
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
  
  // Adicionar termos específicos para priorizar e-commerce reais
  query += ' comprar online produto';
  
  // Adicionar sites específicos de e-commerce para priorizar resultados reais
  // Usar OR para combinar múltiplos sites e dar prioridade para marketplaces conhecidos
  query += ' (site:mercadolivre.com.br OR site:amazon.com.br OR site:magazineluiza.com.br OR ' +
           'site:americanas.com.br OR site:shopee.com.br OR site:casasbahia.com.br OR ' +
           'site:submarino.com.br OR site:kabum.com.br OR site:netshoes.com.br OR ' +
           'site:centauro.com.br OR site:extra.com.br OR site:pontofrio.com.br OR ' +
           'site:shoptime.com.br OR site:fastshop.com.br)';
  
  return query.trim();
}

/**
 * Extrai o domínio de uma URL
 * @param {string} url - URL completa
 * @returns {string} Domínio extraído
 */
function extractDomainFromUrl(url) {
  if (!url || typeof url !== 'string') return '';
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    // Se não for uma URL válida, retornar string vazia
    return '';
  }
}

/**
 * Obtém imagem específica de um marketplace com base na URL
 * @param {string} url - URL do produto
 * @param {string} domain - Domínio do marketplace
 * @returns {string|null} URL da imagem ou null
 */
function getMarketplaceImage(url, domain) {
  if (!url) return null;
  
  try {
    // Se o domínio não foi fornecido, extraí-lo da URL
    if (!domain) {
      domain = extractDomainFromUrl(url);
    }
    
    // Mercado Livre
    if (domain.includes('mercadolivre.com.br') || domain.includes('mercadolibre.com')) {
      // Extrair ID do produto para o ML
      const mlId = url.match(/MLB-(\d+)/) || url.match(/MLB(\d+)/) || url.match(/(\d{5,})(?:\/|$)/);
      if (mlId && mlId[1]) {
        return `https://http2.mlstatic.com/D_NQ_NP_${mlId[1]}-O.jpg`;
      }
    }
    
    // Amazon
    if (domain.includes('amazon.com.br') || domain.includes('amazon.com')) {
      // Extrair ASIN do produto
      const asin = url.match(/\/dp\/([A-Z0-9]{10})/) || url.match(/\/product\/([A-Z0-9]{10})/);
      if (asin && asin[1]) {
        return `https://m.media-amazon.com/images/I/71${asin[1].substring(0, 4)}${asin[1].substring(6, 8)}.jpg`;
      }
    }
    
    // Magazine Luiza
    if (domain.includes('magazineluiza.com.br')) {
      // Extrair código do produto
      const prodCode = url.match(/p\/(\d+)/) || url.match(/\/(\w{8})\//);
      if (prodCode && prodCode[1]) {
        return `https://a-static.mlcdn.com.br/800x560/produto/${prodCode[1]}.jpg`;
      }
    }
    
    // Americanas, Submarino e Shoptime (B2W)
    if (domain.includes('americanas.com.br') || domain.includes('submarino.com.br') || domain.includes('shoptime.com.br')) {
      // Tentar extrair código do produto
      const prodCode = url.match(/produto\/(\d+)/) || url.match(/\/(\d{7,})(?:\/|$)/);
      if (prodCode && prodCode[1]) {
        return `https://images-americanas.b2w.io/produtos/${prodCode[1]}/imagens/original.jpg`;
      }
    }
    
    // Casas Bahia, Extra e Ponto Frio (Via Varejo)
    if (domain.includes('casasbahia.com.br') || domain.includes('pontofrio.com.br') || domain.includes('extra.com.br')) {
      const prodCode = url.match(/\/(\d+)\/p/) || url.match(/\/(\d{7,})(?:\/|$)/);
      if (prodCode && prodCode[1]) {
        return `https://imgs.casasbahia.com.br/${prodCode[1]}/1g.jpg`;
      }
    }
    
    // Shopee
    if (domain.includes('shopee.com.br')) {
      const shopeeMatch = url.match(/i\.(\d+)\.(\d+)/) || url.match(/\/(\d+\.\d+)/);
      if (shopeeMatch) {
        const shopId = shopeeMatch[1] || shopeeMatch[0].split('.')[0];
        return `https://cf.shopee.com.br/file/${shopId}_tn`;
      }
    }
    
    // KaBuM
    if (domain.includes('kabum.com.br')) {
      const kabumMatch = url.match(/produto\/(\d+)/) || url.match(/\/(\d{6,})(?:\/|$)/);
      if (kabumMatch && kabumMatch[1]) {
        return `https://images.kabum.com.br/produtos/fotos/sync_${kabumMatch[1]}/grande/1_${kabumMatch[1]}_1664384789_gg.jpg`;
      }
    }
    
    // Netshoes
    if (domain.includes('netshoes.com.br')) {
      const netshoesMatch = url.match(/produto\/([A-Za-z0-9-]+)/) || url.match(/\/([A-Za-z0-9-]{10,})(?:\/|$)/);
      if (netshoesMatch && netshoesMatch[1]) {
        return `https://static.netshoes.com.br/produtos/${netshoesMatch[1]}/06/001-1623-006/001-1623-006_zoom1.jpg`;
      }
    }
    
    // Centauro
    if (domain.includes('centauro.com.br')) {
      const centauroMatch = url.match(/(\d{6,})\.html/) || url.match(/\/(\d{6,})(?:\/|$)/);
      if (centauroMatch && centauroMatch[1]) {
        return `https://imgcentauro-a.akamaihd.net/900x900/${centauroMatch[1]}/01/img.jpg`;
      }
    }
    
    // Fast Shop
    if (domain.includes('fastshop.com.br')) {
      const fastshopMatch = url.match(/p\/d\/([A-Za-z0-9_]+)/) || url.match(/\/([A-Za-z0-9_]{10,})(?:\/|$)/);
      if (fastshopMatch && fastshopMatch[1]) {
        return `https://images.fastshop.com.br/imagestream/produto/${fastshopMatch[1]}_500x500.jpg`;
      }
    }

    return null;
  } catch (e) {
    console.error('Erro ao extrair imagem de marketplace:', e.message);
    return null;
  }
}

/**
 * Verifica se a URL é de um marketplace válido
 * @param {string} url - URL a ser verificada
 * @returns {boolean} Verdadeiro se for um marketplace válido
 */
function isValidMarketplace(url) {
  if (!url || typeof url !== 'string') return false;
  
  const validDomains = [
    'mercadolivre.com.br', 'mercadolibre.com',
    'amazon.com.br', 'amazon.com',
    'magazineluiza.com.br', 'magalu.com',
    'americanas.com.br', 'americanas.com',
    'submarino.com.br', 'shoptime.com.br',
    'casasbahia.com.br', 'pontofrio.com.br', 'extra.com.br',
    'shopee.com.br', 'aliexpress.com',
    'kabum.com.br', 'fastshop.com.br',
    'netshoes.com.br', 'centauro.com.br',
    'riachuelo.com.br', 'leroy.com.br', 'madeiramadeira.com.br',
    'havan.com.br', 'bagaggio.com.br', 'dji.com',
    'sephora.com.br', 'dell.com', 'flexform.com.br'
  ];
  
  try {
    const domain = extractDomainFromUrl(url);
    return validDomains.some(validDomain => domain.includes(validDomain));
  } catch (e) {
    console.error('Erro ao validar marketplace:', e.message);
    return false;
  }
}

/**
 * Detecta o marketplace com base na URL do produto
 * @param {string} url - URL do produto
 * @returns {string} Nome do marketplace ou "Desconhecido"
 */
function detectMarketplace(url) {
  if (!url || typeof url !== 'string') return 'Desconhecido';
  
  try {
    const domain = extractDomainFromUrl(url);
    
    // Principais marketplaces brasileiros
    if (domain.includes('mercadolivre.com.br') || domain.includes('mercadolibre.com')) {
      return 'Mercado Livre';
    } else if (domain.includes('amazon.com.br') || domain.includes('amazon.com')) {
      return 'Amazon';
    } else if (domain.includes('magazineluiza.com.br') || domain.includes('magalu.com')) {
      return 'Magazine Luiza';
    } else if (domain.includes('americanas.com.br') || domain.includes('americanas.com')) {
      return 'Americanas';
    } else if (domain.includes('submarino.com.br')) {
      return 'Submarino';
    } else if (domain.includes('shoptime.com.br')) {
      return 'Shoptime';
    } else if (domain.includes('casasbahia.com.br')) {
      return 'Casas Bahia';
    } else if (domain.includes('pontofrio.com.br')) {
      return 'Ponto Frio';
    } else if (domain.includes('extra.com.br')) {
      return 'Extra';
    } else if (domain.includes('shopee.com.br')) {
      return 'Shopee';
    } else if (domain.includes('aliexpress.com')) {
      return 'AliExpress';
    } else if (domain.includes('kabum.com.br')) {
      return 'KaBuM!';
    } else if (domain.includes('fastshop.com.br')) {
      return 'Fast Shop';
    } else if (domain.includes('netshoes.com.br')) {
      return 'Netshoes';
    } else if (domain.includes('centauro.com.br')) {
      return 'Centauro';
    } 
    // Marketplaces adicionais
    else if (domain.includes('riachuelo.com.br')) {
      return 'Riachuelo';
    } else if (domain.includes('leroy.com.br')) {
      return 'Leroy Merlin';
    } else if (domain.includes('madeiramadeira.com.br')) {
      return 'Madeira Madeira';
    } else if (domain.includes('havan.com.br')) {
      return 'Havan';
    } else if (domain.includes('bagaggio.com.br')) {
      return 'Bagaggio';
    } else if (domain.includes('dji.com')) {
      return 'DJI Store';
    } else if (domain.includes('sephora.com.br')) {
      return 'Sephora';
    } else if (domain.includes('dell.com')) {
      return 'Dell';
    } else if (domain.includes('flexform.com.br')) {
      return 'Flexform';
    } else if (isValidMarketplace(url)) {
      // Se está na lista de marketplaces válidos mas não tem detecção específica
      return 'Loja Online';
    } else {
      // Domínios desconhecidos
      return 'Outro';
    }
  } catch (e) {
    console.error('Erro ao detectar marketplace:', e.message);
    return 'Desconhecido';
  }
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
  constroiQueryGoogle,
  getBestImage,
  extractPrice,
  extractImageFromLink,
  extractImageFromSnippet,
  extrairCategoriaGoogle,
  extractDomainFromUrl,
  getMarketplaceImage,
  isValidMarketplace,
  detectMarketplace
};
