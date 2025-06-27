/**
 * Rotas para o Motor de Busca Híbrido
 */

const express = require('express');
const router = express.Router();
const hybridSearchController = require('../controllers/hybridSearchController');

/**
 * GET /api/hybrid-search/buscar
 * Busca produtos usando o motor híbrido
 * 
 * Parâmetros:
 * - query: termo de busca
 * - categoria: categoria do produto
 * - precoMin: preço mínimo
 * - precoMax: preço máximo
 * - idade: idade para filtrar presentes
 * - genero: gênero para filtrar presentes
 * - num: número máximo de resultados
 */
router.get('/buscar', hybridSearchController.buscarProdutos);

/**
 * GET /api/hybrid-search/limpar-cache
 * Limpa o cache do motor de busca
 */
router.get('/limpar-cache', hybridSearchController.limparCache);

/**
 * GET /api/hybrid-search/estatisticas-cache
 * Obtém estatísticas do cache
 */
router.get('/estatisticas-cache', hybridSearchController.obterEstatisticasCache);

module.exports = router;
