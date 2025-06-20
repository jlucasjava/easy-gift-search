// Script para verificar o status atual das APIs - Versão Google Search Only
require('dotenv').config();
const { displayAPIStatus } = require('./config/apiStatus');

console.log('🔍 VERIFICANDO STATUS ATUAL DAS APIS...\n');

// Mostrar status das configurações
displayAPIStatus();

console.log('\n📊 RESUMO DA CONFIGURAÇÃO ATUAL:\n');

// Verificar Google Search API
console.log('🔧 API DE BUSCA:');
console.log(`   Google Custom Search: ${process.env.USE_GOOGLE_SEARCH_API === 'true' ? '✅ ATIVA' : '❌ INATIVA'}`);

console.log('\n🔑 CHAVES DE API:');
console.log(`   GOOGLE_SEARCH_API_KEY: ${process.env.GOOGLE_SEARCH_API_KEY ? '✅ CONFIGURADA' : '❌ NÃO CONFIGURADA'}`);
console.log(`   GOOGLE_SEARCH_CX: ${process.env.GOOGLE_SEARCH_CX ? '✅ CONFIGURADO' : '❌ NÃO CONFIGURADO'}`);

// Verificar inconsistências na configuração
console.log('\n⚠️ VERIFICAÇÃO DE INCONSISTÊNCIAS:');
if (process.env.USE_GOOGLE_SEARCH_API === 'true') {
  if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_CX) {
    console.log('   ⚠️ Google Search API está ATIVA mas faltam chaves de configuração');
  } else {
    console.log('   ✅ Google Search API está corretamente configurada');
  }
} else {
  console.log('   ⚠️ Google Search API está INATIVA - sistema não funcionará corretamente');
}

console.log('\n🚀 STATUS DA API:');
if (process.env.USE_GOOGLE_SEARCH_API === 'true' && process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_CX) {
  console.log('   ✅ Google Custom Search API está OPERACIONAL');
  console.log('   📝 Chaves necessárias estão configuradas');
} else {
  console.log('   ❌ Google Custom Search API NÃO está operacional');
  if (!process.env.GOOGLE_SEARCH_API_KEY) console.log('   ❌ Falta: GOOGLE_SEARCH_API_KEY');
  if (!process.env.GOOGLE_SEARCH_CX) console.log('   ❌ Falta: GOOGLE_SEARCH_CX');
  if (process.env.USE_GOOGLE_SEARCH_API !== 'true') console.log('   ❌ Falta: USE_GOOGLE_SEARCH_API=true');
}

console.log('\n' + '='.repeat(60));
console.log('✅ VERIFICAÇÃO CONCLUÍDA!');

console.log('\n🎯 RECOMENDAÇÕES PARA PRODUÇÃO:');
if (process.env.USE_GOOGLE_SEARCH_API !== 'true' || !process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_CX) {
  console.log('   🚨 CRÍTICO: Configure as variáveis de ambiente da Google Search API');
  console.log('   📋 Necessário: GOOGLE_SEARCH_API_KEY, GOOGLE_SEARCH_CX e USE_GOOGLE_SEARCH_API=true');
} else {
  console.log('   ✅ ÓTIMO: Google Custom Search API configurada corretamente');
}

console.log('\n📋 PRÓXIMOS PASSOS:');
console.log('   1. Configure as variáveis no dashboard da plataforma de deploy');
console.log('   2. Use valores reais para as chaves da API Google');
console.log('   3. Faça redeploy da aplicação');
console.log('   4. Teste o endpoint /api/new-apis/teste-todas para confirmar a operação');
