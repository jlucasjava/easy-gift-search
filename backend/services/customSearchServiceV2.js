/**
 * Motor de busca personalizado v2 para Easy Gift Search
 * Versão aprimorada com múltiplas estratégias de scraping, proxy rotation e anti-bloqueio
 */

const axios = require('axios');
const cheerio = require('cheerio');
const axiosRetryModule = require('axios-retry');
const NodeCache = require('node-cache');
const { v4: uuidv4 } = require('uuid');

// Importar funções de scraping
const { 
  buscarNaKabum,
  buscarNaMagazineLuiza, 
  buscarNaAmericanas,
  buscarNaShopee,
  buscarNaCasasBahia
} = require('./scrapingFunctions');

// Configurar cache com tempo de vida mais longo para resultados mais estáveis
const customSearchCache = new NodeCache({ stdTTL: 7200, checkperiod: 600 });

// Configurar retry para requisições com backoff exponencial
const axiosRetry = axiosRetryModule.default || axiosRetryModule;
axiosRetry(axios, { 
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           error.response?.status === 429 || 
           error.response?.status === 403;
  }
});

// Pool de User-Agents para rotação
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
];

// Obter um User-Agent aleatório
function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Headers base para requisições
function getHeaders() {
  return {
    'User-Agent': getRandomUserAgent(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1'
  };
}

// Lista expandida de marketplaces brasileiros
const MARKETPLACES = {
  mercadolivre: {
    nome: 'Mercado Livre',
    dominio: 'mercadolivre.com.br',
    prioridade: 5,
    confiabilidade: 0.9
  },
  americanas: {
    nome: 'Americanas',
    dominio: 'americanas.com.br',
    prioridade: 4,
    confiabilidade: 0.85
  },
  magazineluiza: {
    nome: 'Magazine Luiza',
    dominio: 'magazineluiza.com.br',
    prioridade: 4,
    confiabilidade: 0.85
  },
  shopee: {
    nome: 'Shopee',
    dominio: 'shopee.com.br',
    prioridade: 3,
    confiabilidade: 0.8
  },
  amazon: {
    nome: 'Amazon',
    dominio: 'amazon.com.br',
    prioridade: 4,
    confiabilidade: 0.85
  },
  casasbahia: {
    nome: 'Casas Bahia',
    dominio: 'casasbahia.com.br',
    prioridade: 3,
    confiabilidade: 0.8
  },
  pontofrio: {
    nome: 'Ponto Frio',
    dominio: 'pontofrio.com.br',
    prioridade: 3,
    confiabilidade: 0.8
  },
  aliexpress: {
    nome: 'AliExpress',
    dominio: 'aliexpress.com',
    prioridade: 2,
    confiabilidade: 0.7
  },
  extra: {
    nome: 'Extra',
    dominio: 'extra.com.br',
    prioridade: 3,
    confiabilidade: 0.8
  },
  kabum: {
    nome: 'KaBuM',
    dominio: 'kabum.com.br',
    prioridade: 3,
    confiabilidade: 0.8
  }
};

/**
 * Busca produtos em múltiplas fontes e combina os resultados
 * @param {Object} filtros - Filtros de busca (preço, categoria, etc)
 * @returns {Promise<Array>} - Lista de produtos encontrados
 */
async function buscarProdutos(filtros) {
  console.log('🔍 Iniciando busca personalizada v2 com filtros:', filtros);
  
  // Gerar ID único para esta busca (para logging)
  const buscaId = uuidv4().substring(0, 8);
  console.log(`🔑 ID da busca: ${buscaId}`);
  
  // Verificar cache
  const cacheKey = `custom_search_v2_${JSON.stringify(filtros)}`;
  const cachedResults = customSearchCache.get(cacheKey);
  
  if (cachedResults) {
    console.log(`🔄 [${buscaId}] Utilizando resultados em cache (${cachedResults.length} produtos)`);
    return cachedResults;
  }
  
  try {
    // Normalizar e validar filtros
    const filtrosNormalizados = normalizarFiltros(filtros);
    
    // Construir termos de busca otimizados
    const termoBusca = construirTermoBusca(filtrosNormalizados);
    console.log(`🔤 [${buscaId}] Termo de busca: "${termoBusca}"`);
    
    // Selecionar fontes apropriadas baseado nos filtros
    const fontes = escolherFontes(filtrosNormalizados);
    console.log(`📋 [${buscaId}] Fontes selecionadas: ${fontes.join(', ')}`);
    
    // Executar estratégias de busca em paralelo
    const resultados = await executarEstrategiasDeBusca(termoBusca, fontes, filtrosNormalizados, buscaId);
    
    // Processar, filtrar e ordenar resultados
    const resultadosProcessados = processarResultados(resultados, filtrosNormalizados, buscaId);
    
    // Salvar no cache
    customSearchCache.set(cacheKey, resultadosProcessados);
    
    return resultadosProcessados;
  } catch (error) {
    console.error(`❌ [${buscaId}] Erro crítico na busca personalizada:`, error);
    
    // Em caso de falha crítica, tentar retornar resultados de fallback
    return gerarResultadosFallback(filtros);
  }
}

/**
 * Normaliza e valida os filtros de entrada
 */
function normalizarFiltros(filtros) {
  return {
    query: filtros.query?.trim() || '',
    categoria: filtros.categoria?.trim() || '',
    precoMin: filtros.precoMin ? Math.max(0, parseInt(filtros.precoMin)) : 0,
    precoMax: filtros.precoMax ? parseInt(filtros.precoMax) : 5000,
    idade: filtros.idade?.trim() || '',
    genero: filtros.genero?.trim() || '',
    num: filtros.num ? Math.min(50, Math.max(1, parseInt(filtros.num))) : 10,
    pagina: filtros.pagina ? Math.max(1, parseInt(filtros.pagina)) : 1
  };
}

/**
 * Constrói um termo de busca otimizado baseado nos filtros
 */
function construirTermoBusca(filtros) {
  // Começar com a query ou categoria principal
  let termo = filtros.query || filtros.categoria || 'presentes';
  
  // Adicionar contexto para presentes se necessário
  if (!filtros.query && !filtros.categoria) {
    termo = 'presentes';
  }
  
  // Otimizar o termo para buscas de produtos
  const palavrasComuns = ['para', 'com', 'e', 'de', 'do', 'da', 'o', 'a', 'os', 'as'];
  let termoLimpo = termo
    .split(' ')
    .filter(palavra => !palavrasComuns.includes(palavra.toLowerCase()) || palavra.length < 3)
    .join(' ');
  
  // Se ficou muito curto, usar o termo original
  if (termoLimpo.length < termo.length / 2) {
    termoLimpo = termo;
  }
  
  // Adicionar contexto de gênero
  if (filtros.genero) {
    if (filtros.genero.toLowerCase() === 'masculino') {
      termoLimpo += ' para homem masculino';
    } else if (filtros.genero.toLowerCase() === 'feminino') {
      termoLimpo += ' para mulher feminino';
    } else {
      termoLimpo += ` para ${filtros.genero}`;
    }
  }
  
  // Adicionar contexto de idade
  if (filtros.idade) {
    if (parseInt(filtros.idade) < 12) {
      termoLimpo += ` infantil ${filtros.idade} anos`;
    } else if (parseInt(filtros.idade) >= 60) {
      termoLimpo += ` sênior idoso ${filtros.idade} anos`;
    } else {
      termoLimpo += ` ${filtros.idade} anos`;
    }
  }
  
  // Adicionar contexto de preço
  if (filtros.precoMax <= 50) {
    termoLimpo += ' barato econômico promoção';
  } else if (filtros.precoMax <= 150) {
    termoLimpo += ' bom custo-benefício promoção';
  } else if (filtros.precoMax >= 500) {
    termoLimpo += ' premium qualidade';
  }
  
  return termoLimpo.trim();
}

/**
 * Escolhe as fontes mais adequadas baseado nos filtros
 */
function escolherFontes(filtros) {
  // Lista completa de fontes disponíveis
  const todasFontes = Object.keys(MARKETPLACES);
  
  // Para preços baixos, priorizar Shopee e Mercado Livre
  if (filtros.precoMax <= 100) {
    return ['shopee', 'mercadolivre', 'magazineluiza', 'americanas'];
  }
  
  // Para eletrônicos, priorizar KaBuM, Amazon e Magazine Luiza
  if (temTermosEletronicos(filtros.query || filtros.categoria || '')) {
    return ['kabum', 'amazon', 'magazineluiza', 'americanas', 'mercadolivre'];
  }
  
  // Para produtos comuns com preço médio
  if (filtros.precoMax <= 300) {
    return ['mercadolivre', 'americanas', 'magazineluiza', 'shopee', 'casasbahia'];
  }
  
  // Para produtos premium
  if (filtros.precoMax >= 500) {
    return ['amazon', 'mercadolivre', 'americanas', 'magazineluiza', 'casasbahia'];
  }
  
  // Por padrão, usar marketplaces principais
  return ['mercadolivre', 'americanas', 'magazineluiza', 'shopee', 'amazon'];
}

/**
 * Verifica se a busca contém termos relacionados a eletrônicos
 */
function temTermosEletronicos(termo) {
  const termosEletronicos = [
    'celular', 'smartphone', 'fone', 'headphone', 'notebook', 'laptop', 
    'computador', 'tablet', 'tv', 'monitor', 'câmera', 'camera', 'console', 
    'playstation', 'xbox', 'nintendo', 'processador', 'gpu', 'ssd', 'hd'
  ];
  
  const termoLower = termo.toLowerCase();
  return termosEletronicos.some(termo => termoLower.includes(termo));
}

/**
 * Executa diferentes estratégias de busca e combina os resultados
 */
async function executarEstrategiasDeBusca(termo, fontes, filtros, buscaId) {
  // Array para armazenar todas as promessas de busca
  const promessasBusca = [];
  
  // 1. Busca direta via scraping para cada marketplace
  fontes.forEach(fonte => {
    promessasBusca.push({
      tipo: 'scraping',
      fonte: fonte,
      promessa: buscarEmFonte(fonte, termo, filtros)
    });
  });
  
  // 2. Busca por APIs públicas (se houver)
  if (fontes.includes('mercadolivre')) {
    promessasBusca.push({
      tipo: 'api',
      fonte: 'mercadolivre_api',
      promessa: buscarNaAPIMercadoLivre(termo, filtros)
    });
  }
  
  // 3. Busca por produtos similares (recomendação)
  const termosRelacionados = gerarTermosRelacionados(termo);
  if (termosRelacionados.length > 0) {
    const fontesPrincipais = fontes.slice(0, 2); // Usar apenas as duas primeiras fontes
    
    termosRelacionados.forEach(termoRelacionado => {
      fontesPrincipais.forEach(fonte => {
        promessasBusca.push({
          tipo: 'relacionado',
          fonte: fonte,
          termo: termoRelacionado,
          promessa: buscarEmFonte(fonte, termoRelacionado, filtros)
        });
      });
    });
  }
  
  // Executar todas as buscas em paralelo
  console.log(`🔍 [${buscaId}] Executando ${promessasBusca.length} estratégias de busca em paralelo...`);
  
  const resultados = await Promise.allSettled(promessasBusca.map(async busca => {
    try {
      const resultado = await busca.promessa;
      return {
        tipo: busca.tipo,
        fonte: busca.fonte,
        termo: busca.termo || termo,
        produtos: resultado || [],
        sucesso: true
      };
    } catch (error) {
      console.error(`❌ [${buscaId}] Erro na estratégia ${busca.tipo} para ${busca.fonte}:`, error.message);
      return {
        tipo: busca.tipo,
        fonte: busca.fonte,
        termo: busca.termo || termo,
        produtos: [],
        sucesso: false,
        erro: error.message
      };
    }
  }));
  
  return resultados
    .filter(r => r.status === 'fulfilled' && r.value.produtos && r.value.produtos.length > 0)
    .map(r => r.value);
}

/**
 * Gera termos relacionados para buscar produtos similares
 */
function gerarTermosRelacionados(termo) {
  const termos = [];
  
  // Remover palavras comuns
  const termoPrincipal = termo.split(' ')
    .filter(palavra => palavra.length > 3)
    .join(' ');
  
  // Se o termo for muito curto, não gerar termos relacionados
  if (termoPrincipal.length < 4) return termos;
  
  // Adicionar sinônimos ou termos relacionados comuns
  if (termo.includes('fone')) {
    termos.push('headset áudio');
  }
  
  if (termo.includes('smartphone') || termo.includes('celular')) {
    termos.push('acessórios para celular');
  }
  
  if (termo.includes('presente')) {
    termos.push('kit presente');
    termos.push('presente criativo');
  }
  
  // Limitar a 2 termos relacionados no máximo
  return termos.slice(0, 2);
}

/**
 * Processa e filtra os resultados de todas as estratégias
 */
function processarResultados(resultados, filtros, buscaId) {
  // Combinar todos os produtos de todas as estratégias
  let todosProdutos = [];
  
  resultados.forEach(resultado => {
    // Adicionar metadados a cada produto
    const produtosComMetadata = resultado.produtos.map(produto => ({
      ...produto,
      estrategia: resultado.tipo,
      termo_busca: resultado.termo,
      confiabilidade: MARKETPLACES[resultado.fonte]?.confiabilidade || 0.5
    }));
    
    todosProdutos = [...todosProdutos, ...produtosComMetadata];
  });
  
  console.log(`📊 [${buscaId}] Total bruto de produtos: ${todosProdutos.length}`);
  
  // Filtrar por preço
  const produtosFiltradosPreco = filtrarPorPreco(todosProdutos, filtros);
  console.log(`💰 [${buscaId}] Após filtro de preço: ${produtosFiltradosPreco.length}/${todosProdutos.length}`);
  
  // Remover duplicados
  const produtosUnicos = removerDuplicados(produtosFiltradosPreco);
  console.log(`🔄 [${buscaId}] Após remoção de duplicados: ${produtosUnicos.length}/${produtosFiltradosPreco.length}`);
  
  // Filtrar produtos sem informações completas
  const produtosCompletos = produtosUnicos.filter(produto => 
    produto.title && 
    produto.link && 
    (produto.price || produto.estrategia === 'relacionado') // permitir produtos relacionados sem preço
  );
  console.log(`🧹 [${buscaId}] Após filtro de completude: ${produtosCompletos.length}/${produtosUnicos.length}`);
  
  // Ordenar por relevância e confiabilidade
  const produtosOrdenados = ordenarPorRelevancia(produtosCompletos, filtros);
  
  // Limitar ao número solicitado
  const produtosFinais = produtosOrdenados.slice(0, filtros.num);
  console.log(`✅ [${buscaId}] Resultados finais: ${produtosFinais.length}`);
  
  return produtosFinais;
}

/**
 * Implementação detalhada da busca em cada fonte
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
      case 'amazon':
        return await buscarNaAmazon(termo, filtros);
      case 'casasbahia':
        return await buscarNaCasasBahia(termo, filtros);
      case 'pontofrio':
        return await buscarNoPontoFrio(termo, filtros);
      case 'kabum':
        return await buscarNaKabum(termo, filtros);
      default:
        throw new Error(`Fonte não implementada: ${fonte}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao buscar na fonte ${fonte}:`, error.message);
    return [];
  }
}

// Implementações de busca para os principais marketplaces
// Estas funções seriam implementadas com métodos específicos de scraping para cada site
// Estou incluindo apenas duas implementações de exemplo

/**
 * Busca produtos no Mercado Livre
 */
async function buscarNoMercadoLivre(termo, filtros) {
  try {
    // Construir URL de busca
    let url = `https://lista.mercadolivre.com.br/${encodeURIComponent(termo.replace(/ /g, '-'))}`;
    
    // Adicionar filtros de preço à URL se disponíveis
    if (filtros.precoMax) {
      url += `_PriceRange_0-${filtros.precoMax}`;
    }
    
    console.log(`🔍 Buscando no Mercado Livre: ${url}`);
    
    // Fazer requisição com headers aleatórios
    const response = await axios.get(url, { 
      headers: getHeaders(), 
      timeout: 15000
    });
    
    // Extrair informações com Cheerio
    const $ = cheerio.load(response.data);
    const produtos = [];
    
    // Seletor para itens de produto
    $('.ui-search-result__wrapper').each((i, el) => {
      try {
        // Extrair informações básicas
        const titulo = $(el).find('.ui-search-item__title').text().trim();
        const link = $(el).find('a.ui-search-link').attr('href')?.split('?')[0]; // Remover parâmetros
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
        
        // Extrair avaliações se disponíveis
        const avaliacaoElemento = $(el).find('.ui-search-reviews__rating-average');
        let avaliacao = null;
        if (avaliacaoElemento.length) {
          avaliacao = parseFloat(avaliacaoElemento.text().trim().replace(',', '.'));
        }
        
        // Adicionar à lista se tiver pelo menos título e link
        if (titulo && link) {
          produtos.push({
            title: titulo,
            link: link,
            price: preco,
            image: imagem,
            rating: avaliacao,
            marketplace: 'Mercado Livre',
            source: 'Custom Search V2'
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
 * Busca produtos na Amazon
 */
async function buscarNaAmazon(termo, filtros) {
  try {
    // Construir URL de busca
    let url = `https://www.amazon.com.br/s?k=${encodeURIComponent(termo)}`;
    
    // Adicionar filtros de preço à URL se disponíveis
    if (filtros.precoMin && filtros.precoMax) {
      url += `&rh=p_36%3A${filtros.precoMin}00-${filtros.precoMax}00`;
    } else if (filtros.precoMax) {
      url += `&rh=p_36%3A-${filtros.precoMax}00`;
    }
    
    console.log(`🔍 Buscando na Amazon: ${url}`);
    
    // Fazer requisição com headers aleatórios e maior timeout
    const response = await axios.get(url, { 
      headers: {
        ...getHeaders(),
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.amazon.com.br/'
      }, 
      timeout: 20000 
    });
    
    // Extrair informações com Cheerio
    const $ = cheerio.load(response.data);
    const produtos = [];
    
    // Seletor para itens de produto na Amazon
    $('div[data-component-type="s-search-result"]').each((i, el) => {
      try {
        // Extrair informações básicas
        const titulo = $(el).find('h2 .a-link-normal').text().trim();
        const linkRelativo = $(el).find('h2 .a-link-normal').attr('href');
        const link = linkRelativo ? `https://www.amazon.com.br${linkRelativo.split('?')[0]}` : null;
        
        // Extrair preço (a Amazon tem várias estruturas possíveis)
        let preco = null;
        const precoElemento = $(el).find('.a-price .a-offscreen').first();
        if (precoElemento.length) {
          preco = precoElemento.text().trim();
        }
        
        // Extrair URL da imagem
        const imagem = $(el).find('img.s-image').attr('src');
        
        // Extrair avaliações
        const avaliacaoElemento = $(el).find('i.a-icon-star-small');
        let avaliacao = null;
        if (avaliacaoElemento.length) {
          const avaliacaoTexto = avaliacaoElemento.text().trim();
          const avaliacaoMatch = avaliacaoTexto.match(/(\d+[,.]?\d*)/);
          if (avaliacaoMatch && avaliacaoMatch[1]) {
            avaliacao = parseFloat(avaliacaoMatch[1].replace(',', '.'));
          }
        }
        
        // Adicionar à lista se tiver pelo menos título e link
        if (titulo && link) {
          produtos.push({
            title: titulo,
            link: link,
            price: preco,
            image: imagem,
            rating: avaliacao,
            marketplace: 'Amazon',
            source: 'Custom Search V2'
          });
        }
      } catch (err) {
        console.error('Erro ao processar item da Amazon:', err.message);
      }
    });
    
    console.log(`✅ Amazon: Encontrados ${produtos.length} produtos`);
    return produtos;
  } catch (error) {
    console.error('❌ Erro ao buscar na Amazon:', error.message);
    return [];
  }
}

/**
 * Busca na API pública do Mercado Livre (se estiver disponível)
 */
async function buscarNaAPIMercadoLivre(termo, filtros) {
  try {
    // API pública do Mercado Livre
    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(termo)}`;
    
    // Adicionar parâmetros de preço se disponíveis
    const params = new URLSearchParams();
    if (filtros.precoMin) params.append('price_min', filtros.precoMin);
    if (filtros.precoMax) params.append('price_max', filtros.precoMax);
    params.append('limit', 20);
    
    const urlCompleta = `${url}&${params.toString()}`;
    console.log(`🔍 Buscando na API do Mercado Livre: ${urlCompleta}`);
    
    const response = await axios.get(urlCompleta, { timeout: 10000 });
    
    if (!response.data || !response.data.results) {
      return [];
    }
    
    // Processar resultados da API
    const produtos = response.data.results.map(item => ({
      title: item.title,
      link: item.permalink,
      price: `R$ ${item.price.toFixed(2)}`,
      image: item.thumbnail,
      rating: item.reviews?.rating?.average || null,
      marketplace: 'Mercado Livre',
      source: 'ML API'
    }));
    
    console.log(`✅ API Mercado Livre: Encontrados ${produtos.length} produtos`);
    return produtos;
  } catch (error) {
    console.error('❌ Erro ao buscar na API do Mercado Livre:', error.message);
    return [];
  }
}

/**
 * Filtra produtos por faixa de preço de maneira mais inteligente
 */
function filtrarPorPreco(produtos, filtros) {
  if (!produtos || !produtos.length) return [];
  if (!filtros.precoMin && !filtros.precoMax) return produtos;
  
  const precoMin = filtros.precoMin || 0;
  const precoMax = filtros.precoMax || Infinity;
  
  // Permitir uma margem de erro de 10% acima do preço máximo para produtos de alta relevância
  const margemErro = filtros.precoMax ? filtros.precoMax * 0.1 : 0;
  
  return produtos.filter(produto => {
    // Se não tiver preço, analisar com base na estratégia
    if (!produto.price) {
      // Permitir produtos sem preço apenas se forem de alta confiabilidade
      return produto.confiabilidade >= 0.8 || produto.estrategia === 'relacionado';
    }
    
    // Extrair valor numérico do preço
    const precoTexto = produto.price.replace('R$', '').replace('.', '').replace(',', '.').trim();
    const precoNum = parseFloat(precoTexto);
    
    // Se não conseguir extrair o preço
    if (isNaN(precoNum)) return false;
    
    // Aplicar margem de erro para produtos de alta confiabilidade
    const limiteMaximo = produto.confiabilidade >= 0.8 ? 
      precoMax + margemErro : precoMax;
    
    // Verificar se está dentro da faixa
    return precoNum >= precoMin && precoNum <= limiteMaximo;
  });
}

/**
 * Remove produtos duplicados de forma mais inteligente
 */
function removerDuplicados(produtos) {
  if (!produtos || produtos.length === 0) return [];
  
  // Usar Map para URLs únicas, priorizando produtos com mais informações
  const urlMap = new Map();
  const tituloSimplificadoMap = new Map();
  
  produtos.forEach(produto => {
    const url = produto.link;
    
    // Verificar se a URL já existe
    if (url && urlMap.has(url)) {
      const produtoExistente = urlMap.get(url);
      
      // Substituir apenas se o produto atual tiver mais informações
      if (
        (produto.price && !produtoExistente.price) || 
        (produto.image && !produtoExistente.image) ||
        (produto.rating && !produtoExistente.rating) ||
        (produto.confiabilidade > produtoExistente.confiabilidade)
      ) {
        urlMap.set(url, produto);
      }
    } 
    else if (url) {
      urlMap.set(url, produto);
    }
    
    // Verificar similaridade no título também
    if (produto.title) {
      const tituloSimplificado = simplificarTitulo(produto.title);
      
      if (tituloSimplificadoMap.has(tituloSimplificado)) {
        const produtoExistente = tituloSimplificadoMap.get(tituloSimplificado);
        
        // Se já existe produto com título similar, manter o que tiver mais informações
        // ou maior confiabilidade
        if (
          (produto.price && !produtoExistente.price) || 
          (produto.image && !produtoExistente.image) ||
          (produto.rating && !produtoExistente.rating) ||
          (produto.confiabilidade > produtoExistente.confiabilidade)
        ) {
          // Apenas substitui se não for da mesma URL (URL já tratada acima)
          if (!urlMap.has(produto.link)) {
            tituloSimplificadoMap.set(tituloSimplificado, produto);
          }
        }
      } else {
        tituloSimplificadoMap.set(tituloSimplificado, produto);
      }
    }
  });
  
  // Combinar resultados das duas estratégias
  const resultado = [...new Set([...urlMap.values(), ...tituloSimplificadoMap.values()])];
  
  return resultado;
}

/**
 * Simplifica um título para detecção de duplicatas
 */
function simplificarTitulo(titulo) {
  return titulo
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/\s+/g, '')
    .substring(0, 40);
}

/**
 * Ordena produtos por relevância considerando vários fatores
 */
function ordenarPorRelevancia(produtos, filtros) {
  return produtos.sort((a, b) => {
    // Pontuação base de relevância
    let pontuacaoA = a.confiabilidade || 0.5;
    let pontuacaoB = b.confiabilidade || 0.5;
    
    // Primeiro critério: ter preço (produtos com preço são mais relevantes)
    if (a.price && !b.price) pontuacaoA += 0.5;
    if (!a.price && b.price) pontuacaoB += 0.5;
    
    // Bonificar produtos com imagens
    if (a.image && !b.image) pontuacaoA += 0.3;
    if (!a.image && b.image) pontuacaoB += 0.3;
    
    // Bonificar produtos com avaliações
    if (a.rating && !b.rating) pontuacaoA += 0.2;
    if (!a.rating && b.rating) pontuacaoB += 0.2;
    
    // Se ambos têm preço e há filtro de preço máximo
    if (a.price && b.price && filtros.precoMax) {
      const precoA = parseFloat(a.price.replace('R$', '').replace('.', '').replace(',', '.').trim());
      const precoB = parseFloat(b.price.replace('R$', '').replace('.', '').replace(',', '.').trim());
      const precoMax = parseFloat(filtros.precoMax);
      
      // Produtos mais próximos do preço máximo (mas abaixo) têm prioridade
      if (!isNaN(precoA) && !isNaN(precoB) && precoA <= precoMax && precoB <= precoMax) {
        // Quanto mais próximo do preço máximo, maior a pontuação
        pontuacaoA += (precoA / precoMax) * 0.5;
        pontuacaoB += (precoB / precoMax) * 0.5;
      }
    }
    
    // Priorizar produtos da busca direta sobre produtos relacionados
    if (a.estrategia === 'scraping' && b.estrategia === 'relacionado') pontuacaoA += 0.4;
    if (a.estrategia === 'relacionado' && b.estrategia === 'scraping') pontuacaoB += 0.4;
    
    // Priorizar produtos da API (geralmente mais precisos) sobre scraping
    if (a.estrategia === 'api' && b.estrategia === 'scraping') pontuacaoA += 0.2;
    if (a.estrategia === 'scraping' && b.estrategia === 'api') pontuacaoB += 0.2;
    
    // Retornar comparação de pontuação
    return pontuacaoB - pontuacaoA;
  });
}

/**
 * Gera resultados de fallback para casos de falha
 */
function gerarResultadosFallback(filtros) {
  console.log('⚠️ Gerando resultados de fallback devido a falhas nas estratégias principais');
  
  // Usar cache para produtos similares se disponível
  const cacheKeys = customSearchCache.keys();
  
  // Procurar uma chave de cache que tenha filtros similares
  for (const key of cacheKeys) {
    if (key.includes('custom_search_v2_')) {
      try {
        const cachedFilters = JSON.parse(key.replace('custom_search_v2_', ''));
        
        // Verificar se os filtros são similares (mesma categoria/query, preço similar)
        const similarQuery = 
          (cachedFilters.query && filtros.query && cachedFilters.query.includes(filtros.query)) ||
          (cachedFilters.categoria && filtros.categoria && cachedFilters.categoria.includes(filtros.categoria));
          
        const similarPreco = 
          (!filtros.precoMax || !cachedFilters.precoMax || 
           (Math.abs(cachedFilters.precoMax - filtros.precoMax) < filtros.precoMax * 0.3));
           
        if (similarQuery && similarPreco) {
          const cachedResults = customSearchCache.get(key);
          if
