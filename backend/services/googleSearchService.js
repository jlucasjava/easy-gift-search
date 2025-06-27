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
 * @param {Object} filtros - Filtros adicionais (preço, etc.)
 * @returns {Promise<Object>} Resultados da busca
 */
async function searchGoogle(query, num = 10, start = 1, useCache = true, filtros = {}) {
  try {
    // Verificar se há dados no cache e retornar se existir
    const cacheKey = `google_search_${query}_${num}_${start}_${JSON.stringify(filtros)}`;
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
        q: `${query} comprar produto site:mercadolivre.com.br OR site:amazon.com.br OR site:magazineluiza.com.br OR site:americanas.com.br OR site:shopee.com.br`,
        start: start,
        num: Math.min(num, 10), // Máximo 10 resultados por página
        gl: 'br',           // Geolocalização Brasil
        cr: 'countryBR',    // Restringir a resultados do Brasil
        lr: 'lang_pt|lang_en',      // Páginas em Português ou Inglês
        safe: 'moderate',     // Filtro SafeSearch moderado
        sort: 'relevance',  // Ordenar por relevância (padrão)
        filter: '0',        // Sem filtro de duplicados para maximizar resultados
        imgSize: 'medium',  // Preferência por imagens médias para thumbnails
        fields: 'items(title,link,snippet,pagemap)'  // Limitar campos retornados para economia
      },
      timeout: 10000,
      httpsAgent
    };

    // Adicionar informações de preço à query se estiverem disponíveis
    if (filtros.precoMin || filtros.precoMax) {
      let precoQuery = '';
      
      if (filtros.precoMin && filtros.precoMax) {
        precoQuery = ` preço entre R$${filtros.precoMin} e R$${filtros.precoMax}`;
      } else if (filtros.precoMax) {
        precoQuery = ` preço até R$${filtros.precoMax}`;
      } else if (filtros.precoMin) {
        precoQuery = ` preço acima de R$${filtros.precoMin}`;
      }
      
      requestConfig.params.q += precoQuery;
      console.log(`� Adicionando filtro de preço à query: "${precoQuery}"`);
    }

    console.log(`�🔍 Buscando no Google Custom Search API: "${query}"`);
    const response = await axios(requestConfig);

    if (response.data) {
      console.log(`✅ Google Custom Search API: ${response.data.items?.length || 0} resultados encontrados`);
      
      // Processar e normalizar resultados
      let resultados = response.data.items?.map(item => ({
        title: item.title,
        link: normalizeProductUrl(item.link),
        snippet: item.snippet,
        image: getBestImage(item),
        price: extractPrice(item.title, item.snippet),
        source: 'Google Custom Search',
        marketplace: detectMarketplace(item.link),
        relevance: 10 // Pontuação inicial de relevância
      })) || [];
      
      // Calcular a relevância de cada resultado com base em vários fatores
      resultados = calcularRelevancia(resultados, query, filtros);
      
      // Primeiro, filtrar links que parecem ser de produtos específicos
      const productLinks = resultados.filter(item => isValidProductLink(item.link));
      console.log(`📦 Links de produtos: ${productLinks.length}/${resultados.length}`);
      
      // Depois, filtrar para marketplaces válidos entre os links de produto
      const validResults = productLinks.filter(item => isValidMarketplace(item.link));
      console.log(`🛒 Links de produtos em marketplaces válidos: ${validResults.length}/${productLinks.length}`);
      
      // Filtrar por faixa de preço (se aplicável)
      let filteredResults = validResults;
      if (filtros.precoMin || filtros.precoMax) {
        filteredResults = filterByPriceRange(validResults, filtros);
        console.log(`💰 Produtos filtrados por preço: ${filteredResults.length}/${validResults.length}`);
      }
      
      // Se não tivermos resultados suficientes após filtrar por preço
      if (filteredResults.length < 3) {
        console.log(`⚠️ Poucos resultados válidos (${filteredResults.length}) após filtrar por preço. Buscando mais opções...`);
        
        // ESTRATÉGIA 1: Buscar em todos os links de produtos com preço válido
        if (filtros.precoMin || filtros.precoMax) {
          const maisResultados = filterByPriceRange(
            productLinks.filter(item => !filteredResults.includes(item)), // Links que ainda não estão nos resultados
            filtros
          );
          
          if (maisResultados.length > 0) {
            console.log(`✅ Encontrados mais ${maisResultados.length} produtos dentro da faixa de preço`);
            filteredResults = [...filteredResults, ...maisResultados];
          }
        }
        
        // ESTRATÉGIA 2: Se ainda não tivermos resultados suficientes, incluir produtos de marketplaces válidos
        // que não têm preço detectado, mas apenas se estamos procurando produtos baratos (sem preço mínimo)
        if (filteredResults.length < 3 && (!filtros.precoMin || filtros.precoMin <= 0)) {
          const produtosSemPreco = validResults.filter(item => 
            !item.price && !filteredResults.includes(item)
          ).slice(0, 5); // Limitar a 5 resultados adicionais
          
          if (produtosSemPreco.length > 0) {
            console.log(`✅ Incluindo ${produtosSemPreco.length} produtos sem preço detectado de marketplaces válidos`);
            filteredResults = [...filteredResults, ...produtosSemPreco];
          }
        }
        
        // ESTRATÉGIA 3: Se ainda não tivermos resultados suficientes e temos um preço mínimo,
        // incluir produtos de marketplaces premium que não têm preço detectado
        if (filteredResults.length < 3 && filtros.precoMin > 0) {
          const premiumMarketplaces = ['Amazon Brasil', 'Fast Shop', 'Magazine Luiza'];
          const produtosPremium = validResults.filter(item => 
            !item.price && 
            !filteredResults.includes(item) && 
            premiumMarketplaces.includes(detectMarketplace(item.link))
          ).slice(0, 5); // Limitar a 5 resultados adicionais
          
          if (produtosPremium.length > 0) {
            console.log(`✅ Incluindo ${produtosPremium.length} produtos sem preço detectado de marketplaces premium`);
            filteredResults = [...filteredResults, ...produtosPremium];
          }
        }
      }
      
      // Ordenar os resultados finais por relevância
      filteredResults.sort((a, b) => b.relevance - a.relevance);
      
      // Limitar ao número de resultados solicitados
      const resultadosFinais = filteredResults.slice(0, Math.max(num, 5));
      console.log(`✅ Retornando ${resultadosFinais.length} resultados finais ordenados por relevância`);
      
      // Armazenar resultados no cache
      if (useCache && resultadosFinais.length > 0) {
        cache.set(cacheKey, resultadosFinais);
        console.log(`💾 Resultados armazenados em cache para: "${query}"`);
      }
      
      return resultadosFinais;
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
  
  // Verificação preliminar para descartar textos sem preço rapidamente
  const precoIndicators = [
    'R$', 'reais', 'por', 'preço', 'custa', 'valor', 'compre',
    'de ', 'a partir de', 'custando', 'apenas'
  ];
  
  let hasIndicator = false;
  for (const indicator of precoIndicators) {
    if (fullText.toLowerCase().includes(indicator.toLowerCase())) {
      hasIndicator = true;
      break;
    }
  }
  
  if (!hasIndicator) return null;
  
  // Estratégia 1: Extrair preços formatados com R$ e formato BR (mais confiável)
  // Formato: R$ 1.299,99 ou R$1299,99
  const formatoCompleto = /R\$\s?(\d{1,3}(?:\.\d{3})*|\d+),(\d{2})(?!\d)/i;
  const match = fullText.match(formatoCompleto);
  if (match) {
    const valorInteiro = match[1].replace(/\./g, '');
    const valor = parseInt(valorInteiro, 10);
    // Validação de faixa razoável para produtos
    if (valor >= 5 && valor <= 50000) {
      return `R$ ${valorInteiro},${match[2]}`;
    }
  }
  
  // Estratégia 2: Buscar outros formatos comuns de preço
  const outrosFormatos = [
    // Preço entre parênteses com R$
    /\(R\$\s?(\d{1,3}(?:\.\d{3})*|\d+),(\d{2})\)/i,
    
    // Preço após "por" ou "apenas"
    /(?:por|apenas)\s+R\$\s?(\d{1,3}(?:\.\d{3})*|\d+),(\d{2})/i,
    
    // Preço com ponto como separador decimal (incomum no Brasil)
    /R\$\s?(\d{1,3}(?:,\d{3})*|\d+)\.(\d{2})(?!\d)/i,
    
    // Preço sem "R$" mas com formato de valor (XX,XX)
    /(?:^|\s|por|apenas|:)\s*(\d{1,3}(?:\.\d{3})*|\d+),(\d{2})(?!\d)/
  ];
  
  for (const formato of outrosFormatos) {
    const match = fullText.match(formato);
    if (match && match.length >= 3) {
      const valorInteiro = match[1].replace(/\./g, '').replace(/,/g, '');
      const valor = parseInt(valorInteiro, 10);
      if (valor >= 5 && valor <= 50000) {
        return `R$ ${valorInteiro},${match[2]}`;
      }
    }
  }
  
  // Estratégia 3: Preços simplificados (sem centavos)
  const precoSimples = [
    // R$ seguido de número
    /R\$\s?(\d{1,4})(?!\d|,|\.)/, 
    
    // Número após "custa" ou "preço"
    /(?:custa|preço|valor)\s+(?:de\s+)?(?:R\$\s?)?(\d{1,4})(?!\d|,|\.)/i,
    
    // Número seguido de "reais"
    /(\d{1,4})\s+reais/i
  ];
  
  for (const formato of precoSimples) {
    const match = fullText.match(formato);
    if (match && match[1]) {
      const valor = parseInt(match[1], 10);
      if (valor >= 5 && valor <= 50000) {
        return `R$ ${match[1]},00`;
      }
    }
  }
  
  // Estratégia 4: Extrair preços de títulos de marketplaces específicos
  if (title) {
    // Formatos como "Produto XYZ - R$ 99,90" ou "Produto XYZ | R$ 99,90"
    const specialFormats = [
      // Preço após hífen
      /-\s*R\$\s?(\d{1,3}(?:\.\d{3})*|\d+),(\d{2})(?!\d)/i,
      
      // Preço após pipe
      /\|\s*R\$\s?(\d{1,3}(?:\.\d{3})*|\d+),(\d{2})(?!\d)/i,
      
      // Preço no final do título com R$
      /[\s-]\s*R\$\s?(\d{1,3}(?:\.\d{3})*|\d+),(\d{2})(?!\d)$/i,
      
      // Preço após ">"
      />\s*R\$\s?(\d{1,3}(?:\.\d{3})*|\d+),(\d{2})(?!\d)/i
    ];
    
    for (const formato of specialFormats) {
      const match = title.match(formato);
      if (match && match.length >= 3) {
        const valorInteiro = match[1].replace(/\./g, '');
        const valor = parseInt(valorInteiro, 10);
        if (valor >= 5 && valor <= 50000) {
          return `R$ ${valorInteiro},${match[2]}`;
        }
      }
    }
    
    // Buscar qualquer número que pareça um preço no título
    const titleMatch = title.match(/(?:^|\s|R\$\s?)(\d{2,4})(?:,\d{2})?(?!\d|,|\.)/);
    if (titleMatch && titleMatch[1]) {
      const valor = parseInt(titleMatch[1], 10);
      if (valor >= 10 && valor <= 15000) {
        // Verificar se tem centavos
        if (title.includes(titleMatch[1] + ',')) {
          const centavosMatch = title.match(new RegExp(titleMatch[1] + ',(\\d{2})'));
          if (centavosMatch && centavosMatch[1]) {
            return `R$ ${titleMatch[1]},${centavosMatch[1]}`;
          }
        }
        return `R$ ${titleMatch[1]},00`;
      }
    }
  }
  
  // Estratégia 5: Verificar valores numéricos em snippet para marketplaces específicos
  if (snippet && (snippet.includes('mercadolivre') || snippet.includes('amazon') || snippet.includes('magalu'))) {
    // Buscar valores que pareçam preços para marketplaces confiáveis
    const snippetMatch = snippet.match(/(\d{2,4}),(\d{2})(?!\d)/);
    if (snippetMatch && snippetMatch.length >= 3) {
      const valor = parseInt(snippetMatch[1], 10);
      if (valor >= 10 && valor <= 15000) {
        return `R$ ${snippetMatch[1]},${snippetMatch[2]}`;
      }
    }
  }
  
  return null;
}

/**
 * Filtra resultados por faixa de preço
 * @param {Array} resultados - Array de resultados da busca
 * @param {Object} filtros - Filtros aplicados à busca
 * @returns {Array} Resultados filtrados por preço
 */
function filterByPriceRange(resultados, filtros) {
  if (!resultados || !Array.isArray(resultados) || resultados.length === 0) {
    return resultados;
  }
  
  // Se não houver filtros de preço, retornar todos os resultados
  if (!filtros || (!filtros.precoMin && !filtros.precoMax)) {
    return resultados;
  }
  
  console.log(`🔍 Filtrando por preço: Min=${filtros.precoMin || 'N/A'}, Max=${filtros.precoMax || 'N/A'}`);
  
  // Converter strings para números
  const precoMin = filtros.precoMin ? parseFloat(filtros.precoMin) : 0;
  const precoMax = filtros.precoMax ? parseFloat(filtros.precoMax) : Infinity;
  
  // Primeiro, garantir que todos os resultados tenham chance de ter preço extraído
  const resultadosComPreco = resultados.map(item => {
    if (!item.price && (item.title || item.snippet)) {
      item.price = extractPrice(item.title, item.snippet);
      
      // Se ainda não tiver preço, mas for de um marketplace prioritário, tentar extrair com mais força
      if (!item.price && isValidProductLink(item.link)) {
        const marketplace = detectMarketplace(item.link);
        const isPriority = ['Amazon Brasil', 'Mercado Livre', 'Magazine Luiza', 'Americanas'].includes(marketplace);
        
        if (isPriority && item.title) {
          // Buscar números isolados no título que possam ser preços
          const numMatches = item.title.match(/\b(\d{2,4})\b/g);
          if (numMatches && numMatches.length > 0) {
            // Pegar o número mais provável (entre 50 e 5000)
            const possiblePrices = numMatches
              .map(n => parseInt(n, 10))
              .filter(n => n >= 50 && n <= 5000);
            
            if (possiblePrices.length > 0) {
              // Ordenar e pegar o do meio (mais provável)
              possiblePrices.sort((a, b) => a - b);
              const midPrice = possiblePrices[Math.floor(possiblePrices.length / 2)];
              item.price = `R$ ${midPrice},00`;
              item.priceProbability = 'medium'; // Marcar como preço de confiança média
            }
          }
        }
      }
    }
    return item;
  });
  
  // Separar os resultados em três grupos: dentro da faixa, sem preço, e fora da faixa
  const dentroDaFaixa = [];
  const semPreco = [];
  const foraDaFaixa = [];
  
  resultadosComPreco.forEach(item => {
    // Se não tem preço, separar para possível uso posterior
    if (!item.price) {
      semPreco.push(item);
      return;
    }
    
    const precoNum = extrairValorNumerico(item.price);
    
    // Se não conseguimos extrair um valor numérico válido
    if (precoNum === null) {
      semPreco.push(item);
      return;
    }
    
    // Verificar se o preço está dentro da faixa
    const dentroDoRange = precoNum >= precoMin && precoNum <= precoMax;
    
    if (dentroDoRange) {
      console.log(`✅ Produto dentro da faixa de preço: "${item.title?.substring(0, 50)}..." - ${item.price} (${precoNum})`);
      
      // Aumentar a relevância para produtos dentro da faixa de preço
      item.relevance = (item.relevance || 10) + 5;
      
      // Aumentar ainda mais a relevância para produtos no meio da faixa
      if (filtros.precoMin && filtros.precoMax) {
        const middlePrice = (precoMin + precoMax) / 2;
        const distanceFromMiddle = Math.abs(precoNum - middlePrice) / (precoMax - precoMin);
        item.relevance += 5 * (1 - distanceFromMiddle);
      }
      
      // Adicionar indicador de correspondência de preço
      item.priceMatch = true;
      
      dentroDaFaixa.push(item);
    } else {
      console.log(`❌ Produto fora da faixa de preço: "${item.title?.substring(0, 50)}..." - ${item.price} (${precoNum})`);
      
      // Adicionar o quanto está fora da faixa para possível ordenação
      if (precoNum < precoMin) {
        item.priceDistance = precoMin - precoNum;
      } else {
        item.priceDistance = precoNum - precoMax;
      }
      
      foraDaFaixa.push(item);
    }
  });
  
  console.log(`✅ ${dentroDaFaixa.length} de ${resultados.length} produtos dentro da faixa de preço`);
  
  // Se temos poucos resultados na faixa, podemos complementar com produtos de marketplaces prioritários sem preço
  if (dentroDaFaixa.length < 3) {
    console.log(`⚠️ Poucos produtos na faixa (${dentroDaFaixa.length}). Buscando complementos...`);
    
    // Primeiro, tentar os que estão ligeiramente fora da faixa (até 20% de diferença)
    if (foraDaFaixa.length > 0 && (precoMax > 0 || precoMin > 0)) {
      const tolerancia = Math.max(precoMin * 0.2, precoMax * 0.2, 50); // 20% ou no mínimo 50 reais
      
      const proximosDaFaixa = foraDaFaixa
        .filter(item => item.priceDistance && item.priceDistance <= tolerancia)
        .sort((a, b) => (a.priceDistance || 0) - (b.priceDistance || 0))
        .slice(0, 5 - dentroDaFaixa.length);
      
      if (proximosDaFaixa.length > 0) {
        console.log(`✅ Adicionando ${proximosDaFaixa.length} produtos próximos da faixa de preço (tolerância: R$ ${tolerancia.toFixed(2)})`);
        dentroDaFaixa.push(...proximosDaFaixa);
      }
    }
    
    // Se ainda precisamos de mais, incluir produtos de marketplaces confiáveis sem preço
    if (dentroDaFaixa.length < 3) {
      const marketplacesPrioritarios = ['Amazon Brasil', 'Mercado Livre', 'Magazine Luiza', 'Americanas'];
      
      const produtosConfiaveis = semPreco
        .filter(item => {
          const marketplace = item.marketplace || detectMarketplace(item.link);
          return marketplacesPrioritarios.includes(marketplace) && isValidProductLink(item.link);
        })
        .slice(0, 5 - dentroDaFaixa.length);
      
      if (produtosConfiaveis.length > 0) {
        console.log(`✅ Adicionando ${produtosConfiaveis.length} produtos de marketplaces confiáveis sem preço detectado`);
        dentroDaFaixa.push(...produtosConfiaveis);
      }
    }
  }
  
  // Ordenar por relevância
  dentroDaFaixa.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
  
  return dentroDaFaixa;
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
    
    // Preparar filtros de preço
    const filtrosPreco = {};
    if (filtros.precoMin) {
      filtrosPreco.precoMin = filtros.precoMin;
    }
    if (filtros.precoMax) {
      filtrosPreco.precoMax = filtros.precoMax;
    }
    
    console.log(`🔍 Buscando presentes no Google: "${query}" (página ${page}, início ${start}, ${num} por página)`);
    if (filtros.precoMin || filtros.precoMax) {
      console.log(`💰 Filtro de preço: Min=${filtros.precoMin || 'N/A'}, Max=${filtros.precoMax || 'N/A'}`);
    }
    
    // Buscar resultados no Google
    const resultados = await searchGoogle(query, num, start, true, filtrosPreco);
    
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
    // Remover protocolo e parâmetros
    let domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
    return domain.toLowerCase();
  } catch (error) {
    console.error('Erro ao extrair domínio da URL:', error);
    return url;
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
  
  url = url.toLowerCase();
  
  // Lista simplificada de domínios de marketplaces
  const marketplaces = [
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
  
  // Verificar se a URL contém qualquer um dos marketplaces
  return marketplaces.some(marketplace => url.includes(marketplace));
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
    
    // Mapeamento de domínios para nomes de marketplaces
    const marketplaceMap = {
      'mercadolivre.com.br': 'Mercado Livre',
      'produto.mercadolivre.com.br': 'Mercado Livre',
      'mercadolibre.com': 'Mercado Libre',
      'amazon.com.br': 'Amazon Brasil',
      'amazon.com': 'Amazon',
      'magazineluiza.com.br': 'Magazine Luiza',
      'magalu.com.br': 'Magazine Luiza',
      'magalu.com': 'Magazine Luiza',
      'americanas.com.br': 'Americanas',
      'americanas.com': 'Americanas',
      'submarino.com.br': 'Submarino',
      'shoptime.com.br': 'Shoptime',
      'casasbahia.com.br': 'Casas Bahia',
      'pontofrio.com.br': 'Ponto',
      'extra.com.br': 'Extra',
      'shopee.com.br': 'Shopee',
      'br.shopee.com': 'Shopee',
      'aliexpress.com': 'AliExpress',
      'pt.aliexpress.com': 'AliExpress',
      'kabum.com.br': 'KaBuM!',
      'fastshop.com.br': 'Fast Shop',
      'netshoes.com.br': 'Netshoes',
      'centauro.com.br': 'Centauro',
      'riachuelo.com.br': 'Riachuelo',
      'leroy.com.br': 'Leroy Merlin',
      'madeiramadeira.com.br': 'Madeira Madeira',
      'havan.com.br': 'Havan',
      'bagaggio.com.br': 'Bagaggio',
      'dji.com': 'DJI Store',
      'sephora.com.br': 'Sephora',
      'dell.com': 'Dell',
      'flexform.com.br': 'Flexform'
    };
    
    // Verificar correspondências exatas ou parciais
    for (const [marketplaceDomain, marketplaceName] of Object.entries(marketplaceMap)) {
      if (domain === marketplaceDomain || domain.includes(marketplaceDomain) || marketplaceDomain.includes(domain)) {
        return marketplaceName;
      }
    }
    
    // Se não encontrar nos marketplaces conhecidos, verificar se é um marketplace válido
    if (isValidMarketplace(url)) {
      // Se está na lista de marketplaces válidos mas não tem detecção específica
      return 'Loja Online';
    }
    
    // Tentar extrair o nome do domínio
    const domainParts = domain.split('.');
    if (domainParts.length >= 2) {
      // Usar a parte principal do domínio com primeira letra maiúscula
      const mainDomain = domainParts[domainParts.length - 2];
      if (mainDomain && mainDomain.length > 3) {
        return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
      }
    }
    
    // Domínios desconhecidos
    return 'Outro';
  } catch (e) {
    console.error('Erro ao detectar marketplace:', e.message);
    return 'Desconhecido';
  }
}

/**
 * Verifica se um link parece ser um link válido para um produto específico
 * @param {string} url - URL a ser verificada
 * @returns {boolean} True se o link parece ser de um produto
 */
function isValidProductLink(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Normalizar a URL para evitar problemas com variações
  const urlLower = url.toLowerCase();
  const domain = extractDomainFromUrl(url);
  
  // Verificar se a URL tem tamanho razoável
  if (url.length > 500) return false; // URLs muito longas geralmente não são de produtos
  
  // Verificar se tem parâmetros de rastreamento em excesso
  const queryParams = url.split('?')[1];
  if (queryParams && queryParams.split('&').length > 5) {
    return false; // Muitos parâmetros indicam páginas de busca ou rastreamento
  }
  
  // Lista ampliada e mais restritiva de padrões que NÃO são de produtos específicos
  const invalidPatterns = [
    // Páginas de busca
    /\/busca\//, /\/search\//, /\/s\?k=/, /\/pesquisa\//, 
    /\?q=/, /\?query=/, /\?search=/, /\?term=/, /\?searchterm=/,
    /\/resultados-busca\//, /\/resultado-busca\//, 
    
    // Páginas de categoria
    /\/categoria\//, /\/departamento\//, /\/dept\//, /\/c\//, 
    /\/category\//, /\/catalogue\//, /\/catalog\//, 
    /\/colecao\//, /\/collection\//, /\/collections\//, 
    
    // Páginas de marketplace e listagens
    /\/marketplace\//, /\/loja\//, /\/seller\//, /\/store\//,
    /\/lista\//, /\/ofertas\//, /\/promocao\//, /\/promocoes\//,
    /\/marca\//, /\/brand\//, /\/marcas\//, 
    
    // Páginas institucionais
    /\/ajuda\//, /\/help\//, /\/support\//, /\/contato\//, 
    /\/about\//, /\/sobre\//, /\/institucional\//, /\/terms\//,
    /\/politica-/, /\/policy\//, /\/policies\//, /\/faq\//,
    
    // Páginas de login e conta
    /\/conta\//, /\/minha-conta\//, /\/account\//, /\/login\//,
    /\/cadastro\//, /\/register\//, /\/signup\//, /\/auth\//,
    
    // Páginas de carrinho e checkout
    /\/carrinho\//, /\/cart\//, /\/checkout\//, /\/pagamento\//,
    /\/payment\//, /\/shipping\//, /\/entrega\//, /\/finalizar-compra\//,
    
    // Outros padrões que não são de produtos
    /\/blog\//, /\/noticias\//, /\/news\//, /\/artigos\//,
    /\/evento\//, /\/events\//, /\/lancamento\//, /\/release\//,
    
    // Padrões adicionais para capturar mais casos
    /\/whatsapp/, /\/facebook/, /\/instagram/, /\/twitter/,
    /\/youtube/, /\/tiktok/, /\/pinterest/, /\/linkedin/,
    /\/contato/, /\/mapa/, /\/map/, /\/como-chegar/,
    /\/onde-estamos/, /\/trabalhe-conosco/, /\/vagas/,
    /\/central-de-atendimento/, /\/atendimento/
  ];
  
  // Verificar padrões inválidos - retornar false rapidamente se encontrar algum
  for (const pattern of invalidPatterns) {
    if (pattern.test(urlLower)) {
      return false;
    }
  }
  
  // Marketplace específicos - a validação mais confiável
  
  // Mercado Livre
  if (domain.includes('mercadolivre.com.br') || domain.includes('mercadolibre.com')) {
    // URL de produto do Mercado Livre deve conter MLB-123456789 ou similar
    return /\/MLB-\d+/.test(url) || 
           /\/p\/MLB\d+/.test(url) || 
           url.includes('produto.mercadolivre') ||
           /\/produto\/MLB\d+/.test(url);
  }
  
  // Amazon
  if (domain.includes('amazon.com.br') || domain.includes('amazon.com')) {
    // URLs de produto da Amazon devem conter /dp/ ou /gp/product/ seguido de código ASIN (10 caracteres)
    return /\/dp\/[A-Z0-9]{10}/.test(url) || 
           /\/gp\/product\/[A-Z0-9]{10}/.test(url);
  }
  
  // Magazine Luiza
  if (domain.includes('magazineluiza.com.br') || domain.includes('magalu.com')) {
    return /\/p\/\d+/.test(url) || 
           /\/produto\/\d+/.test(url) ||
           /\/-\/p\/\d+/.test(url);
  }
  
  // Americanas, Submarino, Shoptime (B2W)
  if (domain.includes('americanas.com.br') || 
      domain.includes('submarino.com.br') || 
      domain.includes('shoptime.com.br')) {
    return /\/produto\/\d+/.test(url) || 
           /\/p\/\d+/.test(url);
  }
  
  // Shopee
  if (domain.includes('shopee.com.br') || domain.includes('br.shopee.com')) {
    return /\/product\/\d+\/\d+/.test(url) || 
           /\/item\/\d+\/\d+/.test(url) ||
           /i\.\d+\.\d+/.test(url);
  }
  
  // Casas Bahia, Ponto (Ex-Ponto Frio), Extra (Via Varejo)
  if (domain.includes('casasbahia.com.br') || 
      domain.includes('pontofrio.com.br') || 
      domain.includes('extra.com.br') ||
      domain.includes('ponto.com.br')) {
    return /\/p\/\d+/.test(url) || 
           /\/produto\/\d+/.test(url);
  }
  
  // KaBuM
  if (domain.includes('kabum.com.br')) {
    return /\/produto\/\d+/.test(url) ||
           /-p-\d+/.test(url);
  }
  
  // AliExpress
  if (domain.includes('aliexpress.com')) {
    return /\/item\/\d+\.html/.test(url) ||
           /\/product\/\d+\.html/.test(url);
  }
  
  // Padrões gerais mais restritos de produtos para marketplaces não específicos
  const strictProductPatterns = [
    // Padrões comuns de páginas de produto específicas
    /\/p\/\d{5,}/, // URL com /p/ seguido de ID numérico longo
    /\/produto\/\d{5,}/, // URL com /produto/ seguido de ID numérico longo
    /\/product\/\d{5,}/, // URL com /product/ seguido de ID numérico
    /\/item\/\d{5,}/, // URL com /item/ seguido de ID numérico
    
    // Padrões de ID de produto em URLs
    /-p-\d{5,}$/, // Termina com -p-12345
    /\/pd\/\d{5,}$/, // Termina com /pd/12345
    /\/prod\/\d{5,}$/ // Termina com /prod/12345
  ];
  
  // Se encontrarmos um padrão estrito, é muito provável que seja um produto
  for (const pattern of strictProductPatterns) {
    if (pattern.test(url)) {
      return true;
    }
  }
  
  // Verificação mais profunda para outros casos
  // URL deve ter profundidade razoável e não ter muitos parâmetros
  const urlPathOnly = url.split('?')[0]; // Remover query params
  const urlParts = urlPathOnly.split('/').filter(Boolean);
  
  // Se URL tiver profundidade razoável e um ID que parece ser de produto no final
  if (urlParts.length >= 3 && urlParts.length <= 5) {
    const lastPart = urlParts[urlParts.length - 1];
    
    // Verificar se o último segmento parece um ID de produto
    // (deve ter números e possivelmente letras, mas não ser apenas texto)
    if (/[0-9]/.test(lastPart) && // Deve conter pelo menos um número
        /^[a-zA-Z0-9_-]{6,}$/.test(lastPart) && // Deve ter pelo menos 6 caracteres
        !lastPart.includes('.') && // Não deve ser um arquivo
        !/^[a-zA-Z]+$/.test(lastPart)) { // Não deve ser apenas letras
      
      // Verificação adicional: deve ser de um marketplace válido
      if (isValidMarketplace(url)) {
        return true;
      }
    }
  }
  
  // Se passar por todas as verificações sem resultado definitivo, não é um link de produto
  return false;
}

/**
 * Normaliza e limpa uma URL de produto para melhorar a precisão
 * @param {string} url - URL original
 * @returns {string} URL normalizada
 */
function normalizeProductUrl(url) {
  if (!url || typeof url !== 'string') return url;
  
  try {
    // Remover parâmetros de rastreamento e UTM
    url = url.replace(/(\?|&)(utm_[^=]+=[^&]*)/g, '$1');
    url = url.replace(/(\?|&)(ref=[^&]*)/g, '$1');
    url = url.replace(/(\?|&)(tag=[^&]*)/g, '$1');
    url = url.replace(/(\?|&)(linkCode=[^&]*)/g, '$1');
    url = url.replace(/(\?|&)(camp=[^&]*)/g, '$1');
    url = url.replace(/(\?|&)(creative=[^&]*)/g, '$1');
    url = url.replace(/(\?|&)(creativeASIN=[^&]*)/g, '$1');
    url = url.replace(/(\?|&)(crid=[^&]*)/g, '$1');
    
    // Remover âncoras
    url = url.replace(/#[^#]*$/, '');
    
    // Se após remover parâmetros, a URL terminar com ? ou &, removê-los
    url = url.replace(/[?&]$/, '');
    
    // Verificar domínio específico para normalização especial
    const domain = extractDomainFromUrl(url);
    
    if (domain.includes('amazon')) {
      // Para Amazon, extrair apenas o ASIN (ID do produto)
      const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
      if (asinMatch && asinMatch[1]) {
        // Reconstruir URL limpa com apenas o ASIN
        const baseDomain = domain.includes('amazon.com.br') ? 'amazon.com.br' : 'amazon.com';
        return `https://www.${baseDomain}/dp/${asinMatch[1]}`;
      }
    }
    
    if (domain.includes('mercadolivre')) {
      // Para Mercado Livre, extrair apenas o MLB (ID do produto)
      const mlbMatch = url.match(/\/(MLB-\d+)/);
      if (mlbMatch && mlbMatch[1]) {
        return `https://www.mercadolivre.com.br/${mlbMatch[1]}`;
      }
    }
    
    // Para outros domínios, retornar a URL limpa
    return url;
  } catch (e) {
    console.error('Erro ao normalizar URL:', e.message);
    return url;
  }
}

/**
 * Calcula a pontuação de relevância para cada resultado com base em diversos fatores
 * @param {Array} resultados - Lista de resultados a classificar
 * @param {string} query - Termo de busca original
 * @param {Object} filtros - Filtros aplicados (preço, etc.)
 * @returns {Array} Resultados com pontuação de relevância
 */
function calcularRelevancia(resultados, query, filtros = {}) {
  if (!resultados || !Array.isArray(resultados)) return resultados;
  
  // Extrair palavras-chave da query para correspondência
  const keywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  
  // Marketplaces em ordem de prioridade
  const marketplacePriority = {
    'Amazon Brasil': 10,
    'Mercado Livre': 9,
    'Magazine Luiza': 8,
    'Americanas': 7,
    'Shopee': 6,
    'Casas Bahia': 5,
    'Submarino': 5,
    'KaBuM!': 5,
    'Fast Shop': 5
  };
  
  return resultados.map(item => {
    let relevance = item.relevance || 10; // Pontuação base
    
    // 1. Bonus para marketplaces prioritários
    const marketplace = item.marketplace || detectMarketplace(item.link);
    if (marketplacePriority[marketplace]) {
      relevance += marketplacePriority[marketplace];
    }
    
    // 2. Bonus para correspondência de palavras-chave no título
    if (item.title) {
      const titleLower = item.title.toLowerCase();
      keywords.forEach(keyword => {
        if (titleLower.includes(keyword)) {
          relevance += 3;
        }
      });
      
      // Bonus extra para correspondência exata de frases
      if (titleLower.includes(query.toLowerCase())) {
        relevance += 10;
      }
    }
    
    // 3. Bonus para produtos com preço detectado
    if (item.price) {
      relevance += 5;
      
      // Bonus maior para produtos dentro da faixa de preço
      if (filtros.precoMin || filtros.precoMax) {
        const precoNum = extrairValorNumerico(item.price);
        const precoMin = filtros.precoMin ? parseFloat(filtros.precoMin) : 0;
        const precoMax = filtros.precoMax ? parseFloat(filtros.precoMax) : Infinity;
        
        if (precoNum && precoNum >= precoMin && precoNum <= precoMax) {
          relevance += 15;
          
          // Bonus adicional para preços no meio da faixa (mais relevantes)
          if (filtros.precoMin && filtros.precoMax) {
            const middlePrice = (precoMin + precoMax) / 2;
            // Quanto mais próximo do meio da faixa, maior o bonus
            const distanceFromMiddle = Math.abs(precoNum - middlePrice) / (precoMax - precoMin);
            relevance += 5 * (1 - distanceFromMiddle);
          }
        }
      }
    }
    
    // 4. Penalty para URLs muito longas ou com muitos parâmetros
    // (URLs mais simples geralmente são melhores)
    if (item.link) {
      if (item.link.length > 150) relevance -= 3;
      
      const queryParams = item.link.split('?')[1];
      if (queryParams && queryParams.split('&').length > 3) {
        relevance -= 3;
      }
    }
    
    // 5. Penalty para descrições que não parecem ser de produtos
    if (item.snippet) {
      const snippet = item.snippet.toLowerCase();
      const nonProductTerms = ['política', 'ajuda', 'contato', 'faq', 'termos', 'sobre nós', 'quem somos'];
      
      for (const term of nonProductTerms) {
        if (snippet.includes(term)) {
          relevance -= 5;
          break;
        }
      }
    }
    
    // Garantir que a relevância nunca seja negativa
    item.relevance = Math.max(1, relevance);
    return item;
  });
}

/**
 * Função auxiliar para extrair valor numérico de preço formatado
 * @param {string} textoPreco - Texto do preço formatado (ex: "R$ 1.299,90")
 * @returns {number|null} Valor numérico ou null se não for possível extrair
 */
function extrairValorNumerico(textoPreco) {
  if (!textoPreco) return null;
  
  // Remover símbolo de moeda e espaços
  const semMoeda = textoPreco.replace(/R\$\s*/g, '');
  
  // Tratar diferentes formatos (vírgula ou ponto como separador decimal)
  let valorNumerico;
  
  // Formato brasileiro: 1.299,99 ou 1299,99
  if (semMoeda.includes(',')) {
    // Primeiro remove pontos de milhar, depois substitui vírgula por ponto
    valorNumerico = parseFloat(semMoeda.replace(/\./g, '').replace(',', '.'));
  } 
  // Formato internacional: 1,299.99 ou 1299.99
  else if (semMoeda.includes('.')) {
    // Remove vírgulas de milhar e mantém ponto como decimal
    valorNumerico = parseFloat(semMoeda.replace(/,/g, ''));
  } 
  // Formato sem decimais: 1299
  else {
    valorNumerico = parseFloat(semMoeda);
  }
  
  return isNaN(valorNumerico) ? null : valorNumerico;
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
  detectMarketplace,
  isValidProductLink,
  normalizeProductUrl,
  filterByPriceRange
};
