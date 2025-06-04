// Troque para a URL do backend de produção ao publicar!
// Exemplo: const API_URL = 'https://api.seudominio.com/api';
const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://easy-gift-search.onrender.com/api';

function showLoader(show) {
  document.getElementById('loader').style.display = show ? 'block' : 'none';
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
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/products?${query}`);
    if (!res.ok) throw new Error('Erro ao buscar produtos.');
    return await res.json();
  } catch (e) {
    // Analytics: Track error
    if (window.analyticsService) {
      window.analyticsService.trackError('API_Error', e.message, 'buscarProdutos');
    }
    showMensagem('Erro ao buscar produtos. Tente novamente.', true);
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
    const nomeProduto = prod.nome || prod.titulo || 'Produto sem nome';
    const precoProduto = prod.preco || 'Consulte';
    const imagemProduto = prod.imagem || '/images/placeholder.jpg';
    const urlProduto = prod.url || '#';
    const idProduto = prod.id || Math.random().toString(36).substr(2, 9);
    const marketplaceProduto = prod.marketplace || 'marketplace';
    
    // Escapar aspas simples nos nomes para evitar erros JavaScript
    const nomeEscapado = nomeProduto.replace(/'/g, '\\\'');
    
    card.innerHTML = `
      <img src="${imagemProduto}" alt="${nomeProduto}" loading="lazy">
      <h3>${nomeProduto}</h3>
      <p>R$ ${precoProduto}</p>
      <a href="${urlProduto}" target="_blank" onclick="trackProductClick('${idProduto}', '${nomeEscapado}', '${precoProduto}', '${marketplaceProduto}', ${index}, '${urlProduto}')">${t('ver_marketplace')}</a>
      <button onclick="favoritarProduto('${idProduto}', '${nomeEscapado}')">${t('favoritar')}</button>
    `;
    
    // Analytics: Track product view
    if (window.analyticsService) {
      window.analyticsService.trackProductView(prod.id, prod.nome, prod.preco, prod.marketplace);
    }
    
    grid.appendChild(card);
  });
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
  const img = card.querySelector('img')?.src;
  const preco = card.querySelector('p')?.textContent.replace('R$ ','')
  const url = card.querySelector('a')?.href;
  const favs = getFavoritos();
  if (favs.some(f => f.id === id)) {
    showMensagem(`Produto "${nome}" já está nos favoritos!`);
    setTimeout(clearMensagem, 2000);
    return;
  }
  favs.push({ id, nome, preco, imagem: img, url });
  setFavoritos(favs);
  showMensagem(`Produto "${nome}" adicionado aos favoritos!`);
  setTimeout(clearMensagem, 2000);
  renderFavoritos();
};

function renderFavoritos() {
  const favs = getFavoritos();
  const grid = document.getElementById('gridFavoritos');
  grid.innerHTML = '';
  if (!favs.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:#888;">${t('nenhum_favorito')}</div>`;
    return;
  }
  favs.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${prod.imagem}" alt="${prod.nome}" loading="lazy">
      <h3>${prod.nome}</h3>
      <p>R$ ${prod.preco}</p>
      <a href="${prod.url}" target="_blank">${t('ver_marketplace')}</a>
      <button onclick="removerFavorito('${prod.id}')">${t('remover')}</button>
    `;
    grid.appendChild(card);
  });
}

window.removerFavorito = function(id) {
  let favs = getFavoritos();
  favs = favs.filter(f => f.id !== id);
  setFavoritos(favs);
  showMensagem('Produto removido dos favoritos!');
  setTimeout(clearMensagem, 2000);
  renderFavoritos();
};

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

// Carrega produtos
async function carregarProdutos(params = {}) {
  showLoader(true);
  try {
    const { produtos, pagina, totalPaginas } = await buscarProdutos(params);
    renderGrid(produtos);
    renderPaginacao(pagina, totalPaginas, params);
  } finally {
    showLoader(false);
  }
}

// =============================================================================
// NEW API INTEGRATIONS - ENHANCED FUNCTIONALITY
// =============================================================================

// Current active locations and data
let currentLocais = [];
let currentMapaInfo = null;

// ===== LOCATION-BASED SERVICES =====

/**
 * Busca lojas próximas usando Google Maps API
 */
async function buscarLojasProximas(cidade, categoria = 'loja de presentes') {
  try {
    const params = new URLSearchParams({
      cidade,
      categoria,
      radius: '10000' // 10km de raio
    });
    
    const response = await fetch(`${API_URL}/new-apis/maps/lojas?${params}`);
    if (!response.ok) throw new Error('Erro ao buscar lojas');
    
    const resultado = await response.json();
    
    if (resultado.sucesso && resultado.dados) {
      currentLocais = resultado.dados.lojas || [];
      currentMapaInfo = resultado.dados.info;
      
      renderLocais();
      
      // Analytics: Track location search
      if (window.analyticsService) {
        window.analyticsService.trackEvent('location_search', 'api_call', cidade, {
          categoria,
          resultados: currentLocais.length
        });
      }
    }
    
  } catch (error) {
    console.error('Erro ao buscar lojas próximas:', error);
    showMensagem('Erro ao buscar lojas próximas.', true);
  }
}

/**
 * Busca shopping centers próximos
 */
async function buscarShoppings(cidade, estado) {
  try {
    const params = new URLSearchParams({
      cidade,
      ...(estado && { estado })
    });
    
    const response = await fetch(`${API_URL}/new-apis/maps/shoppings?${params}`);
    if (!response.ok) throw new Error('Erro ao buscar shoppings');
    
    const resultado = await response.json();
    
    if (resultado.sucesso && resultado.dados) {
      currentLocais = resultado.dados.shoppings || [];
      currentMapaInfo = resultado.dados.info;
      
      renderLocais();
      
      // Analytics: Track shopping search
      if (window.analyticsService) {
        window.analyticsService.trackEvent('shopping_search', 'api_call', cidade, {
          estado,
          resultados: currentLocais.length
        });
      }
    }
    
  } catch (error) {
    console.error('Erro ao buscar shoppings:', error);
    showMensagem('Erro ao buscar shopping centers.', true);
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
      <div style="grid-column:1/-1;text-align:center;color:#888;padding:2rem;">
        <p>🏪 Nenhuma loja encontrada na região</p>
        <small>Tente uma cidade diferente ou verifique a conectividade</small>
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
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
          ${local.website ? `<a href="${local.website}" target="_blank" rel="noopener noreferrer" style="flex: 1; min-width: 100px; text-align: center; padding: 0.5rem; background: var(--primary-color); color: white; text-decoration: none; border-radius: 4px; font-size: 0.9rem;">🌐 Site</a>` : ''}
          ${local.maps_url ? `<a href="${local.maps_url}" target="_blank" rel="noopener noreferrer" style="flex: 1; min-width: 100px; text-align: center; padding: 0.5rem; background: #10b981; color: white; text-decoration: none; border-radius: 4px; font-size: 0.9rem;">🗺️ Mapa</a>` : ''}
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
  btnVerLocais.onclick = () => {
    esconderTodasSecoes();
    removerActiveButtons();
    secLocais.style.display = '';
    btnVerLocais.classList.add('active');
    if (!currentLocais.length) {
      document.getElementById('mapaInfo').innerHTML = `
        <strong>📍 Busca de Lojas Próximas</strong><br>
        <small>Use a busca IA (🤖 IA) para encontrar lojas próximas baseado nos seus critérios</small>
      `;
    }
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
  
  const aiBtn = document.getElementById('btnAIPowered');
  if (aiBtn) aiBtn.textContent = t.ia;
  
  // Update navigation buttons
  const btnResultados = document.getElementById('btnVerResultados');
  if (btnResultados) btnResultados.textContent = lang === 'en' ? 'Results' : 'Resultados';
  
  const btnFavoritos = document.getElementById('btnVerFavoritos');
  if (btnFavoritos) btnFavoritos.textContent = lang === 'en' ? 'Favorites' : 'Favoritos';
  
  const btnLocais = document.getElementById('btnVerLocais');
  if (btnLocais) btnLocais.textContent = lang === 'en' ? 'Nearby Stores' : 'Lojas Próximas';
}

// Enhanced search functionality with validation
function initializeSearchFunctionality() {
  const form = document.getElementById('searchForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Get form values with null checks
    // const query = document.getElementById('queryInput')?.value.trim() || '';
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
      showMensagem('Preencha pelo menos um filtro.', true);
      return;
    }

    // Build search parameters
    const params = {};
    // if (query) params.query = query;
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

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeDarkMode();
  initializeLanguageSwitcher();
  initializeSearchFunctionality();
});

// =============================================================================
// EVENT LISTENERS E INICIALIZAÇÃO
// =============================================================================

// Configurar eventos quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  // Configurar botão de busca IA
  const btnAIPowered = document.getElementById('btnAIPowered');
  if (btnAIPowered) {
    btnAIPowered.onclick = executarBuscaIA;
  }
  
  // Configurar navegação entre abas
  configurarNavegacaoAbas();
  
  // Detectar localização automaticamente (opcional)
  // detectarLocalizacao(); // Descomentari se quiser detecção automática
  
  // Melhorar busca tradicional para usar APIs aprimoradas
  const searchForm = document.getElementById('searchForm');
  const originalSubmit = searchForm.onsubmit;
  
  searchForm.onsubmit = async (e) => {
    e.preventDefault();
      // Obter parâmetros do formulário
    const params = {
      precoMax: document.getElementById('precoMax').value,
      idade: document.getElementById('idadeInput').value,
      genero: document.getElementById('generoSelect').value,
      page: 1
    };
    
    // Mostrar seção de produtos
    document.getElementById('produtos').style.display = '';
    
    // Executar busca tradicional primeiro
    await carregarProdutos(params);
  };
});

// Expor funções globalmente para uso em outros contextos
window.buscarLojasProximas = buscarLojasProximas;
window.buscarShoppings = buscarShoppings;

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