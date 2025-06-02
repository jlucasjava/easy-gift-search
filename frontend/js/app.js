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

function renderSugestao(sugestao, produtosRelacionados = [], start = 0, limit = 3) {
  document.getElementById('sugestao').innerHTML = `<strong>${sugestao}</strong>`;
  const grid = document.getElementById('sugestaoProdutos');
  grid.innerHTML = '';
  if (produtosRelacionados && produtosRelacionados.length) {
    // Randomizar os produtos antes de exibir
    const produtosRandomizados = [...produtosRelacionados].sort(() => Math.random() - 0.5);
    produtosRandomizados.slice(start, start + limit).forEach(prod => {
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
    // Exibir dica de swipe no mobile
    const swipeHint = document.getElementById('swipeHint');
    if (window.innerWidth <= 600) {
      swipeHint.style.display = 'block';
      setTimeout(() => { swipeHint.style.display = 'none'; }, 3500);
    } else {
      swipeHint.style.display = 'none';
    }
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
  // Esconder a seção de recomendação inicialmente
  document.getElementById('recomendacao').style.display = 'none';
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
    
    // Mostrar seção de recomendação após carregar produtos
    if (produtos && produtos.length > 0) {
      document.getElementById('recomendacao').style.display = 'block';
      // Carregar recomendação automaticamente
      carregarRecomendacao();
    }
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

// =============================================================================
// NEW API INTEGRATIONS - ENHANCED FUNCTIONALITY
// =============================================================================

// Current active locations and data
let currentLocais = [];
let currentMapaInfo = null;

// ===== AI-POWERED SEARCH FUNCTIONALITY =====

/**
 * Executa busca integrada usando múltiplas APIs (IA, Maps, Bing, etc.)
 */
async function executarBuscaIA() {
  showLoader(true);
  clearMensagem();
  
  try {
    // Obter dados do formulário - Note: não temos campo 'query', então usar termo genérico
    const query = 'presentes inteligentes'; // Termo genérico para busca IA
    const idade = document.getElementById('idadeInput')?.value;
    const genero = document.getElementById('generoSelect')?.value;
    
    // Determinar categoria baseada nos filtros
    let categoria = 'presentes';
    if (idade && parseInt(idade) < 12) categoria = 'presentes infantis';
    else if (idade && parseInt(idade) > 60) categoria = 'presentes idosos';
    
    // Construir query params
    const params = new URLSearchParams({
      query,
      ...(categoria && { categoria }),
      ...(idade && { idade }),
      ...(genero && { genero })
    });
    
    // Analytics: Track AI search
    if (window.analyticsService) {
      window.analyticsService.trackEvent('ai_search', 'user_action', query, {
        idade, genero, categoria
      });
    }
    
    // Chamar API de busca integrada
    const response = await fetch(`${API_URL}/new-apis/busca-integrada?${params}`);
    if (!response.ok) throw new Error('Erro na busca integrada');
    
    const resultado = await response.json();
      // Processar e exibir resultados
    await processarResultadosIA(resultado);
    
    showMensagem(`✨ Busca IA concluída! Encontrados múltiplos resultados integrados.`);
    
  } catch (error) {
    console.error('Erro na busca IA:', error);
    showMensagem('Erro na busca inteligente. Tente novamente.', true);
    
    // Analytics: Track error
    if (window.analyticsService) {
      window.analyticsService.trackError('AI_Search_Error', error.message, 'executarBuscaIA');
    }
  } finally {
    showLoader(false);
  }
}

/**
 * Processa e exibe os resultados da busca IA
 */
async function processarResultadosIA(resultado) {
  // Mostrar seção de produtos se temos resultados
  if (resultado.produtos && resultado.produtos.length > 0) {
    document.getElementById('produtos').style.display = '';
    renderGrid(resultado.produtos);
    
    // Atualizar paginação se disponível
    if (resultado.paginacao) {
      renderPaginacao(resultado.paginacao.atual, resultado.paginacao.total, {});
    }
  }
  
  // Mostrar recomendação IA se disponível
  if (resultado.recomendacao) {
    document.getElementById('recomendacao').style.display = '';
    document.getElementById('sugestao').innerHTML = `
      <strong>🤖 Recomendação IA:</strong><br>
      ${resultado.recomendacao.texto || resultado.recomendacao}
    `;
    
    // Se tem produtos recomendados, mostrá-los
    if (resultado.recomendacao.produtos) {
      renderSugestao(resultado.recomendacao.texto, resultado.recomendacao.produtos);
    }
  }
  
  // Se tem resultados web do Bing, mostrar informação adicional
  if (resultado.webSearch && resultado.webSearch.length > 0) {
    const infoExtra = document.createElement('div');
    infoExtra.style.cssText = 'margin: 1rem 0; padding: 1rem; background: var(--card-bg); border-radius: 8px; border-left: 4px solid #10b981;';
    infoExtra.innerHTML = `
      <strong>🌐 Informações Adicionais da Web:</strong><br>
      <small>Encontrados ${resultado.webSearch.length} resultados relevantes online</small>
    `;
    
    const grid = document.getElementById('grid');
    if (grid) {
      grid.insertBefore(infoExtra, grid.firstChild);
    }
  }
}

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

// ===== ENHANCED AI RECOMMENDATIONS =====

/**
 * Gera recomendações usando Llama AI
 */
async function gerarRecomendacaoIA(perfil) {
  try {
    const { idade, genero, interesses, orcamento } = perfil;
    
    // Construir mensagem contextual para o Llama
    let message = `Preciso de sugestões de presentes`;
    if (idade) message += ` para uma pessoa de ${idade} anos`;
    if (genero && genero !== '') message += ` do gênero ${genero}`;
    if (interesses) message += ` que gosta de ${interesses}`;
    if (orcamento) message += ` com orçamento de até R$ ${orcamento}`;
    
    const response = await fetch(`${API_URL}/new-apis/llama/recomendacao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        webAccess: false
      })
    });
    
    if (!response.ok) throw new Error('Erro na recomendação IA');
    
    const resultado = await response.json();
    
    // Analytics: Track AI recommendation
    if (window.analyticsService) {
      window.analyticsService.trackEvent('ai_recommendation', 'llama_api', message, {
        idade, genero, orcamento
      });
    }
    
    return resultado;
    
  } catch (error) {
    console.error('Erro na recomendação IA:', error);
    return { erro: 'Erro ao gerar recomendação IA', detalhes: error.message };
  }
}

/**
 * Busca produtos usando APIs aprimoradas (Bing + Google)
 */
async function buscarProdutosAprimorados(query, filtros = {}) {
  try {
    const params = new URLSearchParams({
      query,
      ...filtros
    });
    
    // Tentar primeiro com Google Search
    let response = await fetch(`${API_URL}/new-apis/google/buscar?${params}&api=both`);
    let resultadoGoogle = null;
    
    if (response.ok) {
      resultadoGoogle = await response.json();
    }
    
    // Tentar também com Bing para produtos específicos
    response = await fetch(`${API_URL}/new-apis/bing/produtos?produto=${encodeURIComponent(query)}`);
    let resultadoBing = null;
    
    if (response.ok) {
      resultadoBing = await response.json();
    }
    
    // Combinar resultados
    const produtosCombinados = [];
    
    if (resultadoGoogle?.sucesso && resultadoGoogle.dados) {
      // Processar resultados do Google
      const googleResults = resultadoGoogle.dados.api1?.items || resultadoGoogle.dados.api2?.items || [];
      googleResults.forEach(item => {
        produtosCombinados.push({
          id: `google_${item.title?.hashCode() || Math.random()}`,
          nome: item.title || item.displayLink,
          url: item.link,
          imagem: item.pagemap?.cse_image?.[0]?.src || '/images/placeholder.jpg',
          preco: 'Ver no site',
          marketplace: item.displayLink,
          fonte: 'Google'
        });
      });
    }
    
    if (resultadoBing?.sucesso && resultadoBing.dados) {
      // Processar resultados do Bing
      const bingResults = resultadoBing.dados.webPages?.value || [];
      bingResults.forEach(item => {
        produtosCombinados.push({
          id: `bing_${item.name?.hashCode() || Math.random()}`,
          nome: item.name,
          url: item.url,
          imagem: '/images/placeholder.jpg',
          preco: 'Ver no site',
          marketplace: new URL(item.url).hostname,
          fonte: 'Bing'
        });
      });
    }
    
    return {
      produtos: produtosCombinados,
      total: produtosCombinados.length,
      fontes: {
        google: resultadoGoogle?.sucesso || false,
        bing: resultadoBing?.sucesso || false
      }
    };
    
  } catch (error) {
    console.error('Erro na busca aprimorada:', error);
    return { produtos: [], total: 0, erro: error.message };
  }
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
  const secRecomendacao = document.getElementById('recomendacao');
  
  // Função auxiliar para esconder todas as seções
  function esconderTodasSecoes() {
    secResultados.style.display = 'none';
    secFavoritos.style.display = 'none';
    secLocais.style.display = 'none';
  }
  
  // Função auxiliar para remover classe active de todos os botões
  function removerActiveButtons() {
    [btnVerResultados, btnVerFavoritos, btnVerLocais].forEach(btn => {
      btn.classList.remove('active');
    });
  }
  
  // Event listeners para cada aba
  btnVerResultados.onclick = () => {
    esconderTodasSecoes();
    removerActiveButtons();
    
    secResultados.style.display = '';
    secRecomendacao.style.display = secRecomendacao.innerHTML ? '' : 'none';
    btnVerResultados.classList.add('active');
    
    // Analytics: Track tab switch
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
    
    // Analytics: Track tab switch
    if (window.analyticsService) {
      window.analyticsService.trackEvent('tab_switch', 'navigation', 'favoritos');
    }
  };
    btnVerLocais.onclick = () => {
    esconderTodasSecoes();
    removerActiveButtons();
    
    secLocais.style.display = '';
    btnVerLocais.classList.add('active');
    
    // Se não tem locais carregados, mostrar mensagem informativa
    if (!currentLocais.length) {
      // Mostrar mensagem pedindo para usar busca IA para encontrar lojas
      document.getElementById('mapaInfo').innerHTML = `
        <strong>📍 Busca de Lojas Próximas</strong><br>
        <small>Use a busca IA (🤖 IA) para encontrar lojas próximas baseado nos seus critérios</small>
      `;
    }
    
    // Analytics: Track tab switch
    if (window.analyticsService) {
      window.analyticsService.trackEvent('tab_switch', 'navigation', 'locais');
    }
  };
}

// =============================================================================
// DARK MODE AND LANGUAGE SWITCHER FUNCTIONALITY
// =============================================================================

/**
 * Initialize dark mode functionality
 */
function initializeDarkMode() {
  const toggleDarkBtn = document.getElementById('toggleDark');
  if (!toggleDarkBtn) return;

  // Check for saved theme preference or default to light mode
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  }

  // Toggle dark mode
  toggleDarkBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Analytics tracking
    if (window.analyticsService) {
      window.analyticsService.trackEvent('ui_interaction', 'theme_toggle', isDark ? 'dark' : 'light');
    }
  });
}

/**
 * Initialize language switcher functionality
 */
function initializeLanguageSwitcher() {
  const langBtn = document.getElementById('btnLang');
  if (!langBtn) return;

  // Check for saved language preference or default to Portuguese
  const savedLang = localStorage.getItem('language') || 'pt';
  updateLanguage(savedLang);

  // Toggle language
  langBtn.addEventListener('click', () => {
    const currentLang = localStorage.getItem('language') || 'pt';
    const newLang = currentLang === 'pt' ? 'en' : 'pt';
    updateLanguage(newLang);
    
    // Analytics tracking
    if (window.analyticsService) {
      window.analyticsService.trackEvent('ui_interaction', 'language_switch', newLang);
    }
  });
}

/**
 * Update interface language
 */
function updateLanguage(lang) {
  localStorage.setItem('language', lang);
  
  // Update button text
  const langBtn = document.getElementById('btnLang');
  if (langBtn) {
    langBtn.textContent = lang === 'pt' ? '🇺🇸' : '🇧🇷';
    langBtn.title = lang === 'pt' ? 'Switch to English' : 'Mudar para Português';
  }

  // Update page elements if i18n strings are available
  if (window.I18N_STRINGS && window.I18N_STRINGS[lang]) {
    const strings = window.I18N_STRINGS[lang];
    
    // Update form placeholders and labels
    const precoMaxInput = document.getElementById('precoMax');
    if (precoMaxInput) precoMaxInput.placeholder = strings.preco_max || 'Preço máximo';
    
    const idadeInput = document.getElementById('idadeInput');
    if (idadeInput) idadeInput.placeholder = strings.idade || 'Idade';
    
    const generoSelect = document.getElementById('generoSelect');
    if (generoSelect) {
      const options = generoSelect.querySelectorAll('option');
      if (options[0]) options[0].textContent = strings.genero || 'Gênero';
      if (options[1]) options[1].textContent = strings.masculino || 'Masculino';
      if (options[2]) options[2].textContent = strings.feminino || 'Feminino';
      if (options[3]) options[3].textContent = strings.unissex || 'Unissex';
    }
    
    // Update button texts
    const searchBtn = document.querySelector('button[type="submit"]');
    if (searchBtn) searchBtn.textContent = strings.buscar || 'Buscar';
    
    // Update tab buttons
    const resultadosBtn = document.getElementById('btnVerResultados');
    if (resultadosBtn) resultadosBtn.textContent = strings.resultados || 'Resultados';
    
    const favoritosBtn = document.getElementById('btnVerFavoritos');
    if (favoritosBtn) favoritosBtn.textContent = strings.favoritos || 'Favoritos';
    
    // Update section titles
    const resultadosTitle = document.getElementById('resultadosTitle');
    if (resultadosTitle) resultadosTitle.textContent = strings.resultados || 'Resultados';
    
    const recomendacaoTitle = document.getElementById('recomendacaoTitle');
    if (recomendacaoTitle) recomendacaoTitle.textContent = strings.recomendacao || '🎯 Recomendação Inteligente';
    
    const favoritosTitle = document.getElementById('favoritosTitle');
    if (favoritosTitle) favoritosTitle.textContent = strings.favoritos || 'Meus Favoritos';
  }
}

/**
 * Initialize search functionality without errors
 */
function initializeSearchFunctionality() {
  const searchForm = document.getElementById('searchForm');
  if (!searchForm) return;

  // Enhanced form validation
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      // Safely get form values
      const precoMaxElement = document.getElementById('precoMax');
      const idadeElement = document.getElementById('idadeInput');
      const generoElement = document.getElementById('generoSelect');
      
      const params = {
        precoMax: precoMaxElement ? precoMaxElement.value : '',
        idade: idadeElement ? idadeElement.value : '',
        genero: generoElement ? generoElement.value : '',
        page: 1
      };
      
      // Validate age range
      if (params.idade && (params.idade < 0 || params.idade > 120)) {
        showMensagem('Idade deve estar entre 0 e 120 anos', true);
        return;
      }
      
      console.log('🔍 Searching with params:', params);
      
      // Show products section
      const produtosSection = document.getElementById('produtos');
      if (produtosSection) {
        produtosSection.style.display = '';
      }
      
      // Execute search
      await carregarProdutos(params);
      
      // Try AI recommendation if age or gender provided
      if (params.idade || params.genero) {
        try {
          const recomendacaoIA = await gerarRecomendacaoIA({
            idade: params.idade,
            genero: params.genero,
            orcamento: params.precoMax
          });
          
          if (recomendacaoIA && recomendacaoIA.sucesso && recomendacaoIA.dados) {
            const recomendacaoSection = document.getElementById('recomendacao');
            const sugestaoDiv = document.getElementById('sugestao');
            
            if (recomendacaoSection && sugestaoDiv) {
              recomendacaoSection.style.display = '';
              sugestaoDiv.innerHTML = `
                <strong>🤖 Recomendação IA:</strong><br>
                ${recomendacaoIA.dados.resposta || recomendacaoIA.dados}
              `;
            }
          }
        } catch (error) {
          console.log('Recomendação IA opcional falhou:', error);
        }
      }
      
    } catch (error) {
      console.error('Erro na submissão do formulário:', error);
      showMensagem('Erro ao processar busca. Tente novamente.', true);
    }
  });
}

// =============================================================================
// EVENT LISTENERS E INICIALIZAÇÃO
// =============================================================================

// Configurar eventos quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing Easy Gift Search...');
  
  // Initialize dark mode and language switcher
  initializeDarkMode();
  initializeLanguageSwitcher();
  
  // Initialize enhanced search functionality
  initializeSearchFunctionality();
  
  // Configurar botão de busca IA
  const btnAIPowered = document.getElementById('btnAIPowered');
  if (btnAIPowered) {
    btnAIPowered.onclick = executarBuscaIA;
  }
  
  // Configurar navegação entre abas
  configurarNavegacaoAbas();
  
  console.log('✅ Easy Gift Search initialized successfully');
});

// Expor funções globalmente para uso em outros contextos
window.executarBuscaIA = executarBuscaIA;
window.buscarLojasProximas = buscarLojasProximas;
window.buscarShoppings = buscarShoppings;
window.gerarRecomendacaoIA = gerarRecomendacaoIA;

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