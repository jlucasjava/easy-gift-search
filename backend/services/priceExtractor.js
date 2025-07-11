// Função para aprimorar a extração e filtragem de preços
// Adicionar ao hybridSearchService.js ou criar como módulo separado

/**
 * Extrai e normaliza preços de diferentes formatos
 * @param {string|number} priceStr - String ou número representando o preço
 * @returns {number|null} - Preço normalizado como número ou null se inválido
 */
function extractAndNormalizePrice(priceStr) {
  // Se já for um número, retorna diretamente
  if (typeof priceStr === 'number' && !isNaN(priceStr)) {
    return priceStr;
  }
  
  // Se for null, undefined ou não for string nem número
  if (!priceStr || (typeof priceStr !== 'string' && typeof priceStr !== 'number')) {
    return null;
  }
  
  // Converter para string para garantir
  const price = String(priceStr);
  
  try {
    // Padrões comuns de preço no Brasil
    const patterns = [
      // R$ 1.299,90
      { regex: /R\$\s*([\d.,]+)/i, process: (match) => match.replace('.', '').replace(',', '.') },
      // 1.299,90
      { regex: /([\d.]+),([\d]{2})/, process: (match) => match.replace('.', '').replace(',', '.') },
      // 1,299.90
      { regex: /([\d,]+)\.([\d]{2})/, process: (match) => match.replace(',', '') },
      // 1299.90
      { regex: /([\d]+)\.([\d]{2})/, process: (match) => match },
      // 1299,90
      { regex: /([\d]+),([\d]{2})/, process: (match) => match.replace(',', '.') },
      // 1299
      { regex: /^([\d]+)$/, process: (match) => match }
    ];
    
    // Testar cada padrão
    for (const pattern of patterns) {
      const match = price.match(pattern.regex);
      if (match) {
        const processed = pattern.process(match[0]);
        const numValue = parseFloat(processed);
        if (!isNaN(numValue)) {
          return numValue;
        }
      }
    }
    
    // Tentativa de extrair qualquer número do texto
    const anyNumberMatch = price.match(/[\d.,]+/);
    if (anyNumberMatch) {
      // Remover todos os caracteres não numéricos exceto ponto e vírgula
      const cleaned = anyNumberMatch[0].replace(/[^\d.,]/g, '');
      // Substituir vírgula por ponto para decimal
      const normalized = cleaned.replace(/,(\d{2})$/, '.$1').replace(/\./g, '');
      const numValue = parseFloat(normalized);
      if (!isNaN(numValue)) {
        return numValue;
      }
    }
    
    // Não foi possível extrair
    return null;
  } catch (error) {
    console.error('Erro ao extrair preço:', error);
    return null;
  }
}

/**
 * Filtra produtos por preço máximo de forma robusta
 * @param {Array} products - Lista de produtos
 * @param {number} maxPrice - Preço máximo para filtro
 * @returns {Array} - Produtos filtrados
 */
function filterByPriceRobust(products, maxPrice) {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }
  
  if (!maxPrice || isNaN(maxPrice) || maxPrice <= 0) {
    return products; // Sem filtro se o preço máximo for inválido
  }
  
  return products.filter(product => {
    // Extrair e normalizar o preço
    const normalizedPrice = extractAndNormalizePrice(product.price);
    
    // Registrar produtos com preço não extraído corretamente
    if (normalizedPrice === null) {
      console.warn(`Não foi possível extrair preço do produto: ${product.title}`);
      console.warn(`Formato do preço original: ${product.price}`);
      return false; // Excluir produtos sem preço
    }
    
    // Filtrar pelo preço máximo
    return normalizedPrice <= maxPrice;
  });
}

/**
 * Enriquece produtos com preços normalizados
 * @param {Array} products - Lista de produtos
 * @returns {Array} - Produtos com preços normalizados
 */
function enrichProductsWithNormalizedPrice(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }
  
  return products.map(product => {
    const normalizedPrice = extractAndNormalizePrice(product.price);
    
    return {
      ...product,
      originalPrice: product.price, // Manter o preço original
      price: normalizedPrice !== null ? normalizedPrice : product.price, // Atualizar com o preço normalizado
      normalizedPrice // Adicionar campo extra para ordenação
    };
  });
}

module.exports = {
  extractAndNormalizePrice,
  filterByPriceRobust,
  enrichProductsWithNormalizedPrice
};
