/**
 * Testes integrados da versão otimizada do motor de busca
 * Este script testa a implementação completa com funções de scraping
 */

require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

// Cache para armazenar resultados de busca
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Configurações padrão
const defaultUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

/**
 * Função principal de busca
 */
async function buscarProdutos(filtros) {
  console.log(`🔍 Iniciando busca otimizada com filtros:`, filtros);
  
  // Verificar cache
  const cacheKey = `search_${JSON.stringify(filtros)}`;
  const cachedResults = cache.get(cacheKey);
  
  if (cachedResults) {
    console.log('🔄 Usando resultados em cache');
    return cachedResults;
  }
  
  // Definir marketplace para buscar
  const marketplace = filtros.marketplace || 'mercadolivre';
  
  // Buscar produtos
  let produtos = [];
  
  try {
    switch (marketplace) {
      case 'mercadolivre':
        produtos = await buscarNoMercadoLivre(filtros);
        break;
      case 'shopee':
        produtos = await buscarNaShopee(filtros);
        break;
      case 'simulado':
        produtos = gerarProdutosSimulados(filtros);
        break;
      default:
        produtos = await buscarNoMercadoLivre(filtros);
    }
    
    // Filtrar por preço
    produtos = produtos.filter(p => {
      const preco = extrairPreco(p.price);
      return !isNaN(preco) && 
             (!filtros.precoMin || preco >= filtros.precoMin) && 
             (!filtros.precoMax || preco <= filtros.precoMax);
    });
    
    // Remover duplicados
    const unicos = [];
    const urls = new Set();
    
    for (const produto of produtos) {
      if (!urls.has(produto.link)) {
        urls.add(produto.link);
        unicos.push(produto);
      }
    }
    
    // Limitar quantidade
    const resultado = unicos.slice(0, filtros.num || 10);
    
    // Salvar no cache
    cache.set(cacheKey, resultado);
    
    return resultado;
  } catch (error) {
    console.error('❌ Erro na busca:', error);
    return gerarProdutosSimulados(filtros);
  }
}

/**
 * Busca no Mercado Livre
 */
async function buscarNoMercadoLivre(filtros) {
  try {
    // Construir URL
    const query = encodeURIComponent(filtros.query.replace(/\s+/g, '-'));
    let url = `https://lista.mercadolivre.com.br/${query}`;
    
    if (filtros.precoMax) {
      url += `_PriceRange_0-${filtros.precoMax}`;
    }
    
    console.log(`🔍 Buscando no Mercado Livre: ${url}`);
    
    // Fazer requisição
    const response = await axios.get(url, {
      headers: {
        'User-Agent': defaultUserAgent
      }
    });
    
    // Extrair produtos
    const $ = cheerio.load(response.data);
    const produtos = [];
    
    $('.ui-search-result__wrapper').each((i, el) => {
      try {
        const title = $(el).find('.ui-search-item__title').text().trim();
        const link = $(el).find('.ui-search-link').attr('href');
        const priceText = $(el).find('.price-tag-amount').text().trim();
        const image = $(el).find('.ui-search-result-image__element').attr('src') || 
                    $(el).find('.slick-slide img').attr('src');
        
        if (title && link) {
          produtos.push({
            title,
            price: priceText,
            link,
            image,
            marketplace: 'Mercado Livre'
          });
        }
      } catch (e) {
        // Ignorar erros de produto individual
      }
    });
    
    console.log(`✅ Mercado Livre: ${produtos.length} produtos encontrados`);
    return produtos;
  } catch (error) {
    console.error('❌ Erro ao buscar no Mercado Livre:', error.message);
    return [];
  }
}

/**
 * Busca na Shopee (simulada)
 */
async function buscarNaShopee(filtros) {
  return gerarProdutosSimulados(filtros, 'Shopee');
}

/**
 * Extrai valor numérico do preço
 */
function extrairPreco(texto) {
  if (!texto) return NaN;
  
  // Remover símbolos e converter para float
  const precoLimpo = texto
    .replace(/[^\d,.]/g, '')
    .replace('.', '')
    .replace(',', '.');
  
  return parseFloat(precoLimpo);
}

/**
 * Gera produtos simulados para testes
 */
function gerarProdutosSimulados(filtros, marketplace = 'Loja Simulada') {
  const produtos = [];
  const precoMax = filtros.precoMax || 1000;
  const quantidade = Math.min(filtros.num || 5, 10);
  
  for (let i = 1; i <= quantidade; i++) {
    // Gerar preço dentro do limite
    const preco = Math.floor(Math.random() * (precoMax * 0.9)) + (precoMax * 0.1);
    
    produtos.push({
      title: `${filtros.query} - Produto ${i}`,
      price: `R$ ${preco.toFixed(2)}`,
      link: `https://produto-simulado.com/${Math.floor(Math.random() * 999999)}`,
      image: `https://via.placeholder.com/150?text=${encodeURIComponent(filtros.query)}`,
      marketplace
    });
  }
  
  return produtos;
}

/**
 * Função principal de teste
 */
async function testarBusca() {
  console.log('🧪 TESTE DO MOTOR DE BUSCA OTIMIZADO');
  console.log('===================================');
  
  // Testar diferentes produtos
  const testes = [
    {
      nome: "Fones de ouvido",
      filtros: {
        query: "fone de ouvido sem fio",
        precoMax: 200,
        num: 3
      }
    },
    {
      nome: "Smartphones",
      filtros: {
        query: "smartphone",
        precoMax: 1500,
        num: 3
      }
    },
    {
      nome: "Produtos simulados",
      filtros: {
        query: "produto teste",
        precoMax: 500,
        marketplace: "simulado",
        num: 3
      }
    }
  ];
  
  // Executar cada teste
  for (const teste of testes) {
    console.log(`\n\n🔍 TESTANDO: ${teste.nome}`);
    console.log(`Query: "${teste.filtros.query}" | Preço máximo: R$${teste.filtros.precoMax}`);
    console.log('----------------------------------------');
    
    try {
      const resultados = await buscarProdutos(teste.filtros);
      
      console.log(`\n✅ Encontrados: ${resultados.length} produtos`);
      
      if (resultados.length > 0) {
        resultados.forEach((produto, idx) => {
          console.log(`\n📌 PRODUTO ${idx + 1}:`);
          console.log(`Título: ${produto.title}`);
          console.log(`Preço: ${produto.price || 'Não disponível'}`);
          console.log(`Marketplace: ${produto.marketplace}`);
          console.log(`Link: ${produto.link}`);
        });
      } else {
        console.log('❌ Nenhum produto encontrado');
      }
    } catch (error) {
      console.error(`❌ ERRO AO TESTAR "${teste.nome}":`, error);
    }
  }
  
  console.log('\n\n✅ TODOS OS TESTES CONCLUÍDOS!');
}

// Executar testes
testarBusca()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('💥 ERRO CRÍTICO:', err);
    process.exit(1);
  });
