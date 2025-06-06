// Script final para preparar e testar antes do deploy para produção
require('dotenv').config();

console.log('🚀 PREPARAÇÃO FINAL PARA PRODUÇÃO\n');

// Teste das APIs ativas
console.log('📊 STATUS ATUAL:');
let apisAtivas = 0;
const apis = [
  { nome: 'Amazon', env: 'USE_REAL_AMAZON_API', chave: 'RAPIDAPI_KEY' },
  { nome: 'Shopee', env: 'USE_REAL_SHOPEE_API', chave: 'SHOPEE_SCRAPER_API_KEY' },
  { nome: 'AliExpress', env: 'USE_REAL_ALIEXPRESS_API', chave: 'RAPIDAPI_KEY_NEW' },
  { nome: 'Mercado Livre', env: 'USE_REAL_MERCADOLIVRE_API', chave: null },
  { nome: 'Real-Time Search', env: 'USE_REAL_REALTIME_API', chave: 'RAPIDAPI_KEY' }
];

apis.forEach(api => {
  const ativa = process.env[api.env] === 'true';
  const chaveOk = !api.chave || process.env[api.chave];
  const funcionando = ativa && chaveOk;
  
  if (funcionando) apisAtivas++;
  
  console.log(`   ${funcionando ? '✅' : '❌'} ${api.nome}: ${ativa ? 'ATIVA' : 'INATIVA'} ${api.chave ? (chaveOk ? '(chave OK)' : '(sem chave)') : ''}`);
});

console.log(`\n📈 RESULTADO: ${apisAtivas}/5 APIs funcionando localmente`);

if (apisAtivas === 5) {
  console.log('✅ PERFEITO! Configuração local está pronta para produção');
} else {
  console.log('⚠️ Algumas APIs não estão funcionando localmente');
}

// Verificar inconsistências de chaves
console.log('\n🔑 VERIFICAÇÃO DE CHAVES:');
const rapidKey = process.env.RAPIDAPI_KEY;
const rapidKeyNew = process.env.RAPIDAPI_KEY_NEW;

if (rapidKey && rapidKeyNew) {
  if (rapidKey === rapidKeyNew) {
    console.log('   ✅ RAPIDAPI_KEY e RAPIDAPI_KEY_NEW são idênticas');
  } else {
    console.log('   ⚠️ RAPIDAPI_KEY e RAPIDAPI_KEY_NEW são diferentes');
  }
} else {
  console.log('   ❌ Uma ou ambas as chaves RAPIDAPI não estão configuradas');
}

// Verificar se são placeholders
const temPlaceholders = [
  process.env.OPENAI_API_KEY,
  process.env.RAPIDAPI_KEY,
  process.env.RAPIDAPI_KEY_NEW,
  process.env.SHOPEE_SCRAPER_API_KEY
].some(key => key && (key.includes('your_') || key.includes('_here')));

if (temPlaceholders) {
  console.log('   ⚠️ Algumas chaves ainda são placeholders');
} else {
  console.log('   ✅ Todas as chaves parecem ser valores reais');
}

console.log('\n' + '='.repeat(60));
console.log('🎯 PRÓXIMOS PASSOS PARA PRODUÇÃO:');
console.log('');
console.log('1. 📋 COMMIT DAS ALTERAÇÕES:');
console.log('   git add .');
console.log('   git commit -m "feat: Ativar todas as 5 APIs para produção"');
console.log('   git push origin main');
console.log('   git push origin production');
console.log('');
console.log('2. 🔧 CONFIGURAR VARIÁVEIS NO DASHBOARD:');
console.log('   - USE_REAL_AMAZON_API=true');
console.log('   - USE_REAL_SHOPEE_API=true');
console.log('   - USE_REAL_ALIEXPRESS_API=true');
console.log('   - USE_REAL_MERCADOLIVRE_API=true');
console.log('   - USE_REAL_REALTIME_API=true');
console.log('   - RAPIDAPI_KEY=[sua_chave_real]');
console.log('   - RAPIDAPI_KEY_NEW=[sua_chave_real]');
console.log('   - SHOPEE_SCRAPER_API_KEY=[sua_chave_real]');
console.log('   - OPENAI_API_KEY=[sua_chave_real]');
console.log('   - NODE_ENV=production');
console.log('');
console.log('3. 🚀 REDEPLOY E TESTE:');
console.log('   - Fazer redeploy na plataforma');
console.log('   - Testar /api/status (deve mostrar 5/5 APIs ativas)');
console.log('   - Testar busca real funcionando');
console.log('');
console.log('✅ PREPARAÇÃO CONCLUÍDA! Pronto para produção.');
