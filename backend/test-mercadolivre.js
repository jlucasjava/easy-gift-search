// Teste do serviço do Mercado Livre com produtos reais
require('dotenv').config();
const mercadoLivreService = require('./services/mercadoLivreService');

async function testarMercadoLivre() {
  console.log('🧪 Testando serviço do Mercado Livre...');
  console.log('🔧 Variável USE_REAL_MERCADOLIVRE_API:', process.env.USE_REAL_MERCADOLIVRE_API);
  console.log('');
  
  try {
    // Teste 1: Busca geral
    console.log('📍 Teste 1: Busca geral');
    const produtos1 = await mercadoLivreService.buscarProdutos({});
    console.log(`Produtos encontrados: ${produtos1.length}`);
    if (produtos1.length > 0) {
      console.log('Primeiro produto:', {
        nome: produtos1[0].nome,
        preco: produtos1[0].preco,
        url: produtos1[0].url,
        imagem: produtos1[0].imagem ? 'SIM' : 'NÃO'
      });
    }
    console.log('');

    // Teste 2: Busca com filtro de preço
    console.log('📍 Teste 2: Busca com filtro de preço (R$ 50 - R$ 200)');
    const produtos2 = await mercadoLivreService.buscarProdutos({
      precoMin: 50,
      precoMax: 200
    });
    console.log(`Produtos encontrados: ${produtos2.length}`);
    if (produtos2.length > 0) {
      console.log('Primeiro produto:', {
        nome: produtos2[0].nome,
        preco: produtos2[0].preco,
        url: produtos2[0].url
      });
    }
    console.log('');

    // Teste 3: Busca com filtro de gênero
    console.log('📍 Teste 3: Busca para público feminino');
    const produtos3 = await mercadoLivreService.buscarProdutos({
      genero: 'feminino'
    });
    console.log(`Produtos encontrados: ${produtos3.length}`);
    if (produtos3.length > 0) {
      console.log('Primeiro produto:', {
        nome: produtos3[0].nome,
        preco: produtos3[0].preco,
        url: produtos3[0].url
      });
    }
    console.log('');

    // Verificar se todas as URLs são válidas
    console.log('📍 Verificando validade das URLs...');
    let urlsValidas = 0;
    let imagensValidas = 0;
    
    for (const produto of produtos1.slice(0, 3)) {
      if (produto.url && produto.url.includes('mercadolivre.com.br')) {
        urlsValidas++;
      }
      if (produto.imagem && produto.imagem.startsWith('https://')) {
        imagensValidas++;
      }
    }
    
    console.log(`URLs válidas: ${urlsValidas}/3`);
    console.log(`Imagens válidas: ${imagensValidas}/3`);
    
    console.log('\n✅ Teste do Mercado Livre concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testarMercadoLivre();
