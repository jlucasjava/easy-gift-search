// Serviço de integração real com Shopee (exemplo via RapidAPI)
const axios = require('axios');

exports.buscarProdutosShopee = async (filtros) => {
  // MODO DEMO: retorna produtos mock com links reais para demonstração
  console.log('🔧 MODO DEMO: Retornando produtos mock da Shopee');
  console.log('Filtros recebidos:', filtros);
    const produtosMock = [    {
      id: 'shopee123456',
      nome: 'Kit Maquiagem Completo Ruby Rose',
      preco: 89.90,
      imagem: 'https://cf.shopee.com.br/file/0e2e3b4c5d6f7a8b9c0d1e2f3a4b5c6d',
      url: 'https://shopee.com.br/Kit-Maquiagem-Completo-Ruby-Rose-i.123456.789012345',
      marketplace: 'Shopee'
    },    {
      id: 'shopee654321',
      nome: 'Tênis Esportivo Nike Air Max',
      preco: 299.90,
      imagem: 'https://cf.shopee.com.br/file/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
      url: 'https://shopee.com.br/Tenis-Esportivo-Nike-Air-Max-i.654321.987654321',
      marketplace: 'Shopee'
    },    {
      id: 'shopee777888',
      nome: 'Perfume Importado Feminino 100ml',
      preco: 159.90,
      imagem: 'https://cf.shopee.com.br/file/2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
      url: 'https://shopee.com.br/Perfume-Importado-Feminino-i.777888.123456789',
      marketplace: 'Shopee'
    },    {
      id: 'shopee999000',
      nome: 'Conjunto de Panelas Antiaderente',
      preco: 199.90,
      imagem: 'https://cf.shopee.com.br/file/3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
      url: 'https://shopee.com.br/Conjunto-Panelas-Antiaderente-i.999000.987654321',
      marketplace: 'Shopee'
    },    {
      id: 'shopee111333',
      nome: 'Caneca Térmica Personalizada',
      preco: 39.90,
      imagem: 'https://cf.shopee.com.br/file/4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
      url: 'https://shopee.com.br/Caneca-Termica-Personalizada-i.111333.456789012',
      marketplace: 'Shopee'
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
