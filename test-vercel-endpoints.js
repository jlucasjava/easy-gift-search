// Script para criar um endpoint de status simples
const https = require('https');

// Configurar para ignorar problemas de certificado SSL em ambiente de desenvolvimento
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

function criarEndpointStatus() {
  // Primeiro, vamos verificar se conseguimos acessar a aplicação
  console.log('🔍 TESTANDO STATUS DA APLICAÇÃO...\n');
  
  // Teste direto na raiz da aplicação
  const options = {
    hostname: 'easy-gift-search.vercel.app',
    port: 443,
    path: '/',
    method: 'GET',
    timeout: 10000
  };
  
  const req = https.request(options, (res) => {
    console.log(`✅ Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, Object.keys(res.headers));
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📄 Response Length: ${data.length} characters`);
      
      if (res.statusCode === 200) {
        console.log('✅ APLICAÇÃO ACESSÍVEL - Site está online');
        
        // Agora vamos tentar testar endpoints conhecidos
        testarEndpointsConhecidos();
      } else {
        console.log('❌ PROBLEMA: Status code inesperado');
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ ERRO ao acessar aplicação:', error.message);
  });
  
  req.on('timeout', () => {
    console.error('⏱️ TIMEOUT: Aplicação não respondeu em 10 segundos');
    req.destroy();
  });
  
  req.end();
}

function testarEndpointsConhecidos() {
  console.log('\n🧪 TESTANDO ENDPOINTS CONHECIDOS...\n');
  
  const endpoints = [
    '/api/products',
    '/api/test',
    '/api/health',
    '/api/status',
    '/products',
    '/test',
    '/health',
    '/newapis/info'
  ];
  
  let testesCompletos = 0;
  const resultados = [];
  
  endpoints.forEach((endpoint, index) => {
    const options = {
      hostname: 'easy-gift-search.vercel.app',
      port: 443,
      path: endpoint,
      method: 'GET',
      timeout: 5000
    };
    
    const req = https.request(options, (res) => {
      const resultado = {
        endpoint,
        status: res.statusCode,
        accessible: res.statusCode < 500
      };
      
      console.log(`${res.statusCode < 400 ? '✅' : '❌'} ${endpoint}: ${res.statusCode}`);
      resultados.push(resultado);
      
      testesCompletos++;
      if (testesCompletos === endpoints.length) {
        mostrarResumoFinal(resultados);
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${endpoint}: ERRO - ${error.message}`);
      resultados.push({
        endpoint,
        status: 'ERROR',
        accessible: false,
        error: error.message
      });
      
      testesCompletos++;
      if (testesCompletos === endpoints.length) {
        mostrarResumoFinal(resultados);
      }
    });
    
    req.on('timeout', () => {
      console.log(`⏱️ ${endpoint}: TIMEOUT`);
      resultados.push({
        endpoint,
        status: 'TIMEOUT',
        accessible: false
      });
      req.destroy();
      
      testesCompletos++;
      if (testesCompletos === endpoints.length) {
        mostrarResumoFinal(resultados);
      }
    });
    
    req.end();
  });
}

function mostrarResumoFinal(resultados) {
  console.log('\n📊 RESUMO FINAL:\n');
  
  const funcionando = resultados.filter(r => r.accessible).length;
  const total = resultados.length;
  
  console.log(`🎯 Endpoints funcionando: ${funcionando}/${total}`);
  
  if (funcionando > 0) {
    console.log('\n✅ ENDPOINTS FUNCIONANDO:');
    resultados.filter(r => r.accessible).forEach(r => {
      console.log(`   ${r.endpoint} (${r.status})`);
    });
  }
  
  if (funcionando < total) {
    console.log('\n❌ ENDPOINTS COM PROBLEMA:');
    resultados.filter(r => !r.accessible).forEach(r => {
      console.log(`   ${r.endpoint} (${r.status})`);
    });
  }
  
  console.log('\n🔍 RECOMENDAÇÕES:');
  
  if (funcionando === 0) {
    console.log('   🚨 CRÍTICO: Nenhum endpoint acessível');
    console.log('   📋 Verificar se o deploy foi bem-sucedido');
    console.log('   🔧 Verificar logs do Vercel');
  } else if (funcionando < total) {
    console.log('   ⚠️ PARCIAL: Alguns endpoints não estão funcionando');
    console.log('   📋 Isso pode ser normal se nem todas as rotas foram implementadas');
  } else {
    console.log('   ✅ EXCELENTE: Todos os endpoints testados estão acessíveis');
    console.log('   📋 Aplicação parece estar funcionando corretamente');
  }
  
  console.log('\n🎯 PRÓXIMO PASSO:');
  console.log('   Configure as variáveis de ambiente no Vercel Dashboard');
  console.log('   Use o arquivo COPIAR_COLAR_VERCEL.md para as 9 variáveis');
}

// Iniciar teste
criarEndpointStatus();
