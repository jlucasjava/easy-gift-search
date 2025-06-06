// Teste simples do status atual
require('dotenv').config();

console.log('🔍 STATUS RÁPIDO DAS APIS:\n');

console.log('📋 VARIÁVEIS DE CONTROLE:');
console.log(`   USE_REAL_AMAZON_API: ${process.env.USE_REAL_AMAZON_API || 'undefined'}`);
console.log(`   USE_REAL_SHOPEE_API: ${process.env.USE_REAL_SHOPEE_API || 'undefined'}`);
console.log(`   USE_REAL_ALIEXPRESS_API: ${process.env.USE_REAL_ALIEXPRESS_API || 'undefined'}`);
console.log(`   USE_REAL_MERCADOLIVRE_API: ${process.env.USE_REAL_MERCADOLIVRE_API || 'undefined'}`);
console.log(`   USE_REAL_REALTIME_API: ${process.env.USE_REAL_REALTIME_API || 'undefined'}`);

console.log('\n🔑 CHAVES DE API:');
console.log(`   RAPIDAPI_KEY: ${process.env.RAPIDAPI_KEY ? 'CONFIGURADA' : 'NÃO CONFIGURADA'}`);
console.log(`   RAPIDAPI_KEY_NEW: ${process.env.RAPIDAPI_KEY_NEW ? 'CONFIGURADA' : 'NÃO CONFIGURADA'}`);
console.log(`   SHOPEE_SCRAPER_API_KEY: ${process.env.SHOPEE_SCRAPER_API_KEY ? 'CONFIGURADA' : 'NÃO CONFIGURADA'}`);
console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'CONFIGURADA' : 'NÃO CONFIGURADA'}`);

// Contar APIs ativas
let apisAtivas = 0;
if (process.env.USE_REAL_AMAZON_API === 'true' && process.env.RAPIDAPI_KEY) apisAtivas++;
if (process.env.USE_REAL_SHOPEE_API === 'true' && process.env.SHOPEE_SCRAPER_API_KEY) apisAtivas++;
if (process.env.USE_REAL_ALIEXPRESS_API === 'true' && (process.env.RAPIDAPI_KEY_NEW || process.env.RAPIDAPI_KEY)) apisAtivas++;
if (process.env.USE_REAL_MERCADOLIVRE_API === 'true') apisAtivas++;
if (process.env.USE_REAL_REALTIME_API === 'true' && (process.env.RAPIDAPI_KEY_NEW || process.env.RAPIDAPI_KEY)) apisAtivas++;

console.log(`\n📊 RESUMO: ${apisAtivas}/5 APIs de marketplace ativas`);

if (apisAtivas === 0) {
  console.log('🚨 MODO DEMO COMPLETO - Configurar variáveis de ambiente');
} else if (apisAtivas < 5) {
  console.log(`⚠️ MODO PARCIAL - ${5-apisAtivas} APIs ainda em mock`);
} else {
  console.log('✅ MODO PRODUÇÃO COMPLETO - Todas as APIs ativas');
}
