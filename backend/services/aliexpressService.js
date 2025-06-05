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
  // MODO DEMO: retorna produtos mock com links reais para demonstração
  console.log('🔧 MODO DEMO: Retornando produtos mock do AliExpress');
  console.log('Filtros recebidos:', filtros);
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
  return produtosFiltrados;
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
