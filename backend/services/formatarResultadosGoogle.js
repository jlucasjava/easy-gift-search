/**
 * Formata os resultados do Google para o formato esperado pelo frontend
 * @param {Array} resultados - Resultados do Google
 * @param {string} query - Query usada na busca
 * @param {number} pagina - Página atual
 * @param {number} numPorPagina - Número de resultados por página
 * @returns {Object} Resultados formatados
 */
function formatarResultadosGoogle(resultados, query, pagina = 1, numPorPagina = 10) {
  try {
    // Total simulado de resultados (Google limita a 100 no plano gratuito)
    const totalSimulado = Math.min(resultados.length * 10, 100);
    const totalPaginas = Math.ceil(totalSimulado / numPorPagina);
    
    // Formatar produtos para o padrão do frontend
    const produtos = resultados.map((item, index) => ({
      id: `google-${index}-${pagina}`,
      nome: item.title || 'Produto sem título',
      titulo: item.title || 'Produto sem título',
      descricao: item.snippet || '',
      preco: item.price || '',
      imagem: item.image || '',
      url: item.link || '#',
      marketplace: 'Google',
      categoria: extrairCategoriaGoogle(item.title, query)
    }));
    
    return {
      produtos,
      query,
      pagina,
      totalPaginas,
      totalResultados: totalSimulado,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`❌ Erro ao formatar resultados do Google: ${error.message}`);
    return {
      produtos: [],
      query,
      pagina: 1,
      totalPaginas: 1,
      totalResultados: 0,
      erro: error.message
    };
  }
}
