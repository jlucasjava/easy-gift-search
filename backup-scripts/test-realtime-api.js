// Test Real-Time Product Search API Integration
require('dotenv').config();
const realTimeProductService = require('./services/realTimeProductService');
const { displayAPIStatus } = require('./config/apiStatus');

async function testRealTimeAPI() {
  console.log('🕒 ========== TESTE DO REAL-TIME PRODUCT SEARCH API ==========');
  console.log('📅 Data/Hora:', new Date().toLocaleString('pt-BR'));
  console.log('');

  // Display current API status
  displayAPIStatus();

  console.log('🔍 Iniciando teste do Real-Time Product Search API...');
  console.log('');

  const testCases = [
    {
      name: 'Busca por presentes gerais',
      filtros: {
        palavra_chave: 'gift',
        precoMin: 10,
        precoMax: 100
      }
    },
    {
      name: 'Busca por presentes femininos',
      filtros: {
        palavra_chave: 'gift',
        genero: 'feminino',
        idade: 25
      }
    },
    {
      name: 'Busca por eletrônicos',
      filtros: {
        palavra_chave: 'electronics gadget',
        precoMin: 50,
        precoMax: 200
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 Teste: ${testCase.name}`);
    console.log(`📊 Filtros:`, testCase.filtros);
    
    try {
      const startTime = Date.now();
      const produtos = await realTimeProductService.buscarProdutos(testCase.filtros);
      const endTime = Date.now();
      
      console.log(`✅ Busca concluída em ${endTime - startTime}ms`);
      console.log(`📦 Produtos encontrados: ${produtos.length}`);
      
      if (produtos.length > 0) {
        console.log('📝 Amostra dos produtos:');
        produtos.slice(0, 3).forEach((produto, index) => {
          console.log(`   ${index + 1}. ${produto.nome}`);
          console.log(`      💰 Preço: R$ ${produto.preco}`);
          console.log(`      🏪 Marketplace: ${produto.marketplace}`);
          console.log(`      🔗 Link: ${produto.link}`);
          console.log(`      📊 API usado: ${produto.api_usado}`);
          console.log('');
        });
      }
      
    } catch (error) {
      console.log(`❌ Erro no teste: ${error.message}`);
    }
    
    console.log('─'.repeat(50));
    console.log('');
  }

  // Test API configuration specifically
  console.log('🔧 VERIFICAÇÃO DE CONFIGURAÇÃO:');
  console.log(`USE_REAL_REALTIME_API: ${process.env.USE_REAL_REALTIME_API}`);
  console.log(`RAPIDAPI_KEY disponível: ${process.env.RAPIDAPI_KEY ? 'SIM' : 'NÃO'}`);
  console.log(`RAPIDAPI_KEY_NEW disponível: ${process.env.RAPIDAPI_KEY_NEW ? 'SIM' : 'NÃO'}`);
  
  const useReal = process.env.USE_REAL_REALTIME_API === 'true';
  const hasKey = !!(process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY_NEW);
  
  if (useReal && hasKey) {
    console.log('✅ CONFIGURAÇÃO: API REAL DEVE SER USADA');
  } else if (useReal && !hasKey) {
    console.log('⚠️ CONFIGURAÇÃO: API REAL SOLICITADA MAS SEM CHAVE - USANDO MOCK');
  } else {
    console.log('📦 CONFIGURAÇÃO: USANDO DADOS MOCK');
  }

  console.log('');
  console.log('🎯 TESTE CONCLUÍDO!');
  console.log('='.repeat(65));
}

// Execute test
testRealTimeAPI().catch(error => {
  console.error('❌ Erro fatal no teste:', error);
  process.exit(1);
});
