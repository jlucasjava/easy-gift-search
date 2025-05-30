const mercadoLivreService = require('../services/mercadoLivreService');
const shopeeService = require('../services/shopeeService');
const amazonService = require('../services/amazonService');
const aliexpressService = require('../services/aliexpressService');

// Controller de produtos: busca mockada Mercado Livre + Elasticsearch
exports.searchProducts = async (req, res) => {
  try {
    // Filtros recebidos via query string
    const { precoMin, idade, genero, page = 1 } = req.query;
    // Novo: accessToken pode vir do header ("x-ml-access-token")
    const accessToken = req.headers['x-ml-access-token'] || null;
    // Busca em todos os marketplaces em paralelo
    const [ml, shopee, amazon, ali] = await Promise.all([
      mercadoLivreService.buscarProdutos({ precoMin, idade, genero }, accessToken),
      shopeeService.buscarProdutosShopee({ precoMin, idade, genero }),
      amazonService.buscarProdutosAmazon({ precoMin, idade, genero }),
      aliexpressService.buscarProdutosAliExpress({ precoMin, idade, genero })
    ]);
    // Junta e limita a 9 resultados
    const produtos = [...ml, ...shopee, ...amazon, ...ali].slice(0, 9);
    // Paginação simples (mock, pois Mercado Livre já limita a 9)
    res.json({ produtos, pagina: Number(page), totalPaginas: 5 });
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    res.status(500).json({ erro: 'Erro ao buscar produtos.' });
  }
};
// Para reverter, basta remover o uso do accessToken e voltar ao serviço original.
