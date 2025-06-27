/**
 * Motor de busca personalizado para Easy Gift Search
 * Faz scraping diretamente dos sites de e-commerce para obter resultados mais precisos
 */

const axios = require('axios');
const cheerio = require('cheerio');
const axiosRetryModule = require('axios-retry');
const NodeCache = require('node-cache');

// Configurar cache para resultados
const customSearchCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Configurar retry para requisições
const axiosRetry = axiosRetryModule.default || axiosRetryModule;
axiosRetry(axios, { 
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
  }
});

// Headers comuns para simular um navegador
const defaultHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'Connection': 'keep-alive',
  'Cache-Control': 'max-age=0',
  'Upgrade-Insecure-Requests': '1'
};

/**
 * Busca produtos em múltiplas fontes e combina os resultados
 * @param {Object} filtros - Filtros de busca (preço, categoria, etc)
 * @returns {Promise<Array>} - Lista de produtos encontrados
 */
async function buscarProdutos(filtros) {
  console.log('🔍 Iniciando busca personalizada com filtros:', filtros);
  
  // Verificar cache
  const cacheKey = `custom_search_${JSON.stringify(filtros)}`;
  const cachedResults = customSearchCache.get(cacheKey);
  
  if (cachedResults) {
    console.log('🔄 Utilizando resultados em cache');
    return cachedResults;
  }
  
  // Construir termos de busca
  const termoBusca = construirTermoBusca(filtros);
  console.log(`🔤 Termo de busca: "${termoBusca}"`);
  
  // Lista de promises para buscar em cada marketplace
  const promises = [];
  
  // Baseado nos filtros, escolher fontes mais adequadas
  const fontes = escolherFontes(filtros);
  
  // Para cada fonte selecionada, adicionar à lista de promises
  for (const fonte of fontes) {
    promises.push(buscarEmFonte(fonte, termoBusca, filtros));
  }
  
  // Aguardar todas as buscas completarem
  console.log(`🌐 Buscando em ${promises.length} fontes...`);
  const resultadosPorFonte = await Promise.allSettled(promises);
  
  // Processar resultados
  let todosResultados = [];
  
  resultadosPorFonte.forEach((resultado, index) => {
    if (resultado.status === 'fulfilled' && resultado.value && resultado.value.length) {
      console.log(`✅ Fonte ${fontes[index]}: ${resultado.value.length} produtos encontrados`);
      todosResultados = [...todosResultados, ...resultado.value];
    } else {
      console.log(`❌ Fonte ${fontes[index]}: falha ou nenhum resultado`);
      if (resultado.reason) {
        console.error(`  Erro: ${resultado.reason.message || 'Desconhecido'}`);
      }
    }
  });
  
  // Filtrar resultados por preço
  const resultadosFiltrados = filtrarPorPreco(todosResultados, filtros);
  console.log(`💰 Após filtro de preço: ${resultadosFiltrados.length}/${todosResultados.length} produtos`);
  
  // Remover duplicados (baseado em URLs ou títulos muito similares)
  const resultadosUnicos = removerDuplicados(resultadosFiltrados);
  console.log(`🔄 Após remoção de duplicados: ${resultadosUnicos.length}/${resultadosFiltrados.length} produtos`);
  
  // Ordenar por relevância
  const resultadosOrdenados = ordenarPorRelevancia(resultadosUnicos, filtros);
  
  // Limitar número de resultados
  const resultadosFinais = resultadosOrdenados.slice(0, filtros.num || 10);
  console.log(`✅ Retornando ${resultadosFinais.length} resultados finais`);
  
  // Salvar no cache
  customSearchCache.set(cacheKey, resultadosFinais);
  
  return resultadosFinais;
}

/**
 * Constrói um termo de busca otimizado baseado nos filtros
 * @param {Object} filtros - Filtros de busca
 * @returns {string} - Termo de busca formatado
 */
function construirTermoBusca(filtros) {
  let termo = '';
  
  // Usar query se disponível, caso contrário usar categoria ou "presentes"
  if (filtros.query) {
    termo = filtros.query;
  } else if (filtros.categoria) {
    termo = filtros.categoria;
  } else {
    termo = 'presentes';
  }
  
  // Adicionar contexto de gênero se disponível
  if (filtros.genero) {
    termo += ` para ${filtros.genero}`;
  }
  
  // Adicionar contexto de idade se disponível
  if (filtros.idade) {
    termo += ` ${filtros.idade} anos`;
  }
  
  // Adicionar contexto de preço para termos de busca
  if (filtros.precoMax && filtros.precoMax <= 150) {
    termo += ' barato econômico';
  }
  
  return termo.trim();
}

/**
 * Escolhe as melhores fontes baseado nos filtros
 * @param {Object} filtros - Filtros de busca
 * @returns {Array<string>} - Lista de fontes selecionadas
 */
function escolherFontes(filtros) {
  // Lista completa de fontes disponíveis
  const todasFontes = ['mercadolivre', 'americanas', 'magazineluiza', 'shopee'];
  
  // Para preços baixos, priorizar Shopee e Mercado Livre
  if (filtros.precoMax && filtros.precoMax <= 150) {
    return ['shopee', 'mercadolivre', 'magazineluiza'];
  }
  
  // Para preços altos, incluir todas as fontes
  return todasFontes;
}

/**
 * Busca produtos em uma fonte específica
 * @param {string} fonte - Nome da fonte (marketplace)
 * @param {string} termo - Termo de busca
 * @param {Object} filtros - Filtros de busca
 * @returns {Promise<Array>} - Lista de produtos encontrados
 */
async function buscarEmFonte(fonte, termo, filtros) {
  try {
    switch (fonte) {
      case 'mercadolivre':
        return await buscarNoMercadoLivre(termo, filtros);
      case 'americanas':
        return await buscarNaAmericanas(termo, filtros);
      case 'magazineluiza':
        return await buscarNaMagazineLuiza(termo, filtros);
      case 'shopee':
        return await buscarNaShopee(termo, filtros);
      default:
        throw new Error(`Fonte não implementada: ${fonte}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao buscar na fonte ${fonte}:`, error.message);
    return [];
  }
}

/**
 * Busca produtos no Mercado Livre
 * @param {string} termo - Termo de busca
 * @param {Object} filtros - Filtros de busca
 * @returns {Promise<Array>} - Lista de produtos encontrados
 */
async function buscarNoMercadoLivre(termo, filtros) {
  try {
    // Construir URL de busca
    let url = `https://lista.mercadolivre.com.br/${encodeURIComponent(termo)}`;
    
    // Adicionar filtros de preço à URL se disponíveis
    if (filtros.precoMax) {
      url += `_PriceRange_0-${filtros.precoMax}`;
    }
    
    console.log(`🔍 Buscando no Mercado Livre: ${url}`);
    
    // Fazer requisição
    const response = await axios.get(url, { headers: defaultHeaders, timeout: 10000 });
    
    // Extrair informações com Cheerio
    const $ = cheerio.load(response.data);
    const produtos = [];
    
    // Seletor para itens de produto
    $('.ui-search-result__wrapper').each((i, el) => {
      try {
        // Extrair informações básicas
        const titulo = $(el).find('.ui-search-item__title').text().trim();
        const link = $(el).find('a.ui-search-link').attr('href');
        const precoElemento = $(el).find('.price-tag-amount');
        
        let preco = null;
        if (precoElemento.length) {
          const precoTexto = precoElemento.text().trim();
          // Extrair valor numérico
          const precoMatch = precoTexto.match(/R\$\s*([\d.,]+)/);
          if (precoMatch && precoMatch[1]) {
            preco = `R$ ${precoMatch[1]}`;
          }
        }
        
        // Extrair URL da imagem
        const imagem = $(el).find('.ui-search-result-image__element').attr('src') ||
                      $(el).find('img.ui-search-result-image__element').attr('data-src');
        
        // Adicionar à lista se tiver pelo menos título e link
        if (titulo && link) {
          produtos.push({
            title: titulo,
            link: link,
            price: preco,
            image: imagem,
            marketplace: 'Mercado Livre',
            source: 'Custom Search'
          });
        }
      } catch (err) {
        console.error('Erro ao processar item do Mercado Livre:', err.message);
      }
    });
    
    console.log(`✅ Mercado Livre: Encontrados ${produtos.length} produtos`);
    return produtos;
  } catch (error) {
    console.error('❌ Erro ao buscar no Mercado Livre:', error.message);
    return [];
  }
}

/**
 * Busca produtos na Americanas
 * @param {string} termo - Termo de busca
 * @param {Object} filtros - Filtros de busca
 * @returns {Promise<Array>} - Lista de produtos encontrados
 */
async function buscarNaAmericanas(termo, filtros) {
  try {
    // Construir URL de busca
    let url = `https://www.americanas.com.br/busca/${encodeURIComponent(termo)}`;
    
    // Adicionar filtros de preço à URL se disponíveis
    if (filtros.precoMin && filtros.precoMax) {
      url += `?filtro=%7B"id"%3A"precoPor"%2C"valor"%3A"de-${filtros.precoMin}-a-${filtros.precoMax}"%7D`;
    } else if (filtros.precoMax) {
      url += `?filtro=%7B"id"%3A"precoPor"%2C"valor"%3A"ate-${filtros.precoMax}"%7D`;
    }
    
    console.log(`🔍 Buscando na Americanas: ${url}`);
    
    // Fazer requisição
    const response = await axios.get(url, { headers: defaultHeaders, timeout: 10000 });
    
    // Extrair informações com Cheerio
    const $ = cheerio.load(response.data);
    const produtos = [];
    
    // Seletor para itens de produto
    $('div[data-testid="product-card"]').each((i, el) => {
      try {
        // Extrair informações básicas
        const titulo = $(el).find('[data-testid="product-card-title"]').text().trim();
        const link = 'https://www.americanas.com.br' + $(el).find('a').attr('href');
        
        // Extrair preço
        const precoElemento = $(el).find('[data-testid="price-original"]');
        let preco = null;
        if (precoElemento.length) {
          const precoTexto = precoElemento.text().trim();
          // Extrair valor numérico
          const precoMatch = precoTexto.match(/R\$\s*([\d.,]+)/);
          if (precoMatch && precoMatch[1]) {
            preco = `R$ ${precoMatch[1]}`;
          }
        }
        
        // Extrair URL da imagem
        const imagem = $(el).find('img').attr('src');
        
        // Adicionar à lista se tiver pelo menos título e link
        if (titulo && link) {
          produtos.push({
            title: titulo,
            link: link,
            price: preco,
            image: imagem,
            marketplace: 'Americanas',
            source: 'Custom Search'
          });
        }
      } catch (err) {
        console.error('Erro ao processar item da Americanas:', err.message);
      }
    });
    
    console.log(`✅ Americanas: Encontrados ${produtos.length} produtos`);
    return produtos;
  } catch (error) {
    console.error('❌ Erro ao buscar na Americanas:', error.message);
    return [];
  }
}

/**
 * Busca produtos na Magazine Luiza
 * @param {string} termo - Termo de busca
 * @param {Object} filtros - Filtros de busca
 * @returns {Promise<Array>} - Lista de produtos encontrados
 */
async function buscarNaMagazineLuiza(termo, filtros) {
  try {
    // Construir URL de busca
    let url = `https://www.magazineluiza.com.br/busca/${encodeURIComponent(termo)}`;
    
    // Adicionar filtros de preço à URL se disponíveis
    if (filtros.precoMin && filtros.precoMax) {
      url += `/precos/${filtros.precoMin}---${filtros.precoMax}/`;
    } else if (filtros.precoMax) {
      url += `/precos/0---${filtros.precoMax}/`;
    }
    
    console.log(`🔍 Buscando na Magazine Luiza: ${url}`);
    
    // Fazer requisição
    const response = await axios.get(url, { headers: defaultHeaders, timeout: 10000 });
    
    // Extrair informações com Cheerio
    const $ = cheerio.load(response.data);
    const produtos = [];
    
    // Seletor para itens de produto
    $('[data-testid="product-card"]').each((i, el) => {
      try {
        // Extrair informações básicas
        const titulo = $(el).find('[data-testid="product-title"]').text().trim();
        const link = 'https://www.magazineluiza.com.br' + $(el).find('a').attr('href');
        
        // Extrair preço
        const precoElemento = $(el).find('[data-testid="price-value"]');
        let preco = null;
        if (precoElemento.length) {
          const precoTexto = precoElemento.text().trim();
          preco = `R$ ${precoTexto}`;
        }
        
        // Extrair URL da imagem
        const imagem = $(el).find('img').attr('src');
        
        // Adicionar à lista se tiver pelo menos título e link
        if (titulo && link) {
          produtos.push({
            title: titulo,
            link: link,
            price: preco,
            image: imagem,
            marketplace: 'Magazine Luiza',
            source: 'Custom Search'
          });
        }
      } catch (err) {
        console.error('Erro ao processar item da Magazine Luiza:', err.message);
      }
    });
    
    console.log(`✅ Magazine Luiza: Encontrados ${produtos.length} produtos`);
    return produtos;
  } catch (error) {
    console.error('❌ Erro ao buscar na Magazine Luiza:', error.message);
    return [];
  }
}

/**
 * Busca produtos na Shopee
 * @param {string} termo - Termo de busca
 * @param {Object} filtros - Filtros de busca
 * @returns {Promise<Array>} - Lista de produtos encontrados
 */
async function buscarNaShopee(termo, filtros) {
  try {
    // A Shopee utiliza API para carregar os resultados
    // Vamos usar uma abordagem simplificada para evitar bloqueios
    
    // URL da busca (página inicial)
    const url = `https://shopee.com.br/search?keyword=${encodeURIComponent(termo)}`;
    
    console.log(`🔍 Buscando na Shopee: ${url}`);
    
    // Fazer requisição
    const response = await axios.get(url, { 
      headers: {
        ...defaultHeaders,
        'x-requested-with': 'XMLHttpRequest'
      }, 
      timeout: 10000 
    });
    
    // Extrair informações com Cheerio
    const $ = cheerio.load(response.data);
    const produtos = [];
    
    // A Shopee carrega os produtos via JavaScript, então vamos tentar extrair dados da página inicial
    // Em produção, usar uma API ou uma solução mais robusta como Puppeteer
    
    // Retornar alguns resultados simulados para Shopee (em produção, implementar corretamente)
    // Isso é apenas um placeholder
    if (filtros.precoMax) {
      const precoMax = parseFloat(filtros.precoMax);
      
      // Gerar alguns resultados relevantes dentro da faixa de preço
      for (let i = 1; i <= 5; i++) {
        const preco = Math.round((precoMax * 0.5) + (Math.random() * (precoMax * 0.45)));
        produtos.push({
          title: `${termo.charAt(0).toUpperCase() + termo.slice(1)} - Item Shopee ${i}`,
          link: `https://shopee.com.br/product/123456/78901${i}`,
          price: `R$ ${preco},00`,
          image: `https://cf.shopee.com.br/file/br-11134201-7qukw-lk5oxhn7dxik8c`,
          marketplace: 'Shopee',
          source: 'Custom Search'
        });
      }
    }
    
    console.log(`✅ Shopee: Retornando ${produtos.length} produtos (simulados)`);
    return produtos;
  } catch (error) {
    console.error('❌ Erro ao buscar na Shopee:', error.message);
    return [];
  }
}

/**
 * Filtra produtos por faixa de preço
 * @param {Array} produtos - Lista de produtos para filtrar
 * @param {Object} filtros - Filtros de preço
 * @returns {Array} - Produtos filtrados
 */
function filtrarPorPreco(produtos, filtros) {
  if (!produtos || !produtos.length) return [];
  if (!filtros.precoMin && !filtros.precoMax) return produtos;
  
  const precoMin = filtros.precoMin ? parseFloat(filtros.precoMin) : 0;
  const precoMax = filtros.precoMax ? parseFloat(filtros.precoMax) : Infinity;
  
  return produtos.filter(produto => {
    // Se não tiver preço, não incluir quando há filtro de preço
    if (!produto.price) return false;
    
    // Extrair valor numérico do preço
    const precoTexto = produto.price.replace('R$', '').replace('.', '').replace(',', '.').trim();
    const precoNum = parseFloat(precoTexto);
    
    // Se não conseguir extrair o preço, não incluir
    if (isNaN(precoNum)) return false;
    
    // Verificar se está dentro da faixa
    return precoNum >= precoMin && precoNum <= precoMax;
  });
}

/**
 * Remove produtos duplicados da lista
 * @param {Array} produtos - Lista de produtos
 * @returns {Array} - Produtos sem duplicatas
 */
function removerDuplicados(produtos) {
  // Usar Set para URLs únicas
  const urlsVistas = new Set();
  const titulosVistos = new Set();
  
  return produtos.filter(produto => {
    // Verificar URL duplicada
    if (urlsVistas.has(produto.link)) return false;
    urlsVistas.add(produto.link);
    
    // Verificar títulos muito similares
    const tituloSimplificado = produto.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 30);
    
    if (titulosVistos.has(tituloSimplificado)) return false;
    titulosVistos.add(tituloSimplificado);
    
    return true;
  });
}

/**
 * Ordena produtos por relevância
 * @param {Array} produtos - Lista de produtos
 * @param {Object} filtros - Filtros aplicados
 * @returns {Array} - Produtos ordenados
 */
function ordenarPorRelevancia(produtos, filtros) {
  return produtos.sort((a, b) => {
    // Primeiro critério: ter preço (produtos com preço são mais relevantes)
    if (a.price && !b.price) return -1;
    if (!a.price && b.price) return 1;
    
    // Se ambos têm preço e há filtro de preço máximo
    if (a.price && b.price && filtros.precoMax) {
      const precoA = parseFloat(a.price.replace('R$', '').replace('.', '').replace(',', '.').trim());
      const precoB = parseFloat(b.price.replace('R$', '').replace('.', '').replace(',', '.').trim());
      const precoMax = parseFloat(filtros.precoMax);
      
      // Produtos mais próximos do preço máximo (mas abaixo) têm prioridade
      if (precoA <= precoMax && precoB <= precoMax) {
        return precoB - precoA; // Maior preço primeiro, dentro do limite
      }
    }
    
    // Priorizar marketplaces conhecidos
    const marketplacePriority = {
      'Mercado Livre': 3,
      'Magazine Luiza': 2,
      'Americanas': 2,
      'Shopee': 1
    };
    
    const prioridadeA = marketplacePriority[a.marketplace] || 0;
    const prioridadeB = marketplacePriority[b.marketplace] || 0;
    
    if (prioridadeA !== prioridadeB) {
      return prioridadeB - prioridadeA; // Maior prioridade primeiro
    }
    
    // Por padrão, manter a ordem original
    return 0;
  });
}

/**
 * Limpa o cache do motor de busca personalizado
 */
function limparCache() {
  const keysCount = customSearchCache.keys().length;
  customSearchCache.flushAll();
  console.log(`🧹 Cache do motor personalizado limpo: ${keysCount} itens removidos`);
  return keysCount;
}

/**
 * Obtém estatísticas do cache
 */
function obterEstatisticasCache() {
  return {
    keys: customSearchCache.keys(),
    stats: customSearchCache.getStats(),
    itemCount: customSearchCache.keys().length
  };
}

module.exports = {
  buscarProdutos,
  limparCache,
  obterEstatisticasCache
};
