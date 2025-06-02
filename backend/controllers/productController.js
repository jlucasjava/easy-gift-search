// Controller de produtos: API mock simplificada para teste
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
        marketplace: 'Mercado Livre',
        url: 'https://produto.mercadolivre.com.br/MLB-123456789-presente-exemplo-1'
      },
      {
        id: '2',
        titulo: 'Produto Teste 2',
        preco: precoMax ? parseFloat(precoMax) - 10 : 90,
        descricao: 'Segundo produto de teste',
        imagem: 'https://via.placeholder.com/300x300/28A745/FFFFFF?text=Teste+2',
        marketplace: 'Amazon',
        url: 'https://www.amazon.com.br/dp/B0C1234567'
      },
      {
        id: '3',
        titulo: 'Produto Teste 3',
        preco: 120,
        descricao: 'Terceiro produto de teste',
        imagem: 'https://via.placeholder.com/300x300/FFC107/000000?text=Teste+3',
        marketplace: 'Americanas',
        url: 'https://www.americanas.com.br/produto/123456789'
      }
    ].map(prod => {
      // Validação extra para garantir que as cores estejam corretas
      // Se algum parâmetro de cor estiver faltando, usa fallback seguro
      const urlRegex = /https:\/\/via\.placeholder\.com\/(\d+x\d+)(?:\/([0-9A-Fa-f]{6}))?(?:\/([0-9A-Fa-f]{6}))?\?text=(.+)/;
      if (prod.imagem && prod.imagem.startsWith('https://via.placeholder.com/')) {
        const match = prod.imagem.match(urlRegex);
        if (match) {
          const size = match[1] || '300x300';
          const bg = match[2] && match[2].length === 6 ? match[2] : 'CCCCCC';
          const fg = match[3] && match[3].length === 6 ? match[3] : '333333';
          const text = match[4] || 'Produto';
          prod.imagem = `https://via.placeholder.com/${size}/${bg}/${fg}?text=${encodeURIComponent(text)}`;
        }
      }
      return prod;
    });

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
