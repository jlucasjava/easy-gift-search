const axios = require('axios');

// Busca produtos no Mercado Livre, com suporte a token OAuth
exports.buscarProdutos = async (filtros, accessToken = null) => {
  // MODO DEMO: retorna produtos mock com links reais para demonstração
  console.log('🔧 MODO DEMO: Retornando produtos mock do Mercado Livre');
  console.log('Filtros recebidos:', filtros);
  
  const produtosMock = [
    {
      id: 'MLB123456789',
      nome: 'Smartphone Samsung Galaxy A54 128GB',
      preco: 899.99,
      imagem: 'https://http2.mlstatic.com/D_NQ_NP_2X_123456-MLA123456789-012023-F.webp',
      url: 'https://produto.mercadolivre.com.br/MLB-123456789-smartphone-samsung-galaxy-a54-128gb',
      marketplace: 'Mercado Livre'
    },
    {
      id: 'MLB987654321',
      nome: 'Fone de Ouvido Bluetooth JBL Tune 510BT',
      preco: 179.90,
      imagem: 'https://http2.mlstatic.com/D_NQ_NP_2X_987654-MLA987654321-032023-F.webp',
      url: 'https://produto.mercadolivre.com.br/MLB-987654321-fone-jbl-tune-510bt',
      marketplace: 'Mercado Livre'
    },
    {
      id: 'MLB555666777',
      nome: 'Relógio Smartwatch Xiaomi Mi Band 7',
      preco: 249.90,
      imagem: 'https://http2.mlstatic.com/D_NQ_NP_2X_555666-MLA555666777-042023-F.webp',
      url: 'https://produto.mercadolivre.com.br/MLB-555666777-smartwatch-xiaomi-mi-band-7',
      marketplace: 'Mercado Livre'
    },
    {
      id: 'MLB111222333',
      nome: 'Livro Dom Casmurro - Machado de Assis',
      preco: 25.90,
      imagem: 'https://http2.mlstatic.com/D_NQ_NP_2X_111222-MLA111222333-052023-F.webp',
      url: 'https://produto.mercadolivre.com.br/MLB-111222333-livro-dom-casmurro',
      marketplace: 'Mercado Livre'
    },
    {
      id: 'MLB444555666',
      nome: 'Tablet Samsung Galaxy Tab A8 64GB',
      preco: 599.90,
      imagem: 'https://http2.mlstatic.com/D_NQ_NP_2X_444555-MLA444555666-062023-F.webp',
      url: 'https://produto.mercadolivre.com.br/MLB-444555666-tablet-samsung-galaxy-tab-a8',
      marketplace: 'Mercado Livre'
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
  let url = 'https://api.mercadolibre.com/sites/MLB/search?q=presente';
  if (filtros.precoMin) url += `&price=${filtros.precoMin}-`;
  if (filtros.genero) url += `&attributes=gender:${filtros.genero}`;
  url += '&limit=9';
  const headers = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  try {
    const { data } = await axios.get(url, { headers });
    return data.results.map(item => ({
      id: item.id,
      nome: item.title,
      preco: item.price,
      imagem: item.thumbnail,
      url: item.permalink,
      marketplace: 'Mercado Livre'
    }));
  } catch (err) {
    console.error('Erro Mercado Livre:', err.response?.data || err.message);
    return [];
  }
  */
};
