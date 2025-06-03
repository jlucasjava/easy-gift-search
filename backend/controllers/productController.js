// Controller de produtos: API mock simplificada para teste
const mercadoLivreService = require('../services/mercadoLivreService');
const amazonService = require('../services/amazonService');
const shopeeService = require('../services/shopeeService');
const aliexpressService = require('../services/aliexpressService');

exports.searchProducts = async (req, res) => {
  try {
    console.log('🔍 API /products chamada com query:', req.query);
    const { precoMin, precoMax, idade, genero, page = 1 } = req.query;
    const filtros = { precoMin, precoMax, idade, genero, page };

    // Chama todos os serviços em paralelo
    const [ml, amz, shopee, ali] = await Promise.all([
      mercadoLivreService.buscarProdutos(filtros),
      amazonService.buscarProdutos(filtros),
      shopeeService.buscarProdutosShopee(filtros),
      aliexpressService.buscarProdutosAliExpress(filtros)
    ]);

    // Unifica e embaralha os resultados
    let produtos = [...ml, ...amz, ...shopee, ...ali];
    produtos = produtos.sort(() => Math.random() - 0.5);

    // Paginação simples (9 por página)
    const pageSize = 9;
    const total = produtos.length;
    const totalPaginas = Math.ceil(total / pageSize);
    const pagina = Math.max(1, parseInt(page));
    const produtosPaginados = produtos.slice((pagina - 1) * pageSize, pagina * pageSize);

    res.json({
      produtos: produtosPaginados,
      total,
      pagina,
      totalPaginas
    });
  } catch (error) {
    console.error('❌ Erro no searchProducts:', error);
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: error.message 
    });
  }
};
