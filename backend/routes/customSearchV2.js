/**
 * Rotas para o motor de busca personalizado V2
 */

const express = require('express');
const router = express.Router();
const customSearchControllerV2 = require('../controllers/customSearchControllerV2');

/**
 * GET /api/custom-search-v2/buscar
 * Busca usando o motor personalizado V2
 * Query: ?query=termo&precoMax=valor&genero=masculino&idade=25
 */
router.get('/buscar', customSearchControllerV2.buscarPersonalizado);

/**
 * GET /api/custom-search-v2/comparar
 * Busca comparativa entre Google e motor personalizado V2
 * Query: ?query=termo&precoMax=valor
 */
router.get('/comparar', customSearchControllerV2.buscaComparativa);

/**
 * GET /api/custom-search-v2/limpar-cache
 * Limpa o cache do motor personalizado V2
 */
router.get('/limpar-cache', customSearchControllerV2.limparCache);

/**
 * GET /api/custom-search-v2/analisar-desempenho
 * Obtém métricas de desempenho do motor personalizado
 */
router.get('/analisar-desempenho', customSearchControllerV2.analisarDesempenho);

module.exports = router;
