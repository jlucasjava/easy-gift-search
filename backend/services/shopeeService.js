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
      imagem: 'https://cf.shopee.com.br/file/e8b3c8c9b1a5d4e6f7c8b9a0b1c2d3e4',
      url: 'https://shopee.com.br/Kit-Maquiagem-Completo-Ruby-Rose-i.123456.789012345',
      marketplace: 'Shopee'
    },    {
      id: 'shopee654321',
      nome: 'Tênis Esportivo Nike Air Max',
      preco: 299.90,
      imagem: 'https://cf.shopee.com.br/file/a1b2c3d4e5f6789012345678901234567',
      url: 'https://shopee.com.br/Tenis-Esportivo-Nike-Air-Max-i.654321.987654321',
      marketplace: 'Shopee'
    },    {
      id: 'shopee777888',
      nome: 'Perfume Importado Feminino 100ml',
      preco: 159.90,
      imagem: 'https://cf.shopee.com.br/file/f6e7d8c9b0a19283746501928374650',
      url: 'https://shopee.com.br/Perfume-Importado-Feminino-i.777888.123456789',
      marketplace: 'Shopee'
    },    {
      id: 'shopee999000',
      nome: 'Conjunto de Panelas Antiaderente',
      preco: 199.90,
      imagem: 'https://cf.shopee.com.br/file/123456789abcdef0123456789abcdef01',
      url: 'https://shopee.com.br/Conjunto-Panelas-Antiaderente-i.999000.987654321',
      marketplace: 'Shopee'
    },    {
      id: 'shopee111333',
      nome: 'Caneca Térmica Personalizada',
      preco: 39.90,
      imagem: 'https://cf.shopee.com.br/file/987654321fedcba0987654321fedcba0',
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
