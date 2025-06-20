/**
 * Serviço Amazon (SIMULADO) - Mantido apenas para compatibilidade
 * NOTA: Este serviço está obsoleto e serve apenas para manter a compatibilidade
 * com os endpoints de teste. O projeto agora usa apenas Google Custom Search.
 */

/**
 * Simula uma busca na Amazon (função vazia para compatibilidade)
 */
async function searchProducts() {
  console.log('⚠️ AVISO: amazonService.searchProducts está obsoleto. Use googleSearchService.');
  return {
    success: false,
    message: 'Esta API não está mais disponível. O sistema agora usa apenas Google Custom Search.',
    items: []
  };
}

/**
 * Simula teste da API Amazon (função vazia para compatibilidade)
 */
async function testAPI() {
  console.log('⚠️ AVISO: amazonService.testAPI está obsoleto. Use googleSearchService.');
  return {
    success: false,
    status: 'desativado',
    message: 'Esta API não está mais disponível. O sistema agora usa apenas Google Custom Search.'
  };
}

module.exports = {
  searchProducts,
  testAPI
};
