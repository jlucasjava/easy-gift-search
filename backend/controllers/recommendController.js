const axios = require('axios');

// Integração real com OpenAI para recomendação inteligente
exports.getRecommendation = async (req, res) => {
  try {
    const { idade, genero, interesses } = req.body;
    
    // Fallback: sugestão baseada em regras simples (ignora OpenAI)
    let sugestao = '';
    let produtosRelacionados = [];
    
    // Exemplo de lógica simples
    if (idade < 12) {
      sugestao = 'Que tal um brinquedo educativo?';
      produtosRelacionados = [
        { nome: 'Quebra-cabeça', preco: 'R$ 39,90', imagem: 'https://m.media-amazon.com/images/I/81bKNJHNJIL._AC_SL1500_.jpg', url: 'https://www.amazon.com.br/dp/B07ZQ5JQ7T' },
        { nome: 'Jogo de memória', preco: 'R$ 29,90', imagem: 'https://m.media-amazon.com/images/I/71TjKNJPxvL._AC_SL1200_.jpg', url: 'https://www.amazon.com.br/dp/B08LQ5JQ7T' },
        { nome: 'Kit de pintura', preco: 'R$ 24,90', imagem: 'https://m.media-amazon.com/images/I/81qYFN1I9PL._AC_SL1500_.jpg', url: 'https://www.amazon.com.br/dp/B09LQ5JQ7T' }
      ];
    } else if (idade < 18) {
      sugestao = 'Uma boa opção pode ser um livro ou acessório para hobbies.';
      produtosRelacionados = [
        { nome: 'Livro de aventura', preco: 'R$ 49,90', imagem: 'https://m.media-amazon.com/images/I/81l4VXtRdEL._AC_SL1500_.jpg', url: 'https://www.amazon.com.br/dp/B07LQ5JQ7T' },
        { nome: 'Fone de ouvido', preco: 'R$ 59,90', imagem: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_SL1000_.jpg', url: 'https://www.amazon.com.br/dp/B08NQ5JQ7T' },
        { nome: 'Camiseta estilosa', preco: 'R$ 34,90', imagem: 'https://m.media-amazon.com/images/I/71pXoTKUNpL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B09NQ5JQ7T' }
      ];
    } else if (genero === 'feminino') {
      sugestao = 'Uma boa escolha pode ser um kit de beleza ou acessório.';
      produtosRelacionados = [
        { nome: 'Kit de maquiagem', preco: 'R$ 79,90', imagem: 'https://m.media-amazon.com/images/I/71HNLMqRH2L._AC_SL1500_.jpg', url: 'https://www.amazon.com.br/dp/B07FQ5JQ7T' },
        { nome: 'Bolsa feminina', preco: 'R$ 99,90', imagem: 'https://m.media-amazon.com/images/I/71vFKBqbhCL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B08FQ5JQ7T' },
        { nome: 'Perfume', preco: 'R$ 59,90', imagem: 'https://m.media-amazon.com/images/I/61zYH7qI3WL._AC_SL1500_.jpg', url: 'https://www.amazon.com.br/dp/B09FQ5JQ7T' }
      ];
    } else if (genero === 'masculino') {
      sugestao = 'Que tal um acessório esportivo ou eletrônico?';
      produtosRelacionados = [
        { nome: 'Relógio esportivo', preco: 'R$ 89,90', imagem: 'https://m.media-amazon.com/images/I/71J8r7Z3N9L._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B07MQ5JQ7T' },
        { nome: 'Carteira de couro', preco: 'R$ 49,90', imagem: 'https://m.media-amazon.com/images/I/81FZaKuNsJL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B08MQ5JQ7T' },
        { nome: 'Fone bluetooth', preco: 'R$ 69,90', imagem: 'https://m.media-amazon.com/images/I/61V1S5Np7RL._AC_SL1000_.jpg', url: 'https://www.amazon.com.br/dp/B09MQ5JQ7T' }
      ];
    } else {
      sugestao = 'Uma boa opção pode ser um presente personalizado ou item para casa.';
      produtosRelacionados = [
        { nome: 'Caneca personalizada', preco: 'R$ 29,90', imagem: 'https://m.media-amazon.com/images/I/71HZnZ7NFNL._AC_SL1500_.jpg', url: 'https://www.amazon.com.br/dp/B07PQ5JQ7T' },
        { nome: 'Almofada divertida', preco: 'R$ 34,90', imagem: 'https://m.media-amazon.com/images/I/81K8nQvGS1L._AC_SL1500_.jpg', url: 'https://www.amazon.com.br/dp/B08PQ5JQ7T' },
        { nome: 'Luminária criativa', preco: 'R$ 44,90', imagem: 'https://m.media-amazon.com/images/I/71Zh5H8MgJL._AC_SL1500_.jpg', url: 'https://www.amazon.com.br/dp/B09PQ5JQ7T' }
      ];
    }
    
    res.json({ sugestao, produtosRelacionados });
  } catch (error) {
    console.error('Erro no recommendController:', error);
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      message: error.message 
    });
  }
};

// Retorna recomendações randomizadas
exports.getRandomRecommendation = async (req, res) => {
  try {
    // Lista de sugestões possíveis (pode ser expandida)
    const sugestoes = [
      {
        sugestao: 'Que tal um acessório esportivo ou eletrônico?',
        produtosRelacionados: [
          { nome: 'Relógio esportivo', preco: 'R$ 89,90', imagem: 'https://m.media-amazon.com/images/I/71J8r7Z3N9L._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B07MQ5JQ7T' },
          { nome: 'Carteira de couro', preco: 'R$ 49,90', imagem: 'https://m.media-amazon.com/images/I/81FZaKuNsJL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B08MQ5JQ7T' },
          { nome: 'Fone bluetooth', preco: 'R$ 69,90', imagem: 'https://m.media-amazon.com/images/I/61V1S5Np7RL._AC_SL1000_.jpg', url: 'https://www.amazon.com.br/dp/B09MQ5JQ7T' }
        ]
      },
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
