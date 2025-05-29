// Serviço de integração real com Shopee (exemplo via RapidAPI)
const axios = require('axios');

exports.buscarProdutosShopee = async (filtros) => {
  // Exemplo usando RapidAPI (Shopee não tem API pública oficial)
  const options = {
    method: 'GET',
    url: 'https://shopee-api3.p.rapidapi.com/api/v2/search_items/',
    params: {
      by: 'relevancy',
      keyword: filtros.genero || 'presente',
      limit: '9',
      newest: '0',
      price_min: filtros.precoMin || 0,
      // Shopee não tem filtro direto de idade, pode ser usado no keyword
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
};
