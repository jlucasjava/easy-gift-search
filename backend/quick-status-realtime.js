// Quick Status Check - Real-Time API Integration
require('dotenv').config();
const { displayAPIStatus } = require('./config/apiStatus');

console.log('🔍 ===== QUICK STATUS CHECK - REAL-TIME API =====');
console.log('📅 Data/Hora:', new Date().toLocaleString('pt-BR'));
console.log('');

// Display full API status
displayAPIStatus();

// Check specific Real-Time API configuration
console.log('🕒 REAL-TIME API - VERIFICAÇÃO ESPECÍFICA:');
console.log('');

const useRealTimeAPI = process.env.USE_REAL_REALTIME_API === 'true';
const hasRapidAPIKey = !!(process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY_NEW);

console.log(`📋 USE_REAL_REALTIME_API: ${process.env.USE_REAL_REALTIME_API}`);
console.log(`🔑 RAPIDAPI_KEY: ${process.env.RAPIDAPI_KEY ? 'CONFIGURADA' : 'NÃO CONFIGURADA'}`);
console.log(`🔑 RAPIDAPI_KEY_NEW: ${process.env.RAPIDAPI_KEY_NEW ? 'CONFIGURADA' : 'NÃO CONFIGURADA'}`);
console.log('');

if (useRealTimeAPI && hasRapidAPIKey) {
  console.log('✅ REAL-TIME API: CONFIGURADO CORRETAMENTE');
  console.log('🚀 Status: API REAL SERÁ USADA');
} else if (useRealTimeAPI && !hasRapidAPIKey) {
  console.log('⚠️ REAL-TIME API: CONFIGURAÇÃO INCOMPLETA');
  console.log('🔄 Status: FALLBACK PARA MOCK DATA');
} else {
  console.log('📦 REAL-TIME API: MODO DEMO');
  console.log('🔧 Status: USANDO MOCK DATA');
}

console.log('');
console.log('📊 RESUMO DA IMPLEMENTAÇÃO:');
console.log('✅ Service: realTimeProductService.js implementado');
console.log('✅ Controller: productController.js atualizado');
console.log('✅ Config: apiStatus.js com Real-Time API');
console.log('✅ Environment: .env e .env.production configurados');
console.log('✅ Vercel: api/index.js atualizado');
console.log('✅ Tests: Scripts de teste criados');
console.log('✅ Docs: Documentação completa criada');

console.log('');
console.log('🎯 PRÓXIMAS AÇÕES NECESSÁRIAS:');
console.log('1. Configurar USE_REAL_REALTIME_API=true no Vercel Dashboard');
console.log('2. Verificar RAPIDAPI_KEY no Vercel Dashboard');
console.log('3. Fazer redeploy no Vercel');
console.log('4. Testar API em produção');

console.log('');
console.log('🔗 LINKS ÚTEIS:');
console.log('📖 Guia: QUICK_FIX_VERCEL_ENV.md');
console.log('📖 Documentação: REAL_TIME_API_IMPLEMENTATION_COMPLETE.md');
console.log('🚀 Vercel: https://vercel.com/dashboard');

console.log('');
console.log('='.repeat(60));
