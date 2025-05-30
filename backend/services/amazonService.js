// Serviço de integração real com Amazon (exemplo via RapidAPI)
const axios = require('axios');

exports.buscarProdutosAmazon = async (filtros) => {
  // MODO DEMO: retorna produtos mock com links reais para demonstração
  console.log('🔧 MODO DEMO: Retornando produtos mock da Amazon');
  console.log('Filtros recebidos:', filtros);
  
  const produtosMock = [
    {
      id: 'B08N5WRWNW',
      nome: 'Echo Dot (4ª Geração) - Smart Speaker com Alexa',
      preco: 249.90,
      imagem: 'https://m.media-amazon.com/images/I/714Rq4k05UL._AC_SL1000_.jpg',
      url: 'https://www.amazon.com.br/dp/B08N5WRWNW',
      marketplace: 'Amazon'
    },
    {
      id: 'B08C1W5N87',
      nome: 'Fire TV Stick | Streaming em Full HD com Alexa',
      preco: 199.90,
      imagem: 'https://m.media-amazon.com/images/I/51TjJOTfslL._AC_SL1000_.jpg',
      url: 'https://www.amazon.com.br/dp/B08C1W5N87',
      marketplace: 'Amazon'
    },
    {
      id: 'B09BFG5ZQW',
      nome: 'Kindle (11ª geração) - O eReader mais vendido do mundo',
      preco: 349.90,
      imagem: 'https://m.media-amazon.com/images/I/71rRnLfCHJL._AC_SL1000_.jpg',
      url: 'https://www.amazon.com.br/dp/B09BFG5ZQW',
      marketplace: 'Amazon'
    },
    {
      id: 'B08F5M1W6Q',
      nome: 'Bose QuietComfort 35 II - Fone Bluetooth',
      preco: 899.90,
      imagem: 'https://m.media-amazon.com/images/I/81+jNVOUsJL._AC_SL1500_.jpg',
      url: 'https://www.amazon.com.br/dp/B08F5M1W6Q',
      marketplace: 'Amazon'
    },
    {
      id: 'B07Y8J1W3K',
      nome: 'Caderno Inteligente Grande 80 Folhas',
      preco: 59.90,
      imagem: 'https://m.media-amazon.com/images/I/81234567890._AC_SL1000_.jpg',
      url: 'https://www.amazon.com.br/dp/B07Y8J1W3K',
      marketplace: 'Amazon'
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
    url: 'https://amazon24.p.rapidapi.com/api/product',
    params: {
      keyword: filtros.genero || 'gift',
      country: 'BR',
      categoryID: '',
      minPrice: filtros.precoMin || 0,
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
  */
};
