// Teste rápido para verificar status da produção após configuração das variáveis
// Uso: node test-production-fix.js

const https = require('https');

const CONFIG = {
  // Substitua pela URL da sua aplicação em produção
  PRODUCTION_URL: 'https://your-app.render.com', // ou Vercel URL
  TEST_ENDPOINTS: [
    '/api/status',
    '/api/health'
  ]
};

console.log('🔍 TESTANDO CONFIGURAÇÃO DE PRODUÇÃO...\n');

async function testProductionEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${CONFIG.PRODUCTION_URL}${endpoint}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ endpoint, status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ endpoint, status: res.statusCode, data: data, error: 'Invalid JSON' });
        }
      });
    }).on('error', (error) => {
      reject({ endpoint, error: error.message });
    });
  });
}

async function runProductionTests() {
  console.log(`📡 URL de Produção: ${CONFIG.PRODUCTION_URL}\n`);

  for (const endpoint of CONFIG.TEST_ENDPOINTS) {
    try {
      console.log(`⏳ Testando: ${endpoint}`);
      const result = await testProductionEndpoint(endpoint);
      
      if (result.status === 200) {
        console.log(`✅ ${endpoint}: Status OK`);
        
        // Análise específica para status das APIs
        if (endpoint === '/api/status' && result.data) {
          const apiStatus = result.data;
          console.log('\n📊 STATUS DAS APIs:');
          
          // Verificar se as variáveis estão definidas
          if (apiStatus.environment_variables) {
            const env = apiStatus.environment_variables;
            console.log(`📋 USE_REAL_AMAZON_API: ${env.USE_REAL_AMAZON_API || 'undefined'}`);
            console.log(`📋 USE_REAL_SHOPEE_API: ${env.USE_REAL_SHOPEE_API || 'undefined'}`);
            console.log(`📋 USE_REAL_ALIEXPRESS_API: ${env.USE_REAL_ALIEXPRESS_API || 'undefined'}`);
            console.log(`📋 USE_REAL_MERCADOLIVRE_API: ${env.USE_REAL_MERCADOLIVRE_API || 'undefined'}`);
            console.log(`📋 USE_REAL_REALTIME_API: ${env.USE_REAL_REALTIME_API || 'undefined'}`);
            
            console.log('\n🔑 CHAVES DE API:');
            console.log(`🔑 RAPIDAPI_KEY: ${env.RAPIDAPI_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
            console.log(`🔑 RAPIDAPI_KEY_NEW: ${env.RAPIDAPI_KEY_NEW ? '✅ Configurada' : '❌ Não configurada'}`);
            console.log(`🔑 SHOPEE_SCRAPER_API_KEY: ${env.SHOPEE_SCRAPER_API_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
            console.log(`🔑 OPENAI_API_KEY: ${env.OPENAI_API_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
          }
          
          // Verificar quantas APIs estão ativas
          if (apiStatus.api_status) {
            const activeApis = Object.values(apiStatus.api_status).filter(status => 
              status === 'ativa' || status === 'active' || status === true
            ).length;
            const totalApis = Object.keys(apiStatus.api_status).length;
            
            console.log(`\n🔧 STATUS GERAL: ${activeApis}/${totalApis} APIs ativas`);
            
            if (activeApis === 0) {
              console.log('🚨 PROBLEMA: Todas as APIs em modo MOCK!');
              console.log('⚠️ Verifique se as variáveis de ambiente estão configuradas no dashboard da plataforma.');
            } else if (activeApis >= 3) {
              console.log('✅ SUCESSO: APIs reais funcionando!');
            } else {
              console.log('⚠️ PARCIAL: Algumas APIs ativas, outras em modo mock.');
            }
          }
        }
        
      } else {
        console.log(`❌ ${endpoint}: Status ${result.status}`);
      }
      
      console.log(''); // linha em branco
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.error}`);
      console.log(''); // linha em branco
    }
  }
}

// Instruções de uso
console.log('📋 INSTRUÇÕES:');
console.log('1. Edite CONFIG.PRODUCTION_URL com a URL da sua aplicação');
console.log('2. Execute: node test-production-fix.js');
console.log('3. Verifique se todas as APIs mostram como ativas\n');

// Executar se URL foi configurada
if (CONFIG.PRODUCTION_URL === 'https://your-app.render.com') {
  console.log('⚠️ Configure CONFIG.PRODUCTION_URL antes de executar o teste!');
} else {
  runProductionTests();
}
