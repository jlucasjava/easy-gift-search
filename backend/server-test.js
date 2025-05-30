// Servidor simplificado para teste
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS simples para teste
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando!' });
});

// Frontend expects GET /api/products with query params
app.get('/api/products', async (req, res) => {
  try {
    const mercadoLivreService = require('./services/mercadoLivreService');
    const produtos = await mercadoLivreService.buscarProdutos(req.query);
    res.json({ produtos, pagina: 1, totalPaginas: 1 });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Frontend expects POST /api/recommend
app.post('/api/recommend', async (req, res) => {
  try {
    const mercadoLivreService = require('./services/mercadoLivreService');
    const produtos = await mercadoLivreService.buscarProdutos(req.body);
    
    // Generate a recommendation based on profile
    let sugestao = "Aqui estão algumas sugestões especiais para você!";
    if (req.body.idade) {
      if (req.body.idade < 18) {
        sugestao = "Produtos perfeitos para jovens!";
      } else if (req.body.idade > 50) {
        sugestao = "Presentes sofisticados para pessoas experientes!";
      }
    }
    if (req.body.genero === 'feminino') {
      sugestao = "Presentes especiais pensados para ela!";
    } else if (req.body.genero === 'masculino') {
      sugestao = "Presentes ideais pensados para ele!";
    }
    
    res.json({ sugestao, produtosRelacionados: produtos });
  } catch (error) {
    console.error('Erro ao recomendar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}/api/test`);
});

// Tratamento de erros
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada:', reason);
});
