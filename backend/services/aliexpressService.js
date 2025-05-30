// Serviço de integração real com AliExpress (exemplo via RapidAPI)
const axios = require('axios');

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
