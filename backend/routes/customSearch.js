const express = require('express');
const router = express.Router();
const customSearchController = require('../controllers/customSearchController');

/**
 * Rotas para o motor de busca personalizado
 */

/**
 * GET /api/custom-search/buscar
 * Busca usando o motor personalizado
 * Query: ?query=termo&precoMax=valor
 */
router.get('/buscar', customSearchController.buscarCustom);

/**
 * GET /api/custom-search/comparar
 * Busca comparativa entre Google e motor personalizado
 * Query: ?query=termo&precoMax=valor
 */
router.get('/comparar', customSearchController.buscaComparativa);

/**
 * GET /api/custom-search/limpar-cache
 * Limpa o cache do motor personalizado
 */
router.get('/limpar-cache', customSearchController.limparCache);

module.exports = router;
