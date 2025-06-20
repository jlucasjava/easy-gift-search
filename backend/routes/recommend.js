// Rotas de recomendação baseadas em Google Search
const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommendController');

// Rota principal para recomendações
router.post('/', recommendController.getRecommendation);

// Rota para recomendação randomizada
router.get('/random', recommendController.getRandomRecommendation);

// Rotas para gerenciamento de cache
router.post('/cache/clear', recommendController.clearCache);
router.get('/cache/stats', recommendController.getCacheStats);

module.exports = router;
