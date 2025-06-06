// Script para preparar o projeto para produção
// Resolve inconsistências de variáveis de ambiente encontradas
require('dotenv').config();

console.log('🔧 PREPARANDO PROJETO PARA PRODUÇÃO...\n');

// Verificar inconsistências detectadas
console.log('🔍 VERIFICANDO INCONSISTÊNCIAS ATUAIS:\n');

console.log('1. 📋 VARIÁVEIS DE CONTROLE DE APIs:');
const apiControls = {
  'USE_REAL_AMAZON_API': process.env.USE_REAL_AMAZON_API,
  'USE_REAL_SHOPEE_API': process.env.USE_REAL_SHOPEE_API,
  'USE_REAL_ALIEXPRESS_API': process.env.USE_REAL_ALIEXPRESS_API,
  'USE_REAL_MERCADOLIVRE_API': process.env.USE_REAL_MERCADOLIVRE_API,
  'USE_REAL_REALTIME_API': process.env.USE_REAL_REALTIME_API
};

Object.entries(apiControls).forEach(([key, value]) => {
  const status = value === 'true' ? '✅ ATIVA' : 
                 value === 'false' ? '❌ INATIVA' : 
                 '⚠️ UNDEFINED';
  console.log(`   ${key}: ${status} (${value})`);
});

console.log('\n2. 🔑 CHAVES DE API:');
const apiKeys = {
  'RAPIDAPI_KEY': process.env.RAPIDAPI_KEY,
  'RAPIDAPI_KEY_NEW': process.env.RAPIDAPI_KEY_NEW,
  'SHOPEE_SCRAPER_API_KEY': process.env.SHOPEE_SCRAPER_API_KEY,
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY
};

Object.entries(apiKeys).forEach(([key, value]) => {
  const status = value ? 
    (value.includes('your_') || value.includes('_here') ? '⚠️ PLACEHOLDER' : '✅ CONFIGURADA') :
    '❌ NÃO CONFIGURADA';
  console.log(`   ${key}: ${status}`);
});

console.log('\n3. ⚠️ INCONSISTÊNCIAS DETECTADAS:');

// Verificar inconsistência RAPIDAPI_KEY vs RAPIDAPI_KEY_NEW
if (process.env.RAPIDAPI_KEY && process.env.RAPIDAPI_KEY_NEW) {
  if (process.env.RAPIDAPI_KEY === process.env.RAPIDAPI_KEY_NEW) {
    console.log('   ✅ RAPIDAPI_KEY e RAPIDAPI_KEY_NEW são idênticas');
  } else {
    console.log('   🚨 RAPIDAPI_KEY e RAPIDAPI_KEY_NEW são DIFERENTES');
    console.log('   📋 SOLUÇÃO: Use o mesmo valor para ambas');
  }
} else if (process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY_NEW) {
  console.log('   🚨 Apenas uma das chaves RAPIDAPI está configurada');
  console.log('   📋 SOLUÇÃO: Configure ambas com o mesmo valor');
} else {
  console.log('   🚨 Nenhuma chave RAPIDAPI configurada');
}

// Verificar placeholders
const hasPlaceholders = Object.values(apiKeys).some(value => 
  value && (value.includes('your_') || value.includes('_here'))
);

if (hasPlaceholders) {
  console.log('   🚨 Encontrados valores placeholder nas chaves de API');
  console.log('   📋 SOLUÇÃO: Substitua por suas chaves reais');
}

console.log('\n' + '='.repeat(70));
console.log('🎯 CONFIGURAÇÃO NECESSÁRIA PARA PRODUÇÃO:\n');

console.log('📋 VARIÁVEIS DE AMBIENTE OBRIGATÓRIAS:');
console.log('```bash');
console.log('# Controle de APIs - todas ativas para produção');
console.log('USE_REAL_AMAZON_API=true');
console.log('USE_REAL_SHOPEE_API=true');
console.log('USE_REAL_ALIEXPRESS_API=true');
console.log('USE_REAL_MERCADOLIVRE_API=true');
console.log('USE_REAL_REALTIME_API=true');
console.log('');
console.log('# Chaves de API - usar valores reais');
console.log('RAPIDAPI_KEY=[sua_chave_rapidapi]');
console.log('RAPIDAPI_KEY_NEW=[sua_chave_rapidapi]  # Mesmo valor que acima');
console.log('SHOPEE_SCRAPER_API_KEY=[sua_chave_shopee]');
console.log('OPENAI_API_KEY=[sua_chave_openai]');
console.log('');
console.log('# Ambiente');
console.log('NODE_ENV=production');
console.log('```');

console.log('\n🚀 RESULTADO ESPERADO:');
console.log('   📦 Amazon: API REAL ativa');
console.log('   🛍️ Shopee: API REAL ativa');
console.log('   🛒 AliExpress: API REAL ativa');
console.log('   🏪 Mercado Livre: API REAL ativa');
console.log('   🕒 Real-Time Search: API REAL ativa');
console.log('   🤖 OpenAI: Recomendações ativas');
console.log('   📊 TOTAL: 5/5 APIs de marketplace + IA ativas');

console.log('\n⚠️ AÇÃO IMEDIATA:');
console.log('   1. Configure as variáveis no dashboard da plataforma');
console.log('   2. Use as chaves reais (não placeholders)');
console.log('   3. Redeploy da aplicação');
console.log('   4. Teste /api/status para confirmar');

console.log('\n✅ PREPARAÇÃO PARA PRODUÇÃO CONCLUÍDA!');
