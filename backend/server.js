// server.js - Backend principal do Easy Gift Search
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS seguro: só permite frontend local e domínio de produção
const allowedOrigins = [
  'http://localhost:3000', // backend local
  'http://localhost:5500', // live-server local
  'http://127.0.0.1:5500',
  'http://localhost:8080',
  'https://easygiftsearch.com', // exemplo de domínio de produção
  'https://easy-gift.vercel.app' // domínio do frontend na Vercel
];
app.use(cors({
  origin: function (origin, callback) {
    // Permite requests sem origin (ex: mobile, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS não permitido para esta origem.'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Logs HTTP detalhados
app.use(morgan('combined'));

// Rate limiting: 100 requisições por 15 minutos por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { erro: 'Muitas requisições deste IP. Tente novamente mais tarde.' }
});
app.use(limiter);

// Rotas principais
const productRoutes = require('./routes/products');
const recommendRoutes = require('./routes/recommend');
const feedbackRoutes = require('./routes/feedback');

app.use('/api/products', productRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/', (req, res) => {
  res.send('Easy Gift Search API rodando!');
});

// Middleware de tratamento de erros centralizado
app.use((err, req, res, next) => {
  console.error('Erro:', err.message);
  res.status(err.status || 500).json({ erro: err.message || 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
