// Teste direto das variáveis de ambiente
require('dotenv').config();

console.log('🔍 VERIFICAÇÃO COMPLETA DAS VARIÁVEIS DE AMBIENTE:\n');

console.log('📋 VARIABLES DE APIS REAIS:');
console.log('USE_REAL_AMAZON_API:', process.env.USE_REAL_AMAZON_API);
console.log('USE_REAL_SHOPEE_API:', process.env.USE_REAL_SHOPEE_API);
console.log('USE_REAL_ALIEXPRESS_API:', process.env.USE_REAL_ALIEXPRESS_API);
console.log('USE_REAL_MERCADOLIVRE_API:', process.env.USE_REAL_MERCADOLIVRE_API);

console.log('\n🔑 CHAVES RAPIDAPI:');
console.log('RAPIDAPI_KEY existe:', !!process.env.RAPIDAPI_KEY);
console.log('RAPIDAPI_KEY_NEW existe:', !!process.env.RAPIDAPI_KEY_NEW);

console.log('\n🧪 TESTANDO CONDIÇÕES DOS SERVIÇOS:\n');

// Teste Amazon
const amazonCondition = process.env.USE_REAL_AMAZON_API === 'true' && process.env.RAPIDAPI_KEY;
console.log('✅ Amazon usará API real?', amazonCondition ? 'SIM' : 'NÃO');

// Teste Shopee  
const shopeeCondition = process.env.USE_REAL_SHOPEE_API === 'true' && process.env.RAPIDAPI_KEY;
console.log('✅ Shopee usará API real?', shopeeCondition ? 'SIM' : 'NÃO');

// Teste AliExpress
const aliexpressCondition = process.env.USE_REAL_ALIEXPRESS_API === 'true' && process.env.RAPIDAPI_KEY_NEW;
console.log('✅ AliExpress usará API real?', aliexpressCondition ? 'SIM' : 'NÃO');

// Teste Mercado Livre
const mlCondition = process.env.USE_REAL_MERCADOLIVRE_API === 'true';
console.log('✅ Mercado Livre usará API real?', mlCondition ? 'SIM' : 'NÃO');

console.log('\n🔧 DIAGNÓSTICO:');
if (!amazonCondition) console.log('❌ Amazon: Falta USE_REAL_AMAZON_API=true ou RAPIDAPI_KEY');
if (!shopeeCondition) console.log('❌ Shopee: Falta USE_REAL_SHOPEE_API=true ou RAPIDAPI_KEY');
if (!aliexpressCondition) console.log('❌ AliExpress: Falta USE_REAL_ALIEXPRESS_API=true ou RAPIDAPI_KEY_NEW');
if (!mlCondition) console.log('❌ Mercado Livre: Falta USE_REAL_MERCADOLIVRE_API=true');

// Teste direto dos serviços
console.log('\n🧪 TESTE DIRETO DOS SERVIÇOS:\n');

async function testarServicos() {
  const amazonService = require('./services/amazonService');
  const shopeeService = require('./services/shopeeService');
  const aliexpressService = require('./services/aliexpressService');
  
  console.log('📦 Testando Amazon...');
  try {
    const amazonResult = await amazonService.buscarProdutos({ genero: 'test' });
    console.log(`   Produtos encontrados: ${amazonResult.length}`);
    if (amazonResult.length > 0 && amazonResult[0].url && amazonResult[0].url.includes('amazon.com')) {
      console.log('   ✅ Amazon usando dados REAIS!');
    } else {
      console.log('   ❌ Amazon usando dados MOCK');
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  
  console.log('\n🛍️ Testando Shopee...');
  try {
    const shopeeResult = await shopeeService.buscarProdutos({ genero: 'test' });
    console.log(`   Produtos encontrados: ${shopeeResult.length}`);
    if (shopeeResult.length > 0 && shopeeResult[0].url && shopeeResult[0].url.includes('shopee.com')) {
      console.log('   ✅ Shopee usando dados REAIS!');
    } else {
      console.log('   ❌ Shopee usando dados MOCK');
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  
  console.log('\n🛒 Testando AliExpress...');
  try {
    const aliexpressResult = await aliexpressService.buscarProdutos({ genero: 'test' });
    console.log(`   Produtos encontrados: ${aliexpressResult.length}`);
    if (aliexpressResult.length > 0 && aliexpressResult[0].url && aliexpressResult[0].url.includes('aliexpress.com')) {
      console.log('   ✅ AliExpress usando dados REAIS!');
    } else {
      console.log('   ❌ AliExpress usando dados MOCK');
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
}

testarServicos().catch(console.error);
