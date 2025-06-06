// Serviço de integração real com AliExpress (exemplo via RapidAPI)
const axios = require('axios');
const https = require('https');
require('dotenv').config();

// Configuração para ignorar problemas de certificado SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const PLACEHOLDER_IMG = '/images/placeholder.jpg';

exports.buscarProdutosAliExpress = async (filtros) => {
  // Detailed logging for configuration check
  console.log('🛒 AliExpress Service - Verificando configuração...');
  console.log(`USE_REAL_ALIEXPRESS_API: ${process.env.USE_REAL_ALIEXPRESS_API}`);
  console.log(`RAPIDAPI_KEY presente: ${!!process.env.RAPIDAPI_KEY}`);
  
  // Verificar se deve usar API real
  const useRealAPI = process.env.USE_REAL_ALIEXPRESS_API === 'true';
  
  if (useRealAPI && process.env.RAPIDAPI_KEY) {
    console.log('✅ AliExpress: Usando API REAL (aliexpress-datahub.p.rapidapi.com)');
  } else {
    console.log('🔧 AliExpress: Usando dados mock (configuração ou chave API faltando)');
  }
  console.log('Filtros recebidos:', filtros);

  if (useRealAPI) {
    try {
      // Implementação real da API AliExpress via RapidAPI
      const response = await axios.get('https://aliexpress-datahub.p.rapidapi.com/item_search', {
        params: {
          q: filtros.categoria || filtros.query || 'baby gift',
          page: 1
        },
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'aliexpress-datahub.p.rapidapi.com'
        },
        httpsAgent,
        timeout: 10000
      });

      console.log('✅ ALIEXPRESS: API real funcionando!', response.data?.result?.resultList?.length || 0, 'produtos encontrados');
      
      if (response.data && response.data.result && response.data.result.resultList) {
        return response.data.result.resultList.map(item => ({
          id: `aliexpress_${item.item.itemId || Math.random()}`,
          nome: item.item.title || 'Produto AliExpress',
          preco: parseFloat(item.item.price.minPrice) || 0,
          imagem: item.item.image || PLACEHOLDER_IMG,
          url: item.item.itemUrl || `https://pt.aliexpress.com/item/${item.item.itemId}.html`,
          marketplace: 'AliExpress',
          genero: 'unisex',
          idadeMin: 0,
          idadeMax: 12
        }));
      }
    } catch (error) {
      console.error('❌ ALIEXPRESS: Erro na API real:', error.message);
      console.log('🔄 ALIEXPRESS: Retornando para dados mock...');
    }
  }
  const produtosMock = [
    {
      id: '1005004123456789',
      nome: 'Mordedor de Silicone Unissex',
      preco: 45.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://pt.aliexpress.com/item/1005004123456789.html',
      marketplace: 'AliExpress',
      genero: 'unisex',
      idadeMin: 0,
      idadeMax: 2
    },
    {
      id: '1005003987654321',
      nome: 'Body Bebê Menino Algodão',
      preco: 59.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://pt.aliexpress.com/item/1005003987654321.html',
      marketplace: 'AliExpress',
      genero: 'masculino',
      idadeMin: 0,
      idadeMax: 2
    },
    {
      id: '1005002555666777',
      nome: 'Kit Higiene Bebê Azul',
      preco: 89.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://pt.aliexpress.com/item/1005002555666777.html',
      marketplace: 'AliExpress',
      genero: 'masculino',
      idadeMin: 0,
      idadeMax: 2
    },
    {
      id: '1005001888999000',
      nome: 'Carregador Sem Fio 15W Qi Fast Charge',
      preco: 129.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://pt.aliexpress.com/item/1005001888999000.html',
      marketplace: 'AliExpress',
      genero: 'unisex',
      idadeMin: 18,
      idadeMax: 120
    },
    {
      id: '1005000111222333',
      nome: 'Capa Protetora Para iPhone Universal',
      preco: 19.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://pt.aliexpress.com/item/1005000111222333.html',
      marketplace: 'AliExpress',
      genero: 'unisex',
      idadeMin: 14,
      idadeMax: 120
    }
  ];
  // Se todos os filtros estiverem vazios, retorna array vazio
  const filtrosVazios = (
    (!filtros.precoMin || filtros.precoMin === '') &&
    (!filtros.precoMax || filtros.precoMax === '') &&
    (!filtros.genero || filtros.genero === '' || filtros.genero.toLowerCase() === 'nao informado') &&
    (!filtros.idade || filtros.idade === '')
  );
  if (filtrosVazios) {
    return [];
  }
  // Filtro integrado preço, gênero e idade (faixa etária)
  let produtosFiltrados = produtosMock;
  if (filtros.precoMin || filtros.precoMax) {
    const precoMinimo = filtros.precoMin ? parseFloat(filtros.precoMin) : 0;
    const precoMaximo = filtros.precoMax ? parseFloat(filtros.precoMax) : Infinity;
    produtosFiltrados = produtosFiltrados.filter(produto => produto.preco >= precoMinimo && produto.preco <= precoMaximo);
  }
  if (filtros.genero && filtros.genero.toLowerCase() !== 'nao informado' && filtros.genero !== '') {
    const genero = filtros.genero.toLowerCase();
    produtosFiltrados = produtosFiltrados.filter(p => {
      const produtoGenero = p.genero.toLowerCase();
      return produtoGenero === 'unisex' || produtoGenero === genero;
    });
  }
  if (filtros.idade && filtros.idade !== '') {
    const idade = parseInt(filtros.idade);
    produtosFiltrados = produtosFiltrados.filter(p => {
      const min = p.idadeMin || 0;
      const max = p.idadeMax !== undefined ? p.idadeMax : 120;
      return idade >= min && idade <= max;
    });
  }
  // Retornar até 30 produtos para busca mais abrangente
  return produtosFiltrados.slice(0, 30);
};

/**
 * Busca detalhes de um produto específico do AliExpress usando a API Real
 * @param {string} itemId - ID do produto no AliExpress
 * @returns {Promise<Object>} Detalhes do produto
 */
exports.buscarDetalheProdutoAliExpress = async (itemId) => {
  try {
    if (!process.env.RAPIDAPI_KEY_NEW) {
      throw new Error('RAPIDAPI_KEY_NEW não configurada');
    }

    const requestConfig = {
      method: 'GET',
      url: 'https://aliexpress-datahub.p.rapidapi.com/item_detail_2',
      params: {
        itemId: itemId
      },
      headers: {
        'x-rapidapi-host': 'aliexpress-datahub.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY_NEW
      },
      timeout: 10000,
      httpsAgent
    };

    console.log(`🔍 Buscando detalhes do produto AliExpress: ${itemId}`);
    const response = await axios(requestConfig);

    if (response.data && response.data.result) {
      const produto = response.data.result;
      console.log(`✅ Detalhes encontrados: ${produto.subject}`);
      
      return {
        sucesso: true,
        fonte: 'AliExpress DataHub API',
        produto: {
          id: produto.productId,
          nome: produto.subject,
          preco: produto.salePrice,
          precoOriginal: produto.originalPrice,
          desconto: produto.discount,
          imagens: produto.imagePathList || [],
          imagemPrincipal: produto.imageUrl,
          url: produto.productDetailUrl,
          vendedor: produto.storeName,
          avaliacoes: produto.totalAvaliationCount,
          rating: produto.averageStar,
          categoria: produto.categoryName,
          marketplace: 'AliExpress',
          especificacoes: produto.skuPropertyList || [],
          descricao: produto.description
        },
        timestamp: new Date().toISOString()
      };
    } else {
      throw new Error('Produto não encontrado');
    }

  } catch (error) {
    console.error('❌ Erro ao buscar detalhes AliExpress:', error.message);
    
    return {
      sucesso: false,
      fonte: 'AliExpress DataHub API',
      erro: error.message,
      itemId: itemId,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Busca produtos do AliExpress usando a nova API (em desenvolvimento)
 * @param {Object} filtros - Filtros da busca
 * @returns {Promise<Array>} Lista de produtos
 */
exports.buscarProdutosAliExpressReal = async (filtros) => {
  try {
    if (!process.env.RAPIDAPI_KEY_NEW) {
      throw new Error('RAPIDAPI_KEY_NEW não configurada');
    }
    const { precoMin, precoMax, genero } = filtros;
    const keyword = genero || 'presente';
    const requestConfig = {
      method: 'GET',
      url: 'https://aliexpress-datahub.p.rapidapi.com/item_search',
      params: {
        query: keyword,
        page: 1,
        size: 30
      },
      headers: {
        'x-rapidapi-host': 'aliexpress-datahub.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY_NEW
      },
      timeout: 10000,
      httpsAgent
    };
    const response = await axios(requestConfig);
    let produtos = response.data.result?.products || [];
    // Adapta para o formato padrão
    produtos = produtos.map(p => ({
      id: p.productId,
      nome: p.subject,
      preco: p.salePrice,
      imagem: p.imageUrl,
      url: p.productDetailUrl,
      marketplace: 'AliExpress',
      genero: genero || 'unisex',
      idadeMin: 0,
      idadeMax: 120
    }));
    if (precoMin) produtos = produtos.filter(p => p.preco >= precoMin);
    if (precoMax) produtos = produtos.filter(p => p.preco <= precoMax);
    return produtos;
  } catch (error) {
    console.error('❌ Erro na busca AliExpress Real:', error.message);
    return [];
  }
};

/**
 * Testa a API de detalhes do AliExpress
 * @returns {Promise<Object>} Resultado do teste
 */
exports.testarAPIAliExpress = async () => {
  console.log('🧪 Testando API AliExpress...');
  
  // Usar um ID de produto real para teste
  const itemIdTeste = '1005005244562338';
  const resultado = await exports.buscarDetalheProdutoAliExpress(itemIdTeste);

  return {
    ...resultado,
    configuracao: {
      rapidapi_key_configurada: !!process.env.RAPIDAPI_KEY_NEW,
      use_aliexpress_datahub_api: process.env.USE_ALIEXPRESS_DATAHUB_API === 'true'
    }
  };
};

exports.buscarProdutos = async (filtros) => {
  // Sempre tenta usar a API real se a chave estiver configurada
  if (process.env.USE_REAL_ALIEXPRESS_API === 'true' && process.env.RAPIDAPI_KEY_NEW) {
    return await exports.buscarProdutosAliExpressReal(filtros);
  }
  return await exports.buscarProdutosAliExpress(filtros);
};
