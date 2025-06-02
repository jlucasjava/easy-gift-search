// Arquivo de internacionalização (i18n) para Easy Gift Search
// Exemplo de estrutura para PT e EN
window.I18N_STRINGS = {
  pt: {
    buscar: 'Buscar',
    favoritos: 'Favoritos',
    resultados: 'Resultados',
    recomendacao: 'Recomendação Inteligente',    nenhum_produto: 'Nenhum produto encontrado para os filtros selecionados.',
    nenhum_favorito: 'Nenhum favorito ainda.',
    ver_marketplace: 'Ver no marketplace',
    favoritar: 'Favoritar',
    remover: 'Remover',
    historico: 'Histórico de buscas',
    preco_min: 'Preço mínimo',
    preco_max: 'Preço máximo',
    idade: 'Idade',
    genero: 'Gênero',
    masculino: 'Masculino',    feminino: 'Feminino',
    unissex: 'Unissex',
    carregando: 'Carregando...',
    benvindo_titulo: 'Bem-vindo ao Easy Gift Search!',
    benvindo_descricao: 'Encontre o presente perfeito usando nossa busca inteligente.',
    benvindo_instrucoes: 'Preencha os filtros acima e clique em "Buscar" para começar.',
    recomendacao_inicial: 'Faça uma busca para receber recomendações personalizadas! 🤖'
  },
  en: {
    buscar: 'Search',
    favoritos: 'Favorites',
    resultados: 'Results',
    recomendacao: 'Smart Recommendation',    nenhum_produto: 'No products found for the selected filters.',
    nenhum_favorito: 'No favorites yet.',
    ver_marketplace: 'View on marketplace',
    favoritar: 'Add to favorites',
    remover: 'Remove',
    historico: 'Search history',
    preco_min: 'Min price',
    preco_max: 'Max price',
    idade: 'Age',
    genero: 'Gender',
    masculino: 'Male',    feminino: 'Female',
    unissex: 'Unisex',
    carregando: 'Loading...',
    benvindo_titulo: 'Welcome to Easy Gift Search!',
    benvindo_descricao: 'Find the perfect gift using our intelligent search.',
    benvindo_instrucoes: 'Fill in the filters above and click "Search" to get started.',
    recomendacao_inicial: 'Make a search to receive personalized recommendations! 🤖'
  }
};

// Função de tradução
function getCurrentLanguage() {
  return localStorage.getItem('language') || 'pt';
}

function t(key, fallback = null) {
  const currentLang = getCurrentLanguage();
  const translations = window.I18N_STRINGS[currentLang] || window.I18N_STRINGS.pt;
  
  if (translations && translations[key]) {
    return translations[key];
  }
  
  // Fallback para português se não encontrar na língua atual
  if (currentLang !== 'pt' && window.I18N_STRINGS.pt && window.I18N_STRINGS.pt[key]) {
    return window.I18N_STRINGS.pt[key];
  }
  
  // Se ainda não encontrar, retorna o fallback ou a própria chave
  return fallback || key;
}

// Função para alterar idioma
function setLanguage(lang) {
  localStorage.setItem('language', lang);
  // Recarregar a página para aplicar as mudanças
  location.reload();
}
