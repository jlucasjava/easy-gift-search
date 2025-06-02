// Rotas de recomendação inteligente (OpenAI)
const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommendController');

router.post('/', recommendController.getRecommendation);

// Rota para recomendação randomizada
router.get('/random', recommendController.getRandomRecommendation);

module.exports = router;
