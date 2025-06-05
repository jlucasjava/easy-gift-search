// Serviço de integração real com Shopee (exemplo via RapidAPI)
const axios = require('axios');

const PLACEHOLDER_IMG = '/images/placeholder.jpg';

exports.buscarProdutosShopee = async (filtros) => {
  // MODO DEMO: retorna produtos mock com links reais para demonstração
  console.log('🔧 MODO DEMO: Retornando produtos mock da Shopee');
  console.log('Filtros recebidos:', filtros);
    const produtosMock = [
    {
      id: 'shopee123456',
      nome: 'Macacão Bebê Menino Algodão',
      preco: 59.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://shopee.com.br/Kit-Macacao-Bebe-Menino-i.123456.789012345',
      marketplace: 'Shopee',
      genero: 'masculino',
      idadeMin: 0,
      idadeMax: 2
    },
    {
      id: 'shopee654321',
      nome: 'Mordedor de Silicone Unissex',
      preco: 29.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://shopee.com.br/Mordedor-Silicone-Bebe-i.654321.987654321',
      marketplace: 'Shopee',
      genero: 'unisex',
      idadeMin: 0,
      idadeMax: 2
    },
    {
      id: 'shopee777888',
      nome: 'Kit Higiene Bebê Azul',
      preco: 79.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://shopee.com.br/Kit-Higiene-Bebe-Azul-i.777888.123456789',
      marketplace: 'Shopee',
      genero: 'masculino',
      idadeMin: 0,
      idadeMax: 2
    },
    {
      id: 'shopee999000',
      nome: 'Conjunto de Panelas Antiaderente',
      preco: 199.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://shopee.com.br/Conjunto-Panelas-Antiaderente-i.999000.987654321',
      marketplace: 'Shopee',
      genero: 'unisex',
      idadeMin: 18,
      idadeMax: 120
    },
    {
      id: 'shopee111333',
      nome: 'Caneca Térmica Personalizada',
      preco: 39.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://shopee.com.br/Caneca-Termica-Personalizada-i.111333.456789012',
      marketplace: 'Shopee',
      genero: 'unisex',
      idadeMin: 14,
      idadeMax: 120
    }
  ];
  // Filtro integrado preço, gênero e idade (faixa etária)
  let produtosFiltrados = produtosMock;
  if (filtros.precoMin || filtros.precoMax) {
    const precoMinimo = filtros.precoMin ? parseFloat(filtros.precoMin) : 0;
    const precoMaximo = filtros.precoMax ? parseFloat(filtros.precoMax) : Infinity;
    produtosFiltrados = produtosFiltrados.filter(produto => produto.preco >= precoMinimo && produto.preco <= precoMaximo);
  }
  if (filtros.genero && filtros.genero.toLowerCase() !== 'nao informado' && filtros.genero.toLowerCase() !== '') {
    const genero = filtros.genero.toLowerCase();
    produtosFiltrados = produtosFiltrados.filter(p => {
      const produtoGenero = p.genero.toLowerCase();
      return produtoGenero === 'unisex' || produtoGenero === genero;
    });
  }
  if (filtros.idade) {
    const idade = parseInt(filtros.idade);
    produtosFiltrados = produtosFiltrados.filter(p => {
      const min = p.idadeMin || 0;
      const max = p.idadeMax !== undefined ? p.idadeMax : 120;
      return idade >= min && idade <= max;
    });
  }
  // Retornar até 30 produtos para busca mais abrangente
  return produtosFiltrados.slice(0, 30);
  
  /* CÓDIGO ORIGINAL (desabilitado para demo):
  const options = {
    method: 'GET',
    url: 'https://shopee-api3.p.rapidapi.com/api/v2/search_items/',
    params: {
      by: 'relevancy',
      keyword: filtros.genero || 'presente',
      limit: '9',
      newest: '0',
      price_min: filtros.precoMin || 0,
    },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'shopee-api3.p.rapidapi.com'
    }
  };
  try {
    const { data } = await axios.request(options);
    return data.items?.map(item => ({
      id: item.itemid,
      nome: item.name,
      preco: item.price / 100000,
      imagem: item.image,
      url: `https://shopee.com.br/product/${item.shopid}/${item.itemid}`,
      marketplace: 'Shopee'
    })) || [];
  } catch (err) {
    console.error('Erro Shopee:', err.response?.data || err.message);
    return [];
  }
  */
};

// Função real para buscar produtos na Shopee via RapidAPI
exports.buscarProdutosShopeeReal = async (filtros) => {
  const { precoMin, precoMax, genero } = filtros;
  const keyword = genero || 'presente';
  const options = {
    method: 'GET',
    url: 'https://shopee-api3.p.rapidapi.com/api/v2/search_items/',
    params: {
      by: 'relevancy',
      keyword,
      limit: '30',
      newest: '0',
      price_min: precoMin || 0,
    },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'shopee-api3.p.rapidapi.com'
    }
  };
  try {
    const { data } = await axios.request(options);
    let produtos = data.items?.map(item => ({
      id: item.itemid,
      nome: item.name,
      preco: item.price / 100000,
      imagem: item.image,
      url: `https://shopee.com.br/product/${item.shopid}/${item.itemid}`,
      marketplace: 'Shopee',
      genero: genero || 'unisex',
      idadeMin: 0,
      idadeMax: 120
    })) || [];
    if (precoMax) produtos = produtos.filter(p => p.preco <= precoMax);
    return produtos;
  } catch (err) {
    console.error('Erro Shopee:', err.response?.data || err.message);
    return [];
  }
};

exports.buscarProdutos = async (filtros) => {
  if (process.env.USE_REAL_SHOPEE_API === 'true' && process.env.RAPIDAPI_KEY) {
    return await exports.buscarProdutosShopeeReal(filtros);
  }
  return await exports.buscarProdutosShopee(filtros);
};
