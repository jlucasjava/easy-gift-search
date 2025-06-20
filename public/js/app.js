// Troque para a URL do backend de produção ao publicar!
// Exemplo: const API_URL = 'https://api.seudominio.com/api';
const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://easy-gift-search.onrender.com/api';

// Configurações globais para exibição de resultados
const CONFIG = {
  placeholderImage: '/images/placeholder.jpg',
  defaultPrice: 'Consultar',
  maxTitleLength: 60, // Limitar títulos muito longos
  defaultSearchParams: {
    num: 10, // Número de resultados por página
    page: 1  // Página inicial
  },
  paginationLimit: 5, // Número de botões de página a exibir
  skeletonCount: 6 // Número de cards skeleton a exibir durante carregamento
};

// Estado global da aplicação
const APP_STATE = {
  currentPage: 1,
  totalPages: 1,
  lastSearchParams: {},
  isLoading: false,
  favorites: loadFavorites()
};

function showLoader(show) {
  document.getElementById('loader').style.display = show ? 'block' : 'none';
  APP_STATE.isLoading = show;
  
  // Também mostrar/esconder skeleton loaders
  toggleSkeletonLoaders(show);
}

function toggleSkeletonLoaders(show) {
  const grid = document.getElementById('grid');
  const skeletonContainer = document.getElementById('skeleton-container');
  
  if (!skeletonContainer) return;
  
  if (show) {
    // Limpar grid atual
    grid.style.display = 'none';
    
    // Mostrar skeletons
    skeletonContainer.style.display = 'grid';
    skeletonContainer.innerHTML = '';
    
    // Criar skeleton cards
    for (let i = 0; i < CONFIG.skeletonCount; i++) {
      const skeletonCard = document.createElement('div');
      skeletonCard.className = 'skeleton-card';
      skeletonCard.innerHTML = `
        <div class="skeleton-img"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-price"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-button"></div>
      `;
      skeletonContainer.appendChild(skeletonCard);
    }
  } else {
    // Esconder skeletons e mostrar grid
    if (skeletonContainer) skeletonContainer.style.display = 'none';
    grid.style.display = 'grid';
  }
}

function showMensagem(msg, isErro = false) {
  const el = document.getElementById('mensagem');
  el.textContent = msg;
  el.style.display = msg ? 'block' : 'none';
  el.style.color = isErro ? '#d32f2f' : '#4e54c8';
}

function clearMensagem() {
  showMensagem('');
}

// Função para mostrar/esconder seções
function mostrarSecao(secaoId) {
  // Esconder todas as seções principais
  const secoes = ['produtos', 'favoritos', 'locais'];
  secoes.forEach(id => {
    const secao = document.getElementById(id);
    if (secao) {
      secao.style.display = 'none';
    }
  });
  
  // Mostrar a seção solicitada
  const secaoAlvo = document.getElementById(secaoId);
  if (secaoAlvo) {
    secaoAlvo.style.display = '';
  }
  
  // Atualizar botões de navegação
  const botoes = document.querySelectorAll('.tab-btn');
  botoes.forEach(btn => btn.classList.remove('active'));
  
  const btnMap = {
    'produtos': 'btnVerResultados',
    'favoritos': 'btnVerFavoritos', 
    'locais': 'btnVerLocais'
  };
  
  const btnAtivo = document.getElementById(btnMap[secaoId]);
  if (btnAtivo) {
    btnAtivo.classList.add('active');
  }
}

// Busca produtos
async function buscarProdutos(params = {}) {
  showLoader(true);
  clearMensagem();
  
  // Atualizar estado da aplicação
  APP_STATE.lastSearchParams = {...params};
  APP_STATE.currentPage = params.page || CONFIG.defaultSearchParams.page;
  
  // Analytics: Track search with filters
  if (window.analyticsService) {
    const query = params.query || 'busca_geral';
    const filters = {
      max_price: params.precoMax || null,
      age: params.idade || null,
      gender: params.genero || null,
      page: params.page || 1
    };
    window.analyticsService.trackSearch(query, filters);
    
    // Track filter usage if any filters are applied
    if (params.precoMax) {
      window.analyticsService.trackFilterUsage('price_max', params.precoMax);
    }
    if (params.idade) {
      window.analyticsService.trackFilterUsage('age', params.idade);
    }
    if (params.genero) {
      window.analyticsService.trackFilterUsage('gender', params.genero);
    }
  }
  
  try {
    // Garantir query não vazia para a API do Google
    if (!params.query && params.genero) {
      params.query = `presente para ${params.genero}`;
    } else if (!params.query && params.idade) {
      params.query = `presente para ${params.idade} anos`;
    } else if (!params.query) {
      params.query = 'presentes';
    }
    
    // Adicionar parâmetros padrão
    const searchParams = {
      ...CONFIG.defaultSearchParams,
      ...params
    };
    
    // Registrar consulta no console para debug
    console.log('🔍 Buscando produtos com parâmetros:', searchParams);
    
    // Usar endpoint correto para a versão Google-only
    const query = new URLSearchParams(searchParams).toString();
    const res = await fetch(`${API_URL}/products/search?${query}`);
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.erro || 'Erro ao buscar produtos.');
    }
    
    const data = await res.json();
    
    // Validar dados recebidos
    if (!data.produtos || !Array.isArray(data.produtos)) {
      console.warn('⚠️ API retornou formato inesperado:', data);
      throw new Error('Formato de resposta inválido');
    }
    
    // Atualizar estado da paginação
    APP_STATE.totalPages = data.totalPaginas || 1;
    APP_STATE.currentPage = data.pagina || 1;
    
    // Log para debug
    console.log(`✅ Recebidos ${data.produtos?.length || 0} produtos da API (página ${APP_STATE.currentPage}/${APP_STATE.totalPages})`);
    
    // Renderizar controles de paginação
    renderPagination(APP_STATE.currentPage, APP_STATE.totalPages);
    
    return data;
  } catch (e) {
    console.error('❌ Erro na API:', e);
    
    // Analytics: Track error
    if (window.analyticsService) {
      window.analyticsService.trackError('API_Error', e.message, 'buscarProdutos');
    }
    
    showMensagem(`Erro ao buscar produtos: ${e.message}. Tente novamente.`, true);
    return { produtos: [], pagina: 1, totalPaginas: 1 };
  } finally {
    showLoader(false);
  }
}

// Renderiza grid de produtos
function renderGrid(produtos) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  
  // Filtrar produtos com url válida (começa com http)
  const produtosValidos = (produtos || []).filter(prod => prod.url && /^https?:\/\//.test(prod.url));
  
  if (!produtosValidos.length) {
    showMensagem(t('nenhum_produto'));
    return;
  }
  
  clearMensagem();
  
  produtosValidos.forEach((prod, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    
    // Garantir que os valores existem e são válidos
    const nomeProduto = formatarTitulo(prod.nome || prod.titulo || 'Produto sem nome');
    const precoProduto = formatarPreco(prod.preco);
    const imagemProduto = validarImagem(prod.imagem);
    const urlProduto = prod.url || '#';
    const idProduto = prod.id || Math.random().toString(36).substr(2, 9);
    const marketplaceProduto = prod.marketplace || 'Google';
    const descricaoProduto = prod.descricao || '';
    
    // Escapar aspas simples nos nomes para evitar erros JavaScript
    const nomeEscapado = nomeProduto.replace(/'/g, "\\'");
    
    // Adicionar badge de origem com classe específica para o Google
    const badgeClass = marketplaceProduto.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const badgeHTML = `<span class="origem-badge ${badgeClass}-badge">${marketplaceProduto}</span>`;
    
    // Adicionar detalhes de preço com tratamento para preço não disponível
    const precoHTML = precoProduto ? 
      `<p class="preco-produto">${precoProduto}</p>` : 
      `<p class="preco-indisponivel">${CONFIG.defaultPrice}</p>`;
    
    // Indicador de envio grátis (aleatório para demonstração)
    const showFreeShipping = Math.random() > 0.7; // 30% de chance de mostrar frete grátis
    const freeShippingHTML = showFreeShipping ? 
      '<span class="free-shipping-badge">Frete Grátis</span>' : '';
    
    card.innerHTML = `
      <div class="card-image-container">
        <img src="${imagemProduto}" alt="${nomeProduto}" loading="lazy" onerror="this.onerror=null;this.src='${CONFIG.placeholderImage}';">
        ${badgeHTML}
        ${freeShippingHTML}
      </div>
      <h3 title="${nomeProduto}">${nomeProduto}</h3>
      ${precoHTML}
      <p class="card-description">${truncateText(descricaoProduto, 100)}</p>
      <div class="card-actions">
        <a href="${urlProduto}" target="_blank" class="btn-view" 
           onclick="trackProductClick('${idProduto}', '${nomeEscapado}', '${precoProduto || 'N/A'}', '${marketplaceProduto}', ${index}, '${urlProduto}')">
           Ver Produto
        </a>
        <button onclick="favoritarProduto('${idProduto}', '${nomeEscapado}')" class="btn-favoritar">
          ${t('favoritar')}
        </button>
      </div>
    `;
    
    // Analytics: Track product view
    if (window.analyticsService) {
      window.analyticsService.trackProductView(prod.id, prod.nome, prod.preco, prod.marketplace);
    }
    
    grid.appendChild(card);
  });
  
  // Exibir botões de favoritar
  const favBtns = document.querySelectorAll('.btn-favoritar');
  favBtns.forEach(btn => btn.style.display = 'inline-block');
}

// Funções auxiliares para formatação dos dados

// Formata o título do produto
function formatarTitulo(titulo) {
  if (!titulo) return 'Produto';
  
  // Remover excesso de "- " que é comum nos títulos do Google
  const tituloLimpo = titulo.replace(/\s-\s/g, ' ').replace(/\s{2,}/g, ' ').trim();
  
  // Limitar tamanho
  if (tituloLimpo.length > CONFIG.maxTitleLength) {
    return tituloLimpo.substring(0, CONFIG.maxTitleLength) + '...';
  }
  
  return tituloLimpo;
}

// Valida e formata o preço
function formatarPreco(preco) {
  if (!preco) return CONFIG.defaultPrice;
  
  // Se já estiver no formato R$ XX,XX, usar como está
  if (typeof preco === 'string' && preco.includes('R$')) {
    // Padronizar formato para R$ XX,XX
    return preco.replace(/R\$\s*(\d+)[,\.](\d+)/, 'R$ $1,$2');
  }
  
  // Se for número, formatar corretamente
  if (typeof preco === 'number') {
    return `R$ ${preco.toFixed(2).replace('.', ',')}`;
  }
  
  // Caso seja string sem R$, adicionar
  return `R$ ${preco}`;
}

// Valida URL da imagem
function validarImagem(url) {
  if (!url) return CONFIG.placeholderImage;
  
  // Verificar se a URL é válida
  if (!url.match(/^https?:\/\//i)) {
    return CONFIG.placeholderImage;
  }
  
  // Verificar URLs de imagens quebradas conhecidas
  const urlsBloqueadas = [
    'data:image',
    'placeholder.com',
    'blank.gif'
  ];
  
  for (const urlBloqueada of urlsBloqueadas) {
    if (url.includes(urlBloqueada)) {
      return CONFIG.placeholderImage;
    }
  }
  
  // Verificar se é uma URL de imagem conhecida
  if (url.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
    return url;
  }
  
  // URL que não termina com extensão de imagem mas pode ser válida
  return url;
}

// Trunca texto para exibição
function truncateText(text, maxLength) {
  if (!text) return '';
  
  // Remover caracteres HTML e excesso de espaços
  const textoLimpo = text.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim();
  
  if (textoLimpo.length <= maxLength) return textoLimpo;
  
  // Truncar no último espaço completo para não cortar palavras
  const truncado = textoLimpo.substring(0, maxLength);
  const ultimoEspaco = truncado.lastIndexOf(' ');
  
  if (ultimoEspaco > maxLength * 0.8) { // Se o último espaço estiver a pelo menos 80% do tamanho máximo
    return truncado.substring(0, ultimoEspaco) + '...';
  }
  
  return truncado + '...';
}

// Global function for tracking product clicks
window.trackProductClick = function(productId, productName, price, marketplace, position, url) {
  if (window.analyticsService) {
    window.analyticsService.trackProductClick(productId, productName, price, marketplace, position);
    window.analyticsService.trackConversion(productId, productName, price, marketplace, url);
  }
};

// Favoritos persistentes no localStorage
function getFavoritos() {
  return JSON.parse(localStorage.getItem('favoritos') || '[]');
}
function setFavoritos(favs) {
  localStorage.setItem('favoritos', JSON.stringify(favs));
}

window.favoritarProduto = function(id, nome) {
  // Busca o produto no grid atual
  const grid = document.getElementById('grid');
  const card = Array.from(grid.children).find(c => c.querySelector('h3')?.textContent === nome);
  if (!card) return;
  
  // Extrair dados do card
  const img = card.querySelector('img')?.src || CONFIG.placeholderImage;
  const precoElement = card.querySelector('.preco-produto, .preco-indisponivel');
  const preco = precoElement ? precoElement.textContent : CONFIG.defaultPrice;
  const url = card.querySelector('a')?.href || '#';
  const descricao = card.querySelector('.card-description')?.textContent || '';
  const marketplace = card.querySelector('.origem-badge')?.textContent || 'Google';
  
  // Verificar se já existe nos favoritos
  const favs = getFavoritos();
  if (favs.some(f => f.id === id)) {
    showMensagem(`Produto "${nome}" já está nos favoritos!`);
    setTimeout(clearMensagem, 2000);
    return;
  }
  
  // Adicionar aos favoritos com dados completos
  favs.push({ 
    id, 
    nome, 
    preco, 
    imagem: img, 
    url,
    descricao,
    marketplace
  });
  
  setFavoritos(favs);
  showMensagem(`Produto "${nome}" adicionado aos favoritos!`);
  
  // Analytics: Track add to favorites
  if (window.analyticsService) {
    window.analyticsService.trackAddToFavorites(id, nome, preco, marketplace);
  }
  
  // Atualizar contador de favoritos, se existir
  const countBadge = document.getElementById('favoritosCount');
  if (countBadge) {
    countBadge.textContent = favs.length;
    countBadge.style.display = favs.length > 0 ? 'inline-block' : 'none';
  }
  
  setTimeout(clearMensagem, 2000);
};

function renderFavoritos() {
  const favs = getFavoritos();
  const grid = document.getElementById('gridFavoritos');
  grid.innerHTML = '';
  
  if (!favs.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:#888;">${t('nenhum_favorito')}</div>`;
    return;
  }
  
  favs.forEach((prod, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    
    // Garantir que os valores existem e são válidos
    const nomeProduto = formatarTitulo(prod.nome || 'Produto sem nome');
    const precoProduto = prod.preco || CONFIG.defaultPrice;
    const imagemProduto = validarImagem(prod.imagem);
    const urlProduto = prod.url || '#';
    const idProduto = prod.id || Math.random().toString(36).substr(2, 9);
    const marketplaceProduto = prod.marketplace || 'Google';
    const descricaoProduto = prod.descricao || '';
    
    // Adicionar badge de origem
    const badgeClass = marketplaceProduto.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const badgeHTML = `<span class="origem-badge ${badgeClass}-badge">${marketplaceProduto}</span>`;
    
    card.innerHTML = `
      <div class="card-image-container">
        <img src="${imagemProduto}" alt="${nomeProduto}" loading="lazy" onerror="this.onerror=null;this.src='${CONFIG.placeholderImage}';">
        ${badgeHTML}
      </div>
      <h3 title="${nomeProduto}">${nomeProduto}</h3>
      <p class="preco-produto">${precoProduto}</p>
      <p class="card-description">${truncateText(descricaoProduto, 80)}</p>
      <div class="card-actions">
        <a href="${urlProduto}" target="_blank" class="btn-view" 
           onclick="trackProductClick('${idProduto}', '${nomeProduto.replace(/'/g, "\\'")}', '${precoProduto}', '${marketplaceProduto}', ${index}, '${urlProduto}')">
           Ver Produto
        </a>
        <button onclick="removerFavorito('${idProduto}')" class="btn-remover">
          ${t('remover')}
        </button>
      </div>
    `;
    
    grid.appendChild(card);
  });
  
  // Atualizar contador de favoritos, se existir
  const countBadge = document.getElementById('favoritosCount');
  if (countBadge) {
    countBadge.textContent = favs.length;
    countBadge.style.display = favs.length > 0 ? 'inline-block' : 'none';
  }
}

// Renderiza paginação
function renderPaginacao(pagina, totalPaginas, params) {
  const pagDiv = document.getElementById('paginacao');
  pagDiv.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === pagina) btn.disabled = true;
    btn.onclick = () => carregarProdutos({ ...params, page: i });
    pagDiv.appendChild(btn);
  }
}

// Funções para paginação e navegação

// Renderiza controles de paginação
function renderPagination(currentPage, totalPages) {
  const paginationContainer = document.getElementById('pagination-container');
  if (!paginationContainer) return;
  
  // Limpar container de paginação
  paginationContainer.innerHTML = '';
  
  // Se só há uma página, não mostrar controles
  if (totalPages <= 1) {
    paginationContainer.style.display = 'none';
    return;
  }
  
  paginationContainer.style.display = 'flex';
  
  // Botão anterior
  const prevButton = document.createElement('button');
  prevButton.classList.add('pagination-button');
  prevButton.innerHTML = '&laquo;';
  prevButton.disabled = currentPage <= 1;
  prevButton.addEventListener('click', () => changePage(currentPage - 1));
  paginationContainer.appendChild(prevButton);
  
  // Determinar quais botões de página mostrar
  let startPage = Math.max(1, currentPage - Math.floor(CONFIG.paginationLimit / 2));
  let endPage = Math.min(totalPages, startPage + CONFIG.paginationLimit - 1);
  
  // Ajustar startPage se não tivermos botões suficientes à direita
  if (endPage - startPage + 1 < CONFIG.paginationLimit) {
    startPage = Math.max(1, endPage - CONFIG.paginationLimit + 1);
  }
  
  // Botão para primeira página se não estiver no início
  if (startPage > 1) {
    const firstPageButton = document.createElement('button');
    firstPageButton.classList.add('pagination-button');
    firstPageButton.textContent = '1';
    firstPageButton.addEventListener('click', () => changePage(1));
    paginationContainer.appendChild(firstPageButton);
    
    // Adicionar ellipsis se houver gap
    if (startPage > 2) {
      const ellipsis = document.createElement('span');
      ellipsis.classList.add('pagination-ellipsis');
      ellipsis.textContent = '...';
      paginationContainer.appendChild(ellipsis);
    }
  }
  
  // Botões de página numerados
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.classList.add('pagination-button');
    if (i === currentPage) pageButton.classList.add('active');
    pageButton.textContent = i;
    pageButton.addEventListener('click', () => changePage(i));
    paginationContainer.appendChild(pageButton);
  }
  
  // Botão para última página se não estiver no final
  if (endPage < totalPages) {
    // Adicionar ellipsis se houver gap
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement('span');
      ellipsis.classList.add('pagination-ellipsis');
      ellipsis.textContent = '...';
      paginationContainer.appendChild(ellipsis);
    }
    
    const lastPageButton = document.createElement('button');
    lastPageButton.classList.add('pagination-button');
    lastPageButton.textContent = totalPages;
    lastPageButton.addEventListener('click', () => changePage(totalPages));
    paginationContainer.appendChild(lastPageButton);
  }
  
  // Botão próximo
  const nextButton = document.createElement('button');
  nextButton.classList.add('pagination-button');
  nextButton.innerHTML = '&raquo;';
  nextButton.disabled = currentPage >= totalPages;
  nextButton.addEventListener('click', () => changePage(currentPage + 1));
  paginationContainer.appendChild(nextButton);
  
  // Informação de página atual
  const pageInfo = document.createElement('div');
  pageInfo.classList.add('pagination-info');
  pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
  paginationContainer.appendChild(pageInfo);
}

// Muda para a página especificada
async function changePage(page) {
  if (page === APP_STATE.currentPage || APP_STATE.isLoading) return;
  
  // Scroll para o topo
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Buscar produtos da nova página
  const params = {
    ...APP_STATE.lastSearchParams,
    page: page
  };
  
  const data = await buscarProdutos(params);
  renderGrid(data.produtos);
}

// Implementação do botão Voltar ao Topo
function setupBackToTopButton() {
  const backToTopBtn = document.createElement('div');
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.innerHTML = '<i class="fa fa-arrow-up"></i>';
  document.body.appendChild(backToTopBtn);
  
  // Mostrar/esconder o botão baseado na posição do scroll
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });
  
  // Scrollar para o topo ao clicar
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Sistema de notificações
function showNotification(message, type = 'info', duration = 3000) {
  // Remover notificações existentes
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => {
    notification.remove();
  });
  
  // Criar nova notificação
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  const title = type.charAt(0).toUpperCase() + type.slice(1);
  notification.innerHTML = `
    <div class="notification-title">${title}</div>
    <div class="notification-message">${message}</div>
  `;
  
  document.body.appendChild(notification);
  
  // Mostrar com animação
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Remover após duração
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, duration);
}

// =============================================================================
// SIMPLIFIED FUNCTIONALITY - GOOGLE SEARCH ONLY
// =============================================================================

// Current active locations and data
let currentLocais = [];

// ===== LOCATION-BASED SERVICES =====

/**
 * Busca informações para a seção "Onde Comprar"
 * Versão simplificada que não utiliza API externa
 */
async function buscarLojasProximas(cidade, categoria = 'loja de presentes') {
  try {
    // Versão simplificada - não usa mais API externa
    // Lista estática de sugestões de onde comprar
    const lojasRecomendadas = [
      {
        nome: "Lojas Online",
        endereco: "Várias opções de e-commerce",
        tipo: "online",
        website: "https://shopping.google.com/",
        rating: "4.5"
      },
      {
        nome: "Lojas de Departamento",
        endereco: `Verifique lojas próximas em ${cidade || 'sua cidade'}`,
        tipo: "fisico",
        rating: "4.0"
      },
      {
        nome: "Shopping Centers",
        endereco: `Consulte shopping centers em ${cidade || 'sua região'}`,
        tipo: "fisico"
      }
    ];
    
    currentLocais = lojasRecomendadas;
    renderLocais();
    
    // Analytics: Track location search
    if (window.analyticsService) {
      window.analyticsService.trackEvent('location_search', 'local_data', cidade, {
        categoria,
        resultados: currentLocais.length
      });
    }
    
    return { sucesso: true, mensagem: "Dados carregados com sucesso" };
  } catch (error) {
    console.error("Erro ao carregar dados de lojas:", error);
    showMensagem("Erro ao carregar informações de lojas. Tente novamente.");
    return { sucesso: false, erro: error.message };
  }
}

/**
 * Busca shopping centers
 * Versão simplificada que não utiliza API externa
 */
async function buscarShoppings(cidade) {
  try {
    // Versão simplificada com dados estáticos
    const shoppingsRecomendados = [
      {
        nome: "Shopping Online",
        endereco: "Compre online pela internet",
        tipo: "online",
        website: "https://shopping.google.com/",
        rating: "4.8"
      },
      {
        nome: `Shopping Center em ${cidade || 'sua cidade'}`,
        endereco: `Centro comercial em ${cidade || 'sua região'}`,
        tipo: "fisico",
        rating: "4.2"
      }
    ];
    
    currentLocais = shoppingsRecomendados;
    renderLocais();
    
    // Analytics: Track shopping center search
    if (window.analyticsService) {
      window.analyticsService.trackEvent('shopping_search', 'local_data', cidade, {
        resultados: currentLocais.length
      });
    }
      return { sucesso: true, mensagem: "Dados carregados com sucesso" };
  } catch (error) {
    console.error("Erro ao carregar dados de shoppings:", error);
    showMensagem("Erro ao carregar informações de shopping centers. Tente novamente.");
    return { sucesso: false, erro: error.message };
  }
}

/**
 * Renderiza a lista de locais (lojas/shoppings)
 */
function renderLocais() {
  const gridLocais = document.getElementById('gridLocais');
  const mapaInfo = document.getElementById('mapaInfo');
  
  // Mostrar informações do mapa/busca
  if (currentMapaInfo) {
    mapaInfo.innerHTML = `
      <strong>📍 ${currentMapaInfo.cidade || 'Localização'}</strong><br>
      <small>Encontrados ${currentLocais.length} estabelecimentos próximos</small>
      ${currentMapaInfo.coordenadas ? `<br><small>📊 Área de busca: ${currentMapaInfo.coordenadas}</small>` : ''}
    `;
  }
  
  // Limpar grid
  gridLocais.innerHTML = '';
  
  if (!currentLocais.length) {
    gridLocais.innerHTML = `
      <div style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#888;padding:2rem;min-height:200px;width:100%;">
        <div style='display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;max-width:700px;margin:0 auto;'>          <p style="font-size:1.3rem;font-weight:600;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;">
            <img src='/images/placeholder.jpg' alt='' style='width:32px;height:32px;vertical-align:middle;margin-right:0.3rem;'> Nenhuma loja encontrada na região
          </p>
          <small style="font-size:1.08rem;margin-bottom:1.2rem;color:#666;">Você pode comprar online no Google Shopping:</small>
          <div style="display:flex;flex-wrap:wrap;gap:1rem;justify-content:center;">
            <a href='https://shopping.google.com/' target='_blank' rel='noopener' style='background:#4285f4;color:#fff;padding:0.7rem 1.2rem;border-radius:8px;font-weight:600;text-decoration:none;min-width:140px;text-align:center;'>Google Shopping</a>
          </div>
        </div>
      </div>
    `;
    return;
  }
  
  // Renderizar cada local
  currentLocais.forEach((local, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.position = 'relative';
    
    // Determinar tipo de estabelecimento
    const tipoIcon = local.tipo === 'shopping' ? '🏬' : '🏪';
    const rating = local.rating ? `⭐ ${local.rating}` : '';
    const endereco = local.endereco || local.address || 'Endereço não disponível';
    
    card.innerHTML = `
      <div style="padding: 1rem;">
        <h3 style="margin: 0 0 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
          ${tipoIcon} ${local.nome || local.name || 'Estabelecimento'}
        </h3>
        <p style="margin: 0.25rem 0; color: #666; font-size: 0.9rem;">
          📍 ${endereco}
        </p>
        ${rating ? `<p style="margin: 0.25rem 0; color: #f59e0b; font-size: 0.9rem;">${rating}</p>` : ''}
        ${local.telefone ? `<p style="margin: 0.25rem 0; color: #666; font-size: 0.9rem;">📞 ${local.telefone}</p>` : ''}
        ${local.horarios ? `<p style="margin: 0.25rem 0; color: #666; font-size: 0.85rem;">🕒 ${local.horarios}</p>` : ''}

        <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">          ${local.website ? `<a href="${local.website}" target="_blank" rel="noopener noreferrer" style="flex: 1; min-width: 100px; text-align: center; padding: 0.5rem; background: var(--primary-color); color: white; text-decoration: none; border-radius: 4px; font-size: 0.9rem;">🌐 Site</a>` : ''}
        </div>
      </div>
    `;
    
    // Analytics: Track location view
    card.addEventListener('click', () => {
      if (window.analyticsService) {
        window.analyticsService.trackEvent('location_view', 'user_interaction', local.nome || local.name, {
          tipo: local.tipo,
          rating: local.rating,
          position: index
        });
      }
    });
    
    gridLocais.appendChild(card);
  });
}

// ===== TAB SWITCHING WITH NEW LOCATIONS TAB =====

/**
 * Configurar navegação entre abas incluindo nova aba de locais
 */
function configurarNavegacaoAbas() {
  const btnVerResultados = document.getElementById('btnVerResultados');
  const btnVerFavoritos = document.getElementById('btnVerFavoritos');
  const btnVerLocais = document.getElementById('btnVerLocais');
  const secResultados = document.getElementById('produtos');
  const secFavoritos = document.getElementById('favoritos');
  const secLocais = document.getElementById('locais');
  function esconderTodasSecoes() {
    secResultados.style.display = 'none';
    secFavoritos.style.display = 'none';
    secLocais.style.display = 'none';
  }
  function removerActiveButtons() {
    [btnVerResultados, btnVerFavoritos, btnVerLocais].forEach(btn => {
      btn.classList.remove('active');
    });
  }
  btnVerResultados.onclick = () => {
    esconderTodasSecoes();
    removerActiveButtons();
    secResultados.style.display = '';
    btnVerResultados.classList.add('active');
    if (window.analyticsService) {
      window.analyticsService.trackEvent('tab_switch', 'navigation', 'resultados');
    }
  };
  btnVerFavoritos.onclick = () => {
    esconderTodasSecoes();
    removerActiveButtons();
    secFavoritos.style.display = '';
    btnVerFavoritos.classList.add('active');
    renderFavoritos();
    if (window.analyticsService) {
      window.analyticsService.trackEvent('tab_switch', 'navigation', 'favoritos');
    }
  };
  btnVerLocais.onclick = async () => {
    esconderTodasSecoes();
    removerActiveButtons();
    secLocais.style.display = '';
    btnVerLocais.classList.add('active');
    document.getElementById('mapaInfo').innerHTML = `<strong>📍 Localizando...</strong><br><small>Tentando detectar sua localização para buscar lojas e shoppings próximos.</small>`;

    if (!navigator.geolocation) {
      document.getElementById('mapaInfo').innerHTML = `<strong>📍 Localização não suportada</strong><br><small>Seu navegador não suporta geolocalização. Informe a cidade manualmente.</small>`;
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      try {
        // Buscar cidade via API Nominatim diretamente (eliminando dependência do backend)
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pt-BR`;
        const res = await fetch(nominatimUrl, {
          headers: { 'User-Agent': 'EasyGiftSearch/1.0 (contato@easygift.com)' }
        });
        if (!res.ok) throw new Error('Erro ao obter cidade');
        let data;
        let rawText = await res.text();
        try {
          data = JSON.parse(rawText);
        } catch (jsonErr) {
          // Se não for JSON, mostrar o texto bruto para debug
          console.error('Resposta inesperada da API Nominatim (esperado JSON):', rawText);
          document.getElementById('mapaInfo').innerHTML = `<strong>📍 Erro ao identificar localização</strong><br><small>Resposta inesperada da API Nominatim. Veja o console para detalhes.</small>`;
          return;
        }
        // Extrair cidade e estado de address
        const cidade = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || data.address?.county || '';
        const estado = data.address?.state || '';
        if (!cidade) {
          document.getElementById('mapaInfo').innerHTML = `<strong>📍 Não foi possível identificar sua cidade</strong><br><small>Tente novamente ou permita o acesso à localização.</small>`;
          return;
        }
        // Buscar lojas e shoppings próximos automaticamente
        await buscarLojasProximas(cidade);
        await buscarShoppings(cidade, estado);
      } catch (e) {
        document.getElementById('mapaInfo').innerHTML = `<strong>📍 Erro ao identificar localização</strong><br><small>${e.message}</small>`;
      }
    }, (err) => {
      document.getElementById('mapaInfo').innerHTML = `<strong>📍 Permissão negada</strong><br><small>Não foi possível acessar sua localização. Permita o acesso ou use outro navegador.</small>`;
    });

    if (window.analyticsService) {
      window.analyticsService.trackEvent('tab_switch', 'navigation', 'locais');
    }
  };
}

// Dark Mode functionality
function initializeDarkMode() {
  const toggleBtn = document.getElementById('toggleDark');
  if (!toggleBtn) return;

  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
  updateDarkModeButton(savedTheme);

  toggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    
    if (newTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
    updateDarkModeButton(newTheme);
    
    // Analytics tracking
    if (window.analyticsService) {
      window.analyticsService.trackEvent('UI_Interaction', 'dark_mode_toggle', newTheme);
    }
  });
}

function updateDarkModeButton(theme) {
  const toggleBtn = document.getElementById('toggleDark');
  if (!toggleBtn) return;
  
  const darkIcon = toggleBtn.querySelector('.dark-icon');
  const lightIcon = toggleBtn.querySelector('.light-icon');
  
  if (theme === 'dark') {
    if (darkIcon) darkIcon.style.display = 'none';
    if (lightIcon) lightIcon.style.display = 'inline';
    toggleBtn.setAttribute('aria-label', 'Alternar para modo claro');
    toggleBtn.setAttribute('title', 'Alternar para modo claro');
  } else {
    if (darkIcon) darkIcon.style.display = 'inline';
    if (lightIcon) lightIcon.style.display = 'none';
    toggleBtn.setAttribute('aria-label', 'Alternar para modo escuro');
    toggleBtn.setAttribute('title', 'Alternar para modo escuro');
  }
}

// Language switcher functionality
function initializeLanguageSwitcher() {
  const langBtn = document.getElementById('btnLang');
  if (!langBtn) return;

  // Load saved language
  const savedLang = localStorage.getItem('language') || 'pt';
  updateLanguage(savedLang);

  langBtn.addEventListener('click', () => {
    const currentLang = localStorage.getItem('language') || 'pt';
    const newLang = currentLang === 'pt' ? 'en' : 'pt';
    
    updateLanguage(newLang);
    
    // Analytics tracking
    if (window.analyticsService) {
      window.analyticsService.trackEvent('UI_Interaction', 'language_switch', newLang);
    }
  });
}

function updateLanguage(lang) {
  const langBtn = document.getElementById('btnLang');
  if (!langBtn) return;
  
  localStorage.setItem('language', lang);
  
  if (lang === 'en') {
    langBtn.textContent = '🇧🇷';
    langBtn.setAttribute('title', 'Switch to Portuguese');
    document.documentElement.lang = 'en';
  } else {
    langBtn.textContent = '🇺🇸';
    langBtn.setAttribute('title', 'Switch to English');
    document.documentElement.lang = 'pt-BR';
  }
  
  // Update interface elements if i18n is available
  if (typeof updateInterfaceLanguage === 'function') {
    updateInterfaceLanguage(lang);
  }
  
  // Update form placeholders and text
  updateFormLanguage(lang);
}

// Function to update form language
function updateFormLanguage(lang) {
  const translations = {
    pt: {
      precoMax: 'Preço máximo',
      idade: 'Idade',
      genero: 'Gênero',
      buscar: 'BUSCAR',
      ia: '🤖 IA',
      masculino: 'Masculino',
      feminino: 'Feminino',
      unisex: 'Unissex'
    },
    en: {
      precoMax: 'Max price',
      idade: 'Age',
      genero: 'Gender',
      buscar: 'SEARCH',
      ia: '🤖 AI',
      masculino: 'Male',
      feminino: 'Female',
      unisex: 'Unisex'
    }
  };
  
  const t = translations[lang] || translations.pt;
  
  // Update form placeholders
  const precoMaxInput = document.getElementById('precoMax');
  if (precoMaxInput) precoMaxInput.placeholder = t.precoMax;

  const idadeInput = document.getElementById('idadeInput');
  if (idadeInput) idadeInput.placeholder = t.idade;

  // Update select options
  const generoSelect = document.getElementById('generoSelect');
  if (generoSelect) {
    generoSelect.options[0].textContent = t.genero;
    generoSelect.options[1].textContent = t.masculino;
    generoSelect.options[2].textContent = t.feminino;
    generoSelect.options[3].textContent = t.unisex;
  }
  
  // Update button texts
  const submitBtn = document.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = t.buscar;
  
  // Remover botão de IA
  const aiBtn = document.getElementById('btnAIPowered');
  if (aiBtn) aiBtn.remove();
}

// Enhanced search functionality with validation
function initializeSearchFunctionality() {
  const form = document.getElementById('searchForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Get form values with null checks
    const precoMax = document.getElementById('precoMax')?.value || '';
    const idade = document.getElementById('idadeInput')?.value || '';
    const genero = document.getElementById('generoSelect')?.value || '';

    // Validar idade se fornecida
    if (idade && (parseInt(idade) < 0 || parseInt(idade) > 120)) {
      showMensagem('Por favor, insira uma idade entre 0 e 120 anos.', true);
      return;
    }

    // Exigir pelo menos um campo preenchido
    if (!precoMax && !idade && !genero) {
      showMensagem('Por favor, preencha pelo menos um filtro para buscar.', true);
      return;
    }

    // Build search parameters
    const params = {};
    if (precoMax) params.precoMax = precoMax;
    if (idade) params.idade = idade;
    if (genero) params.genero = genero;

    // Execute search
    buscarProdutos(params).then(dados => {
      if (dados && dados.produtos) {
        renderGrid(dados.produtos);
        renderPaginacao(dados.pagina || 1, dados.totalPaginas || 1);
        mostrarSecao('produtos');
        if (dados.produtos.length === 0) {
          showMensagem('Nenhum produto encontrado. Tente ajustar os filtros.');
        }
      } else {
        showMensagem('Erro na busca. Tente novamente.', true);
      }
    }).catch(error => {
      console.error('Erro na busca:', error);
      showMensagem('Erro na busca. Tente novamente.', true);
    });
  });
}

// Habilitar/desabilitar botão de busca conforme preenchimento dos campos
function toggleSearchButton() {
  const precoMax = document.getElementById('precoMax')?.value || '';
  const idade = document.getElementById('idadeInput')?.value || '';
  const genero = document.getElementById('generoSelect')?.value || '';
  const submitBtn = document.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = !precoMax && !idade && !genero;
    submitBtn.classList.toggle('disabled', submitBtn.disabled);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeDarkMode();
  initializeLanguageSwitcher();
  initializeSearchFunctionality();
  
  // Inicializar estado do botão de busca
  toggleSearchButton();
  // Adicionar listeners para atualizar o botão
  document.getElementById('precoMax')?.addEventListener('input', toggleSearchButton);
  document.getElementById('idadeInput')?.addEventListener('input', toggleSearchButton);
  document.getElementById('generoSelect')?.addEventListener('change', toggleSearchButton);
});

// =============================================================================
// EVENT LISTENERS E INICIALIZAÇÃO
// =============================================================================

// Configurar eventos quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Easy Gift Search inicializado - Google Search Only Version');
  
  // Carregar traduções
  await loadTranslations();
  
  // Configurar o botão de voltar ao topo
  setupBackToTopButton();
  
  // Inicializar Analytics
  if (window.analyticsService) {
    window.analyticsService.initialize();
    console.log('Analytics inicializado');
  }
  
  // Inicializar favoritos
  updateFavoritesCount();
  
  // Configurar listeners para formulário de busca
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearchSubmit);
  }
  
  // Verificar se há parâmetros de busca na URL
  const urlParams = new URLSearchParams(window.location.search);
  const queryFromUrl = urlParams.get('q');
  
  // Se houver query na URL, realizar a busca
  if (queryFromUrl) {
    document.getElementById('query').value = queryFromUrl;
    
    // Extrair outros parâmetros
    const params = {
      query: queryFromUrl,
      precoMax: urlParams.get('precoMax') || '',
      idade: urlParams.get('idade') || '',
      genero: urlParams.get('genero') || '',
      page: urlParams.get('page') || 1
    };
    
    // Preencher os campos do formulário
    if (params.precoMax) document.getElementById('precoMax').value = params.precoMax;
    if (params.idade) document.getElementById('idade').value = params.idade;
    if (params.genero) document.getElementById('genero').value = params.genero;
    
    // Executar busca
    const data = await buscarProdutos(params);
    renderGrid(data.produtos);
  } else {
    // Carregar recomendações aleatórias
    loadRandomRecommendations();
  }
  
  // Configurar eventos para botões de navegação
  setupNavigationButtons();
  
  // Configurar monitor de API
  setupApiMonitor();
});

// Configurar monitoramento da API
function setupApiMonitor() {
  // Verificar uso da API a cada hora
  setInterval(checkApiQuota, 3600000);
  
  // Verificar imediatamente
  checkApiQuota();
}

// Verificar quota da API
async function checkApiQuota() {
  try {
    const response = await fetch(`${API_URL}/monitor/quota`);
    
    if (!response.ok) {
      console.warn('Não foi possível verificar quota da API');
      return;
    }
    
    const data = await response.json();
    
    // Se estiver próximo do limite, mostrar aviso
    if (data.remaining && data.remaining < 20) {
      showNotification(`Atenção: Restam apenas ${data.remaining} consultas na API do Google hoje.`, 'warning', 10000);
      console.warn(`⚠️ Alerta de quota: ${data.remaining} consultas restantes`);
    }
    
    // Log para debug
    console.log(`📊 Status da API: ${data.remaining}/${data.limit} consultas restantes`);
  } catch (error) {
    console.error('Erro ao verificar quota da API:', error);
  }
}

// Handler para o formulário de busca
async function handleSearchSubmit(event) {
  event.preventDefault();
  
  const query = document.getElementById('query').value.trim();
  const precoMax = document.getElementById('precoMax').value.trim();
  const idade = document.getElementById('idade').value.trim();
  const genero = document.getElementById('genero').value.trim();
  
  // Validar entrada
  if (!query && !idade && !genero) {
    showNotification('Por favor, digite uma busca ou selecione filtros', 'error');
    return;
  }
  
  // Atualizar URL com parâmetros para permitir compartilhamento
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (precoMax) params.set('precoMax', precoMax);
  if (idade) params.set('idade', idade);
  if (genero) params.set('genero', genero);
  params.set('page', 1); // Iniciar na primeira página
  
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({}, '', newUrl);
  
  // Executar busca
  const searchParams = {
    query,
    precoMax,
    idade,
    genero,
    page: 1
  };
  
  const data = await buscarProdutos(searchParams);
  renderGrid(data.produtos);
  
  // Mostrar seção de produtos
  mostrarSecao('produtos');
}

// Funções para footer - Política de Privacidade e Termos de Uso
window.mostrarPoliticaPrivacidade = function() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    padding: 1rem;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    border-radius: 16px;
    padding: 2rem;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    position: relative;
  `;
  
  content.innerHTML = `
    <button onclick="this.closest('.modal').remove()" style="
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: #f1f5f9;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
      font-size: 18px;
    ">×</button>
    <h2 style="color: #4e54c8; margin-bottom: 1.5rem;">Política de Privacidade</h2>
    <div style="color: #475569; line-height: 1.6;">
      <h3>1. Coleta de Informações</h3>
      <p>O Easy Gift Search coleta apenas informações necessárias para melhorar sua experiência de busca de presentes.</p>
      
      <h3>2. Uso das Informações</h3>
      <p>Utilizamos suas informações para personalizar recomendações e melhorar nossos serviços.</p>
      
      <h3>3. Compartilhamento</h3>
      <p>Não compartilhamos suas informações pessoais com terceiros sem seu consentimento.</p>
      
      <h3>4. Cookies</h3>
      <p>Utilizamos cookies para melhorar a funcionalidade do site e personalizar sua experiência.</p>
      
      <h3>5. Segurança</h3>
      <p>Implementamos medidas de segurança para proteger suas informações.</p>
      
      <h3>6. Contato</h3>
      <p>Para dúvidas sobre privacidade, entre em contato: <strong>contato@easygift.com</strong></p>
      
      <p style="margin-top: 1.5rem; font-size: 0.9rem; color: #64748b;">
        <strong>Última atualização:</strong> Janeiro 2025
      </p>
    </div>
  `;
  
  modal.className = 'modal';
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  // Fechar ao clicar fora do modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
};

window.mostrarTermosUso = function() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    padding: 1rem;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    border-radius: 16px;
    padding: 2rem;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    position: relative;
  `;
  
  content.innerHTML = `
    <button onclick="this.closest('.modal').remove()" style="
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: #f1f5f9;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
      font-size: 18px;
    ">×</button>
    <h2 style="color: #4e54c8; margin-bottom: 1.5rem;">Termos de Uso</h2>
    <div style="color: #475569; line-height: 1.6;">
      <h3>1. Aceitação dos Termos</h3>
      <p>Ao usar o Easy Gift Search, você concorda com estes termos de uso.</p>
      
      <h3>2. Serviços Oferecidos</h3>
      <p>Oferecemos um serviço de busca e recomendação de presentes usando inteligência artificial.</p>
      
      <h3>3. Uso Responsável</h3>
      <p>Você concorda em usar o serviço de forma legal e responsável.</p>
      
      <h3>4. Limitação de Responsabilidade</h3>
      <p>O Easy Gift Search não se responsabiliza por transações realizadas em sites externos.</p>
      
      <h3>5. Propriedade Intelectual</h3>
      <p>Todo o conteúdo do site é protegido por direitos autorais.</p>
      
      <h3>6. Modificações</h3>
      <p>Reservamos o direito de modificar estes termos a qualquer momento.</p>
      
      <h3>7. Contato</h3>
      <p>Para questões legais, entre em contato: <strong>contato@easygift.com</strong></p>
      
      <p style="margin-top: 1.5rem; font-size: 0.9rem; color: #64748b;">
        <strong>Última atualização:</strong> Janeiro 2025
      </p>
    </div>
  `;
  
  modal.className = 'modal';
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  // Fechar ao clicar fora do modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
};