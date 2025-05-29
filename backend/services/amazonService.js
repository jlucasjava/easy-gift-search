// Serviço de integração real com Amazon (exemplo via RapidAPI)
const axios = require('axios');

exports.buscarProdutosAmazon = async (filtros) => {
  // Exemplo usando RapidAPI (Amazon Product API)
  const options = {
    method: 'GET',
    url: 'https://amazon24.p.rapidapi.com/api/product',
    params: {
      keyword: filtros.genero || 'gift',
      country: 'BR',
      categoryID: '',
      minPrice: filtros.precoMin || 0,
      // Amazon não tem filtro direto de idade, pode ser usado no keyword
      page: '1'
    },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'amazon24.p.rapidapi.com'
    }
  };
  try {
    const { data } = await axios.request(options);
    return data.docs?.map(item => ({
      id: item.asin,
      nome: item.product_title,
      preco: item.product_price,
      imagem: item.product_photo,
      url: item.product_url,
      marketplace: 'Amazon'
    })) || [];
  } catch (err) {
    console.error('Erro Amazon:', err.response?.data || err.message);
    return [];
  }
};
