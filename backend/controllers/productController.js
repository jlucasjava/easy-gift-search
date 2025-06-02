const mercadoLivreService = require('../services/mercadoLivreService');
const shopeeService = require('../services/shopeeService');
const amazonService = require('../services/amazonService');
const aliexpressService = require('../services/aliexpressService');

// Controller de produtos: busca mockada Mercado Livre + Elasticsearch
exports.searchProducts = async (req, res) => {
  try {
    console.log('🔍 API /products chamada com query:', req.query);
    
    // Filtros recebidos via query string
    const { precoMin, precoMax, idade, genero, page = 1 } = req.query;
    console.log('🔍 Filtros recebidos:', { precoMin, precoMax, idade, genero, page });
    
    // Resposta mock simples para teste
    const mockProducts = [
      {
        id: '1',
        titulo: `Presente ${genero || 'unissex'} para ${idade || '25'} anos`,
        preco: precoMin ? parseFloat(precoMin) + 10 : 75,
        descricao: 'Produto de teste mock',
        imagem: 'https://via.placeholder.com/300x300/007BFF/FFFFFF?text=Produto+Teste',
        marketplace: 'teste',
        url: '#'
      },
      {
        id: '2',
        titulo: 'Produto Teste 2',
        preco: precoMax ? parseFloat(precoMax) - 10 : 90,
        descricao: 'Segundo produto de teste',
        imagem: 'https://via.placeholder.com/300x300/28A745/FFFFFF?text=Teste+2',
        marketplace: 'teste',
        url: '#'
      }
    ];

    console.log('📦 Retornando produtos mock:', mockProducts.length);
    
    res.json({
      produtos: mockProducts,
      total: mockProducts.length,
      pagina: parseInt(page),
      totalPaginas: 1
    });
    
  } catch (error) {
    console.error('❌ Erro no searchProducts:', error);
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: error.message 
    });
  }
};
      
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
