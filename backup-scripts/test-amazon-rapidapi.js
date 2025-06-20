// Teste da nova API Amazon Real-Time via RapidAPI
require('dotenv').config();
const amazonService = require('./services/amazonService');

async function testarAmazonAPI() {
  console.log('🧪 TESTE: API Amazon Real-Time (RapidAPI)\n');
  
  // Verificar configuração
  console.log('🔧 Configuração:');
  console.log(`RAPIDAPI_KEY: ${process.env.RAPIDAPI_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log(`USE_REAL_AMAZON_API: ${process.env.USE_REAL_AMAZON_API || 'false'}\n`);
  
  // Teste 1: Busca simples
  console.log('📱 Teste 1: Busca por "smartphone"');
  try {
    const resultado1 = await amazonService.buscarProdutos({ genero: 'smartphone' });
    console.log(`✅ Resultado: ${resultado1.length} produtos encontrados`);
    if (resultado1.length > 0) {
      console.log(`📦 Primeiro produto: ${resultado1[0].nome} - R$ ${resultado1[0].preco}`);
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Teste 2: Busca com filtros
  console.log('🎯 Teste 2: Busca com filtros de preço');
  try {
    const resultado2 = await amazonService.buscarProdutos({ 
      genero: 'electronics',
      precoMin: 50,
      precoMax: 200
    });
    console.log(`✅ Resultado: ${resultado2.length} produtos no range R$ 50-200`);
    resultado2.forEach((produto, index) => {
      console.log(`${index + 1}. ${produto.nome} - R$ ${produto.preco}`);
    });
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Teste 3: Função de teste direto
  console.log('🔬 Teste 3: API real diretamente');
  try {
    const resultado3 = await amazonService.testarAPIReal();
    console.log(`✅ Teste direto: ${resultado3.length} produtos encontrados`);
  } catch (error) {
    console.error('❌ Erro no teste direto:', error.message);
  }
  
  console.log('\n🎉 Teste concluído!');
  
  // Instruções
  console.log('\n📋 Para ativar a API real:');
  console.log('1. Verifique se RAPIDAPI_KEY está configurada no .env');
  console.log('2. Mude USE_REAL_AMAZON_API=true no .env');
  console.log('3. Reinicie o servidor');
}

// Executar teste
if (require.main === module) {
  testarAmazonAPI()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { testarAmazonAPI };
