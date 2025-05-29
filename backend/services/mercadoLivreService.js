const axios = require('axios');

exports.buscarProdutos = async (filtros) => {
  // Exemplo de busca simples no Mercado Livre
  let url = 'https://api.mercadolibre.com/sites/MLB/search?q=presente';
  if (filtros.precoMin) url += `&price=${filtros.precoMin}-`;
  if (filtros.genero) url += `&attributes=gender:${filtros.genero}`;
  url += '&limit=9';
  try {
    const { data } = await axios.get(url);
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
};
