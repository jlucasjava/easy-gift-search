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
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/products?${query}`);
    if (!res.ok) throw new Error('Erro ao buscar produtos.');
    return await res.json();
  } catch (e) {
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
        <a href="${prod.url}" target="_blank">${t('ver_marketplace')}</a>
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
  try {
    const res = await fetch(`${API_URL}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(perfil)
    });
    if (!res.ok) throw new Error('Erro ao buscar sugestão.');
    return await res.json();
  } catch (e) {
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
  const { sugestao, produtosRelacionados } = await recomendarPresente(perfil);
  sugestaoProdutos = produtosRelacionados || [];
  sugestaoTexto = sugestao || '';
  renderSugestao(sugestaoTexto, sugestaoProdutos, sugestaoIndex, SUGESTAO_LIMIT);
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
  produtos.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${prod.imagem}" alt="${prod.nome}" loading="lazy">
      <h3>${prod.nome}</h3>
      <p>R$ ${prod.preco}</p>
      <a href="${prod.url}" target="_blank">${t('ver_marketplace')}</a>
      <button onclick="favoritarProduto('${prod.id}', '${prod.nome.replace(/'/g, '')}')">${t('favoritar')}</button>
    `;
    grid.appendChild(card);
  });
}

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
    idade: document.getElementById('idadeInput').value,
    genero: document.getElementById('generoSelect').value,
    page: 1
  };
  carregarProdutos(params);
  carregarRecomendacao(true);
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

// Inicialização
carregarProdutos();
carregarRecomendacao(true);

// Dark mode toggle
const btnToggleDark = document.getElementById('toggleDark');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (localStorage.getItem('darkMode') === 'true' || (!localStorage.getItem('darkMode') && prefersDark)) {
  document.body.classList.add('dark');
  btnToggleDark.textContent = '☀️';
}
btnToggleDark.onclick = () => {
  const isDark = document.body.classList.toggle('dark');
  btnToggleDark.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('darkMode', isDark);
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

// Botão de troca de idioma
const btnLang = document.createElement('button');
btnLang.id = 'btnLang';
btnLang.type = 'button';
btnLang.style.position = 'absolute';
btnLang.style.top = '1.2rem';
btnLang.style.right = '3.8rem';
btnLang.style.zIndex = '10';
btnLang.style.minWidth = '40px';
btnLang.style.minHeight = '40px';
btnLang.style.fontSize = '1.3rem';
btnLang.setAttribute('aria-label', 'Trocar idioma / Switch language');
btnLang.textContent = localStorage.getItem('lang') === 'en' ? '🇧🇷' : '🇺🇸';
document.body.appendChild(btnLang);

function atualizarIdioma(lang) {
  localStorage.setItem('lang', lang);
  btnVerResultados.textContent = t('resultados');
  btnVerFavoritos.textContent = t('favoritos');
  document.getElementById('resultadosTitle').textContent = t('resultados');
  document.getElementById('favoritosTitle').textContent = t('favoritos');
  document.getElementById('recomendacaoTitle').textContent = t('recomendacao');
  document.getElementById('precoMin').placeholder = t('preco_min');
  document.getElementById('idadeInput').placeholder = t('idade');
  document.getElementById('generoSelect').options[0].text = t('genero');
  document.getElementById('generoSelect').options[1].text = t('masculino');
  document.getElementById('generoSelect').options[2].text = t('feminino');
  document.getElementById('generoSelect').options[3].text = t('unissex');
  document.getElementById('searchForm').querySelector('button[type="submit"]').textContent = t('buscar');
  document.getElementById('historicoBuscas').querySelector('h3').textContent = t('historico');
  renderFavoritos();
  carregarProdutos();
  carregarRecomendacao(true);
  btnLang.textContent = lang === 'en' ? '🇧🇷' : '🇺🇸';
}

btnLang.onclick = () => {
  const lang = localStorage.getItem('lang') === 'en' ? 'pt' : 'en';
  atualizarIdioma(lang);
};
/ /   F o r � a n d o   r e d e p l o y   V e r c e l   e m   2 0 2 5 - 0 5 - 2 9  
 