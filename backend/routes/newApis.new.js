const express = require('express');
const router = express.Router();
const newApisController = require('../controllers/newApisController');

/**
 * Rotas para as novas APIs integradas:
 * - Google Search APIs (2 versões)
 */

// ===== ROTAS GOOGLE SEARCH =====

/**
 * GET /api/new-apis/google/buscar
 * Busca usando Google Search APIs
 * Query: ?query=termo&api=1|2|both
 */
router.get('/google/buscar', newApisController.buscarGoogle);

// ===== ROTAS INTEGRADAS =====

/**
 * GET /api/new-apis/busca-integrada
 * Busca combinando APIs do Google
 * Query: ?query=termo&categoria=categoria&idade=idade&genero=genero
 */
router.get('/busca-integrada', newApisController.buscaIntegrada);

/**
 * GET /api/new-apis/teste-todas
 * Testa todas as APIs configuradas
 */
router.get('/teste-todas', newApisController.testeAPIs);

/**
 * GET /api/new-apis/info
 * Informações sobre as APIs disponíveis
 */
router.get('/info', newApisController.apiInfo);

module.exports = router;
