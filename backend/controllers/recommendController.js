const axios = require('axios');

// Integração real com OpenAI para recomendação inteligente
exports.getRecommendation = async (req, res) => {
  const { idade, genero, interesses } = req.body;
  // Fallback: sugestão baseada em regras simples (ignora OpenAI)
  let sugestao = '';
  let produtosRelacionados = [];
  // Exemplo de lógica simples
  if (idade < 12) {
    sugestao = 'Que tal um brinquedo educativo?';
    produtosRelacionados = [
      { nome: 'Quebra-cabeça', preco: 'R$ 39,90', imagem: 'https://m.media-amazon.com/images/I/81QF1Qw8pGL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B07ZQ5JQ7T' },
      { nome: 'Jogo de memória', preco: 'R$ 29,90', imagem: 'https://m.media-amazon.com/images/I/81n1Qw8pGL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B08LQ5JQ7T' },
      { nome: 'Kit de pintura', preco: 'R$ 24,90', imagem: 'https://m.media-amazon.com/images/I/81m1Qw8pGL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B09LQ5JQ7T' }
    ];
  } else if (idade < 18) {
    sugestao = 'Uma boa opção pode ser um livro ou acessório para hobbies.';
    produtosRelacionados = [
      { nome: 'Livro de aventura', preco: 'R$ 49,90', imagem: 'https://m.media-amazon.com/images/I/81b6Qw8pGL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B07LQ5JQ7T' },
      { nome: 'Fone de ouvido', preco: 'R$ 59,90', imagem: 'https://m.media-amazon.com/images/I/81c6Qw8pGL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B08NQ5JQ7T' },
      { nome: 'Camiseta estilosa', preco: 'R$ 34,90', imagem: 'https://m.media-amazon.com/images/I/81d6Qw8pGL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B09NQ5JQ7T' }
    ];
  } else if (genero === 'feminino') {
    sugestao = 'Uma boa escolha pode ser um kit de beleza ou acessório.';
    produtosRelacionados = [
      { nome: 'Kit de maquiagem', preco: 'R$ 79,90', imagem: 'https://m.media-amazon.com/images/I/81e6Qw8pGL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B07FQ5JQ7T' },
      { nome: 'Bolsa feminina', preco: 'R$ 99,90', imagem: 'https://m.media-amazon.com/images/I/81f6Qw8pGL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B08FQ5JQ7T' },
      { nome: 'Perfume', preco: 'R$ 59,90', imagem: 'https://m.media-amazon.com/images/I/81g6Qw8pGL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B09FQ5JQ7T' }
    ];
  } else if (genero === 'masculino') {
    sugestao = 'Que tal um acessório esportivo ou eletrônico?';
    produtosRelacionados = [
      { nome: 'Relógio esportivo', preco: 'R$ 89,90', imagem: 'https://m.media-amazon.com/images/I/81h6Qw8pGL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B07MQ5JQ7T' },
      { nome: 'Carteira de couro', preco: 'R$ 49,90', imagem: 'https://m.media-amazon.com/images/I/81i6Qw8pGL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B08MQ5JQ7T' },
      { nome: 'Fone bluetooth', preco: 'R$ 69,90', imagem: 'https://m.media-amazon.com/images/I/81j6Qw8pGL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B09MQ5JQ7T' }
    ];
  } else {
    sugestao = 'Uma boa opção pode ser um presente personalizado ou item para casa.';
    produtosRelacionados = [
      { nome: 'Caneca personalizada', preco: 'R$ 29,90', imagem: 'https://m.media-amazon.com/images/I/81k6Qw8pGL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B07PQ5JQ7T' },
      { nome: 'Almofada divertida', preco: 'R$ 34,90', imagem: 'https://m.media-amazon.com/images/I/81l6Qw8pGL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B08PQ5JQ7T' },
      { nome: 'Luminária criativa', preco: 'R$ 44,90', imagem: 'https://m.media-amazon.com/images/I/81m6Qw8pGL._AC_SX679_.jpg', url: 'https://www.amazon.com.br/dp/B09PQ5JQ7T' }
    ];
  }
  res.json({ sugestao, produtosRelacionados });
};
