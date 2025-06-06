// Script para verificar o status atual das APIs
require('dotenv').config();
const { displayAPIStatus } = require('./config/apiStatus');

console.log('🔍 VERIFICANDO STATUS ATUAL DAS APIS...\n');

// Mostrar status das configurações
displayAPIStatus();

console.log('\n📊 RESUMO DAS CONFIGURAÇÕES ATUAIS:\n');

// Verificar cada API individualmente
console.log('🔧 APIS MARKETPLACE:');
console.log(`   Amazon: ${process.env.USE_REAL_AMAZON_API === 'true' ? '✅ ATIVA' : '❌ INATIVA'}`);
console.log(`   Shopee: ${process.env.USE_REAL_SHOPEE_API === 'true' ? '✅ ATIVA' : '❌ INATIVA'}`);
console.log(`   AliExpress: ${process.env.USE_REAL_ALIEXPRESS_API === 'true' ? '✅ ATIVA' : '❌ INATIVA'}`);
console.log(`   Mercado Livre: ${process.env.USE_REAL_MERCADOLIVRE_API === 'true' ? '✅ ATIVA' : '❌ INATIVA'}`);
console.log(`   Real-Time Search: ${process.env.USE_REAL_REALTIME_API === 'true' ? '✅ ATIVA' : '❌ INATIVA'}`);

console.log('\n🔑 CHAVES DE API:');
console.log(`   RAPIDAPI_KEY: ${process.env.RAPIDAPI_KEY ? '✅ CONFIGURADA' : '❌ NÃO CONFIGURADA'}`);
console.log(`   SHOPEE_SCRAPER_API_KEY: ${process.env.SHOPEE_SCRAPER_API_KEY ? '✅ CONFIGURADA' : '❌ NÃO CONFIGURADA'}`);
console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ CONFIGURADA' : '❌ NÃO CONFIGURADA'}`);

console.log('\n🚀 APIS ATIVAS ATUALMENTE:');
const apisAtivas = [];
if (process.env.USE_REAL_AMAZON_API === 'true' && process.env.RAPIDAPI_KEY) {
  apisAtivas.push('Amazon (RapidAPI)');
}
if (process.env.USE_REAL_SHOPEE_API === 'true' && process.env.SHOPEE_SCRAPER_API_KEY) {
  apisAtivas.push('Shopee (Scraper API)');
}
if (process.env.USE_REAL_ALIEXPRESS_API === 'true' && process.env.RAPIDAPI_KEY) {
  apisAtivas.push('AliExpress (RapidAPI)');
}
if (process.env.USE_REAL_MERCADOLIVRE_API === 'true') {
  apisAtivas.push('Mercado Livre (API Pública)');
}
if (process.env.USE_REAL_REALTIME_API === 'true' && process.env.RAPIDAPI_KEY) {
  apisAtivas.push('Real-Time Product Search (RapidAPI)');
}
if (process.env.OPENAI_API_KEY) {
  apisAtivas.push('OpenAI (Recomendações)');
}

if (apisAtivas.length > 0) {
  apisAtivas.forEach(api => console.log(`   ✅ ${api}`));
  console.log(`\n📈 TOTAL: ${apisAtivas.length} APIs ativas`);
} else {
  console.log('   ❌ NENHUMA API REAL ESTÁ ATIVA');
  console.log('   🔧 Todas as APIs estão usando dados mock');
}

console.log('\n' + '='.repeat(60));
console.log('✅ VERIFICAÇÃO CONCLUÍDA!');
