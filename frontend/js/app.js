// Troque para a URL do backend de produção ao publicar!
// Exemplo: const API_URL = 'https://api.seudominio.com/api';
const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://easy-gift-35cs.onrender.com/api';

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

// Busca produtos
async function buscarProdutos(params = {}) {
  showLoader(true);
  clearMensagem();
  
  // Analytics: Track search with filters
  if (window.analyticsService) {
    const query = params.query || 'busca_geral';
    const filters = {
      min_price: params.precoMin || null,
      max_price: params.precoMax || null,
      age: params.idade || null,
      gender: params.genero || null,
      page: params.page || 1
    };
    window.analyticsService.trackSearch(query, filters);
    
    // Track filter usage if any filters are applied
    if (params.precoMin) {
      window.analyticsService.trackFilterUsage('price_min', params.precoMin);
    }
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

function renderSugestao(sugestao, produtosRelacionados = [], start = 0, limit = 3) {
  document.getElementById('sugestao').innerHTML = `<strong>${sugestao}</strong>`;
  const grid = document.getElementById('sugestaoProdutos');
  grid.innerHTML = '';
  if (produtosRelacionados && produtosRelacionados.length) {
    produtosRelacionados.slice(start, start + limit).forEach(prod => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${prod.imagem}" alt="${prod.nome}" loading="lazy">
        <h3>${prod.nome}</h3>
        <p>R$ ${prod.preco}</p>
        <a href="${prod.url}" target="_blank" rel="noopener noreferrer">${t('ver_marketplace')}</a>
        <button onclick="favoritarProduto('${prod.id}', '${prod.nome.replace(/'/g, '')}')">${t('favoritar')}</button>
      `;
      grid.appendChild(card);
    });
  } else {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:#888;">${t('nenhum_produto')}</div>`;
  }
}

let sugestaoProdutos = [];
let sugestaoTexto = '';
let sugestaoIndex = 0;
const SUGESTAO_LIMIT = 3;

// Recomenda presente
async function recomendarPresente(perfil) {
  showLoader(true);
  clearMensagem();
  
  const startTime = Date.now();
  
  // Analytics: Track recommendation request
  if (window.analyticsService) {
    const query = `idade:${perfil.idade || 'não_informado'} genero:${perfil.genero || 'não_informado'}`;
    window.analyticsService.trackRecommendationRequest(query, null);
  }
  
  try {
    const res = await fetch(`${API_URL}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(perfil)
    });
    if (!res.ok) throw new Error('Erro ao buscar sugestão.');
    
    const result = await res.json();
    const responseTime = Date.now() - startTime;
    
    // Analytics: Track recommendation response
    if (window.analyticsService) {
      const query = `idade:${perfil.idade || 'não_informado'} genero:${perfil.genero || 'não_informado'}`;
      const productsCount = result.produtosRelacionados ? result.produtosRelacionados.length : 0;
      window.analyticsService.trackRecommendationResponse(query, productsCount, responseTime);
    }
    
    return result;
  } catch (e) {
    // Analytics: Track error
    if (window.analyticsService) {
      window.analyticsService.trackError('Recommendation_Error', e.message, 'recomendarPresente');
    }
    showMensagem('Erro ao buscar sugestão. Tente novamente.', true);
    return { sugestao: '', produtosRelacionados: [] };
  } finally {
    showLoader(false);
  }
}

async function carregarRecomendacao(refazer = false) {
  const idade = document.getElementById('idadeInput').value;
  const genero = document.getElementById('generoSelect').value;
  const perfil = { idade, genero };
  if (refazer) {
    sugestaoIndex = 0;
  }
  recomendarPresente(perfil).then(({ sugestao, produtosRelacionados }) => {
    sugestaoProdutos = produtosRelacionados || [];
    sugestaoTexto = sugestao || '';
    renderSugestao(sugestaoTexto, sugestaoProdutos, sugestaoIndex, SUGESTAO_LIMIT);
  });
}

// Exibe mensagem inicial convidativa
function mostrarMensagemInicial() {
  const grid = document.getElementById('grid');
  grid.innerHTML = `
    <div class="mensagem-inicial" style="grid-column:1/-1;text-align:center;padding:40px 20px;">
      <h3 style="margin-bottom:20px;">🎁 ${t('benvindo_titulo')}</h3>
      <p style="margin-bottom:15px;font-size:16px;">${t('benvindo_descricao')}</p>
      <p style="font-size:14px;opacity:0.8;">${t('benvindo_instrucoes')}</p>
    </div>
  `;
  // Limpar a seção de recomendação também
  document.getElementById('sugestao').innerHTML = `
    <div style="text-align:center;font-style:italic;opacity:0.8;">
      ${t('recomendacao_inicial')}
    </div>
  `;
}

// Renderiza grid de produtos
function renderGrid(produtos) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  if (!produtos || produtos.length === 0) {
    showMensagem(t('nenhum_produto'));
    return;
  }
  clearMensagem();
  produtos.forEach((prod, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${prod.imagem}" alt="${prod.nome}" loading="lazy">
      <h3>${prod.nome}</h3>
      <p>R$ ${prod.preco}</p>
      <a href="${prod.url}" target="_blank" onclick="trackProductClick('${prod.id}', '${prod.nome.replace(/'/g, '')}', ${prod.preco}, '${prod.marketplace}', ${index}, '${prod.url}')">${t('ver_marketplace')}</a>
      <button onclick="favoritarProduto('${prod.id}', '${prod.nome.replace(/'/g, '')}')">${t('favoritar')}</button>
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

// Carrega recomendação inteligente
async function carregarRecomendacao() {
  const idade = document.getElementById('idadeInput').value;
  const genero = document.getElementById('generoSelect').value;
  const perfil = { idade, genero };
  const { sugestao, produtosRelacionados } = await recomendarPresente(perfil);
  document.getElementById('sugestao').innerHTML = `
    <strong>${sugestao}</strong><br>
    ${produtosRelacionados?.map(p => `<span>${p.nome} - R$ ${p.preco}</span>`).join('<br>') || ''}
  `;
}

// Inicialização
document.getElementById('searchForm').onsubmit = async (e) => {
  e.preventDefault();
  const params = {
    precoMin: document.getElementById('precoMin').value,
    precoMax: document.getElementById('precoMax').value,
    idade: document.getElementById('idadeInput').value,
    genero: document.getElementById('generoSelect').value,
    page: 1  };
  carregarProdutos(params);
  carregarRecomendacao();
};

// Alterna abas
const btnVerResultados = document.getElementById('btnVerResultados');
const btnVerFavoritos = document.getElementById('btnVerFavoritos');
const secResultados = document.getElementById('produtos');
const secFavoritos = document.getElementById('favoritos');

btnVerResultados.onclick = () => {
  secResultados.style.display = '';
  secFavoritos.style.display = 'none';
  btnVerResultados.classList.add('active');
  btnVerFavoritos.classList.remove('active');
};
btnVerFavoritos.onclick = () => {
  secResultados.style.display = 'none';
  secFavoritos.style.display = '';
  btnVerResultados.classList.remove('active');
  btnVerFavoritos.classList.add('active');
  renderFavoritos();
};
// Inicialização: sempre mostra resultados primeiro
btnVerResultados.classList.add('active');
secFavoritos.style.display = 'none';
renderFavoritos();

// Exibe mensagem inicial convidativa ao invés de carregar produtos automaticamente
mostrarMensagemInicial();

// Dark mode toggle melhorado
const btnToggleDark = document.getElementById('toggleDark');
const btnLang = document.getElementById('btnLang');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Inicializar modo dark
if (localStorage.getItem('darkMode') === 'true' || (!localStorage.getItem('darkMode') && prefersDark)) {
  document.body.classList.add('dark');
}

// Toggle do modo dark com animação suave
btnToggleDark.onclick = () => {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark);
  
  // Animação suave
  document.body.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  
  // Analytics: Track dark mode toggle
  if (window.analyticsService) {
    window.analyticsService.trackDarkModeToggle(isDark);
  }
};

// Função utilitária para obter string traduzida
function t(key) {
  const lang = localStorage.getItem('lang') || 'pt';
  return (window.I18N_STRINGS?.[lang]?.[key]) || key;
}

// Exemplo de uso: document.getElementById('btnVerFavoritos').textContent = t('favoritos');

// Ao inicializar, pode-se definir idioma pelo navegador:
if (!localStorage.getItem('lang')) {
  const navLang = navigator.language.startsWith('en') ? 'en' : 'pt';
  localStorage.setItem('lang', navLang);
}

// Botões de controle do header
const btnLang = document.getElementById('btnLang');

// Inicializar texto do botão de idioma
btnLang.textContent = localStorage.getItem('lang') === 'en' ? '🇧🇷' : '🇺🇸';

function atualizarIdioma(lang) {
  const previousLang = localStorage.getItem('lang');
  localStorage.setItem('lang', lang);
  
  // Analytics: Track language change
  if (window.analyticsService && previousLang !== lang) {
    window.analyticsService.trackLanguageChange(lang, previousLang);
  }
  
  btnVerResultados.textContent = t('resultados');
  btnVerFavoritos.textContent = t('favoritos');
  document.getElementById('resultadosTitle').textContent = t('resultados');
  document.getElementById('favoritosTitle').textContent = t('favoritos');
  document.getElementById('recomendacaoTitle').textContent = t('recomendacao');
  document.getElementById('precoMin').placeholder = t('preco_min');
  document.getElementById('precoMax').placeholder = t('preco_max');
  document.getElementById('idadeInput').placeholder = t('idade');
  document.getElementById('generoSelect').options[0].text = t('genero');
  document.getElementById('generoSelect').options[1].text = t('masculino');
  document.getElementById('generoSelect').options[2].text = t('feminino');
  document.getElementById('generoSelect').options[3].text = t('unissex');
  document.getElementById('searchForm').querySelector('button[type="submit"]').textContent = t('buscar');
  
  // Verificar se o elemento historicoBuscas existe antes de tentar acessá-lo
  const historicoBuscas = document.getElementById('historicoBuscas');
  if (historicoBuscas && historicoBuscas.querySelector('h3')) {
    historicoBuscas.querySelector('h3').textContent = t('historico');
  }
  
  renderFavoritos();
  // Não carrega produtos automaticamente - apenas atualiza a mensagem inicial
  mostrarMensagemInicial();
  btnLang.textContent = lang === 'en' ? '🇧🇷' : '🇺🇸';
}

btnLang.onclick = () => {
  const lang = localStorage.getItem('lang') === 'en' ? 'pt' : 'en';
  atualizarIdioma(lang);
};

// Analytics: Initialize user properties
document.addEventListener('DOMContentLoaded', () => {
  if (window.analyticsService) {
    // Set user properties for analytics
    const userProperties = {
      language: localStorage.getItem('lang') || 'pt',
      dark_mode_preference: localStorage.getItem('darkMode') === 'true',
      device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
               navigator.userAgent.includes('Firefox') ? 'Firefox' : 
               navigator.userAgent.includes('Safari') ? 'Safari' : 'Other',
      first_visit: !localStorage.getItem('analytics_visited'),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    
    window.analyticsService.setUserProperties(userProperties);
    
    // Mark as visited
    if (!localStorage.getItem('analytics_visited')) {
      localStorage.setItem('analytics_visited', 'true');
    }
    
    // Track page load performance
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      window.analyticsService.trackPerformance('page_load_time', loadTime, 'ms');
    });
  }
});