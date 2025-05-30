// Serviço de integração real com AliExpress (exemplo via RapidAPI)
const axios = require('axios');

exports.buscarProdutosAliExpress = async (filtros) => {
  // MODO DEMO: retorna produtos mock com links reais para demonstração
  console.log('🔧 MODO DEMO: Retornando produtos mock do AliExpress');
  return [
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
    }
  ];
  
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
