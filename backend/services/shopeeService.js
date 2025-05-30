// Serviço de integração real com Shopee (exemplo via RapidAPI)
const axios = require('axios');

exports.buscarProdutosShopee = async (filtros) => {
  // MODO DEMO: retorna produtos mock com links reais para demonstração
  console.log('🔧 MODO DEMO: Retornando produtos mock da Shopee');
  return [
    {
      id: 'shopee123456',
      nome: 'Kit Maquiagem Completo Ruby Rose',
      preco: 89.90,
      imagem: 'https://cf.shopee.com.br/file/123456789_tn',
      url: 'https://shopee.com.br/Kit-Maquiagem-Completo-Ruby-Rose-i.123456.789012345',
      marketplace: 'Shopee'
    },
    {
      id: 'shopee654321',
      nome: 'Tênis Esportivo Nike Air Max',
      preco: 299.90,
      imagem: 'https://cf.shopee.com.br/file/654321987_tn',
      url: 'https://shopee.com.br/Tenis-Esportivo-Nike-Air-Max-i.654321.987654321',
      marketplace: 'Shopee'
    }
  ];
  
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
