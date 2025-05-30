// Rotas de autenticação Mercado Livre (OAuth)
const express = require('express');
const router = express.Router();
const mercadoLivreAuthController = require('../controllers/mercadoLivreAuthController');

// Inicia o fluxo OAuth (redireciona para Mercado Livre)
router.get('/login', mercadoLivreAuthController.login);
// Callback do Mercado Livre (troca code por token)
router.get('/callback', mercadoLivreAuthController.callback);

module.exports = router;
