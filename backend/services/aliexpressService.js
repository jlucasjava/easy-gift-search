// Serviço de integração real com AliExpress (exemplo via RapidAPI)
const axios = require('axios');

exports.buscarProdutosAliExpress = async (filtros) => {
  // Exemplo usando RapidAPI (AliExpress API)
  const options = {
    method: 'GET',
    url: 'https://aliexpress-datahub.p.rapidapi.com/item_search',
    params: {
      q: filtros.genero || 'gift',
      page: '1',
      sort: 'default',
      min_price: filtros.precoMin || 0,
      // AliExpress não tem filtro direto de idade, pode ser usado no q
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
};
