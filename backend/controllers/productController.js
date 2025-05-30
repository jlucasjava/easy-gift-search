const mercadoLivreService = require('../services/mercadoLivreService');
const shopeeService = require('../services/shopeeService');
const amazonService = require('../services/amazonService');
const aliexpressService = require('../services/aliexpressService');

// Controller de produtos: busca mockada Mercado Livre + Elasticsearch
exports.searchProducts = async (req, res) => {
  try {
    // Filtros recebidos via query string
    const { precoMin, precoMax, idade, genero, page = 1 } = req.query;
    console.log('🔍 Filtros recebidos:', { precoMin, precoMax, idade, genero, page });
    
    // Novo: accessToken pode vir do header ("x-ml-access-token")
    const accessToken = req.headers['x-ml-access-token'] || null;
      // Busca em todos os marketplaces em paralelo
    const [ml, shopee, amazon, ali] = await Promise.all([
      mercadoLivreService.buscarProdutos({ precoMin, precoMax, idade, genero }, accessToken),
      shopeeService.buscarProdutosShopee({ precoMin, precoMax, idade, genero }),
      amazonService.buscarProdutos({ precoMin, precoMax, idade, genero }), // Usando nova função principal
      aliexpressService.buscarProdutosAliExpress({ precoMin, precoMax, idade, genero })
    ]);
    
    // Junta todos os produtos
    const todosProdutos = [...ml, ...shopee, ...amazon, ...ali];
    console.log(`📦 Total de produtos encontrados: ${todosProdutos.length}`);
    
    // Aplicar filtros globais se necessário (backup caso algum serviço não tenha aplicado)
    let produtosFiltrados = todosProdutos;
    if (precoMin || precoMax) {
      const min = precoMin ? parseFloat(precoMin) : 0;
      const max = precoMax ? parseFloat(precoMax) : Infinity;
      
      produtosFiltrados = todosProdutos.filter(produto => {
        return produto.preco >= min && produto.preco <= max;
      });
      
      console.log(`💰 Filtro de preço R$ ${min} - R$ ${max === Infinity ? '∞' : max}: ${produtosFiltrados.length} produtos`);
    }
    
    // Limita a 9 resultados e ordena por relevância/preço
    const produtos = produtosFiltrados
      .sort((a, b) => a.preco - b.preco) // Ordena por preço crescente
      .slice(0, 9);
    
    console.log(`✅ Retornando ${produtos.length} produtos para o frontend`);
    
    // Paginação simples (mock, pois Mercado Livre já limita a 9)
    res.json({ produtos, pagina: Number(page), totalPaginas: 5 });
  } catch (err) {
    console.error('❌ Erro ao buscar produtos:', err);
    res.status(500).json({ erro: 'Erro ao buscar produtos.' });
  }
};
// Para reverter, basta remover o uso do accessToken e voltar ao serviço original.
