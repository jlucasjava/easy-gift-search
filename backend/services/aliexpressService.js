// Serviço de integração real com AliExpress (exemplo via RapidAPI)
const axios = require('axios');
const https = require('https');
require('dotenv').config();

// Configuração para ignorar problemas de certificado SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

exports.buscarProdutosAliExpress = async (filtros) => {
  // MODO DEMO: retorna produtos mock com links reais para demonstração
  console.log('🔧 MODO DEMO: Retornando produtos mock do AliExpress');
  console.log('Filtros recebidos:', filtros);
  
  const produtosMock = [
    {
      id: '1005004123456789',
      nome: 'Fone de Ouvido Sem Fio i12 TWS Bluetooth',
      preco: 45.90,
      imagem: 'https://ae01.alicdn.com/kf/S12345678901234567890123456789012.jpg',
      url: 'https://pt.aliexpress.com/item/1005004123456789.html',
      marketplace: 'AliExpress'
    },
    {
      id: '1005003987654321',
      nome: 'Smartwatch DT100 Pro Max Serie 8',
      preco: 78.90,
      imagem: 'https://ae01.alicdn.com/kf/S98765432109876543210987654321098.jpg',
      url: 'https://pt.aliexpress.com/item/1005003987654321.html',
      marketplace: 'AliExpress'
    },
    {
      id: '1005002555666777',
      nome: 'Kit Ferramentas Celular 115 em 1',
      preco: 89.90,
      imagem: 'https://ae01.alicdn.com/kf/S55566677788899900011122233344455.jpg',
      url: 'https://pt.aliexpress.com/item/1005002555666777.html',
      marketplace: 'AliExpress'
    },
    {
      id: '1005001888999000',
      nome: 'Carregador Sem Fio 15W Qi Fast Charge',
      preco: 129.90,
      imagem: 'https://ae01.alicdn.com/kf/S88899900011122233344455566677788.jpg',
      url: 'https://pt.aliexpress.com/item/1005001888999000.html',
      marketplace: 'AliExpress'
    },
    {
      id: '1005000111222333',
      nome: 'Capa Protetora Para iPhone Universal',
      preco: 19.90,
      imagem: 'https://ae01.alicdn.com/kf/S11122233344455566677788899900011.jpg',
      url: 'https://pt.aliexpress.com/item/1005000111222333.html',
      marketplace: 'AliExpress'
    }
  ];
  // Aplicar filtro de preço mínimo se fornecido
  let produtosFiltrados = produtosMock;
  if (filtros.precoMin || filtros.precoMax) {
    const precoMinimo = filtros.precoMin ? parseFloat(filtros.precoMin) : 0;
    const precoMaximo = filtros.precoMax ? parseFloat(filtros.precoMax) : Infinity;
    
    if (!isNaN(precoMinimo) || !isNaN(precoMaximo)) {
      produtosFiltrados = produtosMock.filter(produto => {
        return produto.preco >= precoMinimo && produto.preco <= precoMaximo;
      });
      console.log(`Filtro preço R$ ${precoMinimo} - R$ ${precoMaximo === Infinity ? '∞' : precoMaximo}: ${produtosFiltrados.length} produtos encontrados`);
    }
  }

  return produtosFiltrados;
  
  /* CÓDIGO ORIGINAL (desabilitado para demo):
  const options = {
    method: 'GET',
    url: 'https://aliexpress-datahub.p.rapidapi.com/item_search',
    params: {
      q: filtros.genero || 'gift',
      page: '1',
      sort: 'default',
      min_price: filtros.precoMin || 0,
    },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'aliexpress-datahub.p.rapidapi.com'
    }
  };
  try {
    const { data } = await axios.request(options);
    return data.result?.resultList?.map(item => ({
      id: item.productId,
      nome: item.productTitle,
      preco: item.salePrice,
      imagem: item.imageUrl,
      url: item.productDetailUrl,
      marketplace: 'AliExpress'
    })) || [];
  } catch (err) {
    console.error('Erro AliExpress:', err.response?.data || err.message);
  return [];
  }
  */
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
    console.log('🔧 MODO DESENVOLVIMENTO: Nova API AliExpress ainda não implementada para busca');
    console.log('Use buscarDetalheProdutoAliExpress() para detalhes de produtos específicos');
    
    // Por enquanto, retorna os produtos mock
    return await exports.buscarProdutosAliExpress(filtros);
    
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
