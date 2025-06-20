// Rotas para monitoramento da API
const express = require('express');
const router = express.Router();
const monitorController = require('../controllers/monitorController');

// Rota para verificar quota da API
router.get('/quota', monitorController.checkApiQuota);

// Rotas para gerenciamento de cache
router.get('/cache', monitorController.getCacheStats);
router.post('/cache/clear', monitorController.clearCache);

module.exports = router;
