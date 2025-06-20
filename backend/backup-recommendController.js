const googleSearchService = require('../services/googleSearchService');

// Recomendações usando apenas Google Custom Search API
exports.getRecommendation = async (req, res) => {
  try {
    const { idade, genero, interesses, precoMax } = req.body;
    
    // Formata uma busca baseada nos parâmetros fornecidos
    const searchQuery = `presentes para ${genero || 'pessoa'} ${idade || 'adulto'} ${interesses || ''}`.trim();
    
    // Construir filtros
    const filtros = {
      precoMax: precoMax,
      idade: idade,
      genero: genero,
      categoria: interesses || searchQuery
    };
    
    try {
      // Usa Google Search API para buscar recomendações
      const resultado = await googleSearchService.buscarPresentesGoogle(filtros);
      
      return res.json({
        sucesso: true,
        sugestao: `Sugestões baseadas em: ${searchQuery}`,
        produtosRelacionados: resultado.produtos || [],
        total: resultado.produtos?.length || 0
      });
    } catch (err) {
      console.error('Erro ao usar Google Search:', err.message);
      
      // Em caso de erro na API, responder com erro
      return res.status(500).json({
        sucesso: false,
        erro: 'Erro ao buscar recomendações',
        mensagem: err.message
      });
    }
  } catch (error) {
    console.error('Erro no recommendController:', error);
    res.status(500).json({ 
      sucesso: false,
      erro: 'Erro interno do servidor',
      message: error.message 
    });
  }
};

// Método para obter recomendações aleatórias, também utilizando Google Custom Search
exports.getRandomRecommendation = async (req, res) => {
  try {
    // Lista de consultas aleatórias para variedade
    const queries = [
      'presentes criativos',
      'presentes tecnologia',
      'presentes decoração',
      'presentes moda',
      'presentes divertidos'
    ];
    
    // Seleciona uma consulta aleatória
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    
    // Constrói os filtros
    const filtros = {
      categoria: randomQuery
    };
    
    try {
      // Busca usando o Google Custom Search
      const resultado = await googleSearchService.buscarPresentesGoogle(filtros);
      
      return res.json({
        sucesso: true,
        sugestao: `Recomendação do dia: ${randomQuery}`,
        produtosRelacionados: resultado.produtos || [],
        total: resultado.produtos?.length || 0
      });
    } catch (err) {
      console.error('Erro ao buscar recomendações aleatórias:', err.message);
      
      // Em caso de erro na API, responder com erro
      return res.status(500).json({
        sucesso: false,
        erro: 'Erro ao buscar recomendações aleatórias',
        mensagem: err.message
      });
    }
  } catch (error) {
    console.error('Erro no getRandomRecommendation:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
      message: error.message
    });
  }
};
      {
        sugestao: 'Uma boa escolha pode ser um kit de beleza ou acessório.',
        produtosRelacionados: [
          { nome: 'Kit de maquiagem', preco: 'R$ 79,90', imagem: 'https://m.media-amazon.com/images/I/71HNLMqRH2L._AC_SL1500_.jpg', url: 'https://www.amazon.com.br/dp/B07FQ5JQ7T' },
          { nome: 'Bolsa feminina', preco: 'R$ 99,90', imagem: 'https://m.media-amazon.com/images/I/71vFKBqbhCL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B08FQ5JQ7T' },
          { nome: 'Perfume', preco: 'R$ 59,90', imagem: 'https://m.media-amazon.com/images/I/61zYH7qI3WL._AC_SL1500_.jpg', url: 'https://www.amazon.com.br/dp/B09FQ5JQ7T' }
        ]
      },
      {
        sugestao: 'Uma boa opção pode ser um presente personalizado ou item para casa.',
        produtosRelacionados: [
          { nome: 'Caneca personalizada', preco: 'R$ 29,90', imagem: 'https://m.media-amazon.com/images/I/71HZnZ7NFNL._AC_SL1500_.jpg', url: 'https://www.amazon.com.br/dp/B07PQ5JQ7T' },
          { nome: 'Almofada divertida', preco: 'R$ 34,90', imagem: 'https://m.media-amazon.com/images/I/81K8nQvGS1L._AC_SL1500_.jpg', url: 'https://www.amazon.com.br/dp/B08PQ5JQ7T' },
          { nome: 'Luminária criativa', preco: 'R$ 44,90', imagem: 'https://m.media-amazon.com/images/I/71Zh5H8MgJL._AC_SL1500_.jpg', url: 'https://www.amazon.com.br/dp/B09PQ5JQ7T' }
        ]
      }
    ];
    // Seleciona uma sugestão randomicamente
    const random = sugestoes[Math.floor(Math.random() * sugestoes.length)];
    res.json(random);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao gerar recomendação randomizada', detalhes: error.message });
  }
};
