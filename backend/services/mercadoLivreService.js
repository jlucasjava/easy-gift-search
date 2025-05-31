const produtosVerificados = [
  {
    id: 'MLB2791789442',
    nome: 'Smartphone Motorola Moto G24 128gb 4gb Ram',
    preco: '699.00',
    imagem: 'https://http2.mlstatic.com/D_NQ_NP_2X_745110-MLU73325916471_122023-F.webp',
    url: 'https://produto.mercadolivre.com.br/MLB-2791789442-smartphone-motorola-moto-g24-128gb-4gb-ram-_JM',
    marketplace: 'Mercado Livre',
    genero: 'unisex',
    idadeMin: 16
  },
  {
    id: 'MLB1259788087',
    nome: 'Fone De Ouvido Bluetooth Jbl Tune 510bt',
    preco: '199.00',
    imagem: 'https://http2.mlstatic.com/D_NQ_NP_2X_648033-MLA46906185875_082021-F.webp',
    url: 'https://produto.mercadolivre.com.br/MLB-1259788087-fone-de-ouvido-bluetooth-jbl-tune-510bt-_JM',
    marketplace: 'Mercado Livre',
    genero: 'unisex',
    idadeMin: 12
  },
  {
    id: 'MLB3263665661',
    nome: 'Smartwatch Relogio Inteligente D20 Plus',
    preco: '89.90',
    imagem: 'https://http2.mlstatic.com/D_NQ_NP_2X_631015-MLU73259181517_122023-F.webp',
    url: 'https://produto.mercadolivre.com.br/MLB-3263665661-smartwatch-relogio-inteligente-d20-plus-_JM',
    marketplace: 'Mercado Livre',
    genero: 'unisex',
    idadeMin: 14
  },
  {
    id: 'MLB1924516102',
    nome: 'Kit Presente Perfume Importado + Brinde',
    preco: '159.90',
    imagem: 'https://http2.mlstatic.com/D_NQ_NP_2X_749812-MLU70158063705_062023-F.webp',
    url: 'https://produto.mercadolivre.com.br/MLB-1924516102-kit-presente-perfume-importado-brinde-_JM',
    marketplace: 'Mercado Livre',
    genero: 'feminino',
    idadeMin: 16
  },
  {
    id: 'MLB3541857447',
    nome: 'Tablet Samsung Galaxy Tab A8 64gb Wifi',
    preco: '799.00',
    imagem: 'https://http2.mlstatic.com/D_NQ_NP_2X_918192-MLA51119788820_082022-F.webp',
    url: 'https://produto.mercadolivre.com.br/MLB-3541857447-tablet-samsung-galaxy-tab-a8-64gb-wifi-_JM',
    marketplace: 'Mercado Livre',
    genero: 'unisex',
    idadeMin: 12
  },
  {
    id: 'MLB2095551045',
    nome: 'Livro Box Harry Potter Colecao Completa',
    preco: '89.90',
    imagem: 'https://http2.mlstatic.com/D_NQ_NP_2X_784215-MLB69298877869_052023-F.webp',
    url: 'https://produto.mercadolivre.com.br/MLB-2095551045-livro-box-harry-potter-colecao-completa-_JM',
    marketplace: 'Mercado Livre',
    genero: 'unisex',
    idadeMin: 10
  },
  {
    id: 'MLB1847694513',
    nome: 'Caixa De Som Bluetooth JBL Go 3 Original',
    preco: '179.90',
    imagem: 'https://http2.mlstatic.com/D_NQ_NP_2X_897090-MLU69533008544_052023-F.webp',
    url: 'https://produto.mercadolivre.com.br/MLB-1847694513-caixa-de-som-bluetooth-jbl-go-3-original-_JM',
    marketplace: 'Mercado Livre',
    genero: 'unisex',
    idadeMin: 12
  },
  {
    id: 'MLB3039876209',
    nome: 'Mouse Gamer Led Rgb 3200dpi Ergonomico',
    preco: '49.90',
    imagem: 'https://http2.mlstatic.com/D_NQ_NP_2X_847933-MLU70944865315_082023-F.webp',
    url: 'https://produto.mercadolivre.com.br/MLB-3039876209-mouse-gamer-led-rgb-3200dpi-ergonomico-_JM',
    marketplace: 'Mercado Livre',
    genero: 'masculino',
    idadeMin: 12
  },
  {
    id: 'MLB1535098263',
    nome: 'Carregador Portatil Power Bank 10000mah',
    preco: '69.90',
    imagem: 'https://http2.mlstatic.com/D_NQ_NP_2X_737551-MLU69952728112_062023-F.webp',
    url: 'https://produto.mercadolivre.com.br/MLB-1535098263-carregador-portatil-power-bank-10000mah-_JM',
    marketplace: 'Mercado Livre',
    genero: 'unisex',
    idadeMin: 14
  }
];

function aplicarFiltros(produtos, filtros) {
  let resultado = produtos;

  if (filtros.precoMin || filtros.precoMax) {
    const min = parseFloat(filtros.precoMin) || 0;
    const max = parseFloat(filtros.precoMax) || Infinity;
    resultado = resultado.filter(p => {
      const preco = parseFloat(p.preco);
      return preco >= min && preco <= max;
    });
    console.log(`Filtro preco: ${resultado.length} produtos`);
  }

  if (filtros.genero && filtros.genero.toLowerCase() !== 'nao informado') {
    const genero = filtros.genero.toLowerCase();
    resultado = resultado.filter(p => 
      p.genero === 'unisex' || p.genero === genero
    );
    console.log(`Filtro genero: ${resultado.length} produtos`);
  }

  if (filtros.idade) {
    const idade = parseInt(filtros.idade);
    resultado = resultado.filter(p => idade >= p.idadeMin);
    console.log(`Filtro idade: ${resultado.length} produtos`);
  }

  return resultado.sort(() => Math.random() - 0.5).slice(0, 9);
}

module.exports = {
  buscarProdutos: async function(filtros) {
    console.log('🛒 Buscando produtos do Mercado Livre');
    console.log('Filtros:', filtros);
    
    const produtos = aplicarFiltros(produtosVerificados, filtros || {});
    console.log(`✅ ${produtos.length} produtos encontrados`);
    return produtos;
  }
};
