// Rotas de recomendação inteligente (OpenAI)
const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommendController');

router.post('/', recommendController.getRecommendation);

module.exports = router;
