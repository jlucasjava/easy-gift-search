// Script para testar a configuração do Google Search API
require('dotenv').config();
const axios = require('axios');

// Função para exibir mensagem formatada no console
function log(message, color = 'white') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
  };

  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Verifica a configuração atual
async function verificarConfiguracao() {
  log('======== TESTE DE CONFIGURAÇÃO DO GOOGLE SEARCH API ========', 'cyan');
  
  // Variáveis de ambiente
  const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const googleCx = process.env.GOOGLE_SEARCH_CX;
  const useGoogleSearch = process.env.USE_GOOGLE_SEARCH_API;
  
  log('\n🔍 Variáveis de ambiente:', 'blue');
  log(`GOOGLE_SEARCH_API_KEY: ${googleApiKey ? '✅ Configurada' : '❌ Não configurada'}`, googleApiKey ? 'green' : 'red');
  log(`GOOGLE_SEARCH_CX: ${googleCx ? '✅ Configurado' : '❌ Não configurado'}`, googleCx ? 'green' : 'red');
  log(`USE_GOOGLE_SEARCH_API: ${useGoogleSearch || 'não definida'} ${useGoogleSearch === 'true' ? '✅' : '❌'}`, useGoogleSearch === 'true' ? 'green' : 'red');
  
  // Strings de verificação
  log('\n📊 Testes de condição booleana:', 'magenta');
  log(`useGoogleSearch === 'true': ${useGoogleSearch === 'true'}`, useGoogleSearch === 'true' ? 'green' : 'red');
  log(`useGoogleSearch === true: ${useGoogleSearch === true}`, useGoogleSearch === true ? 'green' : 'red');
  log(`useGoogleSearch == true: ${useGoogleSearch == true}`, useGoogleSearch == true ? 'green' : 'red');
  log(`useGoogleSearch === '1': ${useGoogleSearch === '1'}`, useGoogleSearch === '1' ? 'green' : 'red');
  
  // Teste de requisição à API do Google
  if (googleApiKey && googleCx && (useGoogleSearch === 'true' || useGoogleSearch === true || useGoogleSearch === '1')) {
    log('\n🔍 Testando requisição à API do Google...', 'blue');
    
    try {
      const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleCx}&q=presente&gl=br`;
      
      const response = await axios.get(googleUrl, { timeout: 10000 });
      
      if (response.data && response.data.items) {
        log(`✅ API do Google respondeu com sucesso! ${response.data.items.length} resultados encontrados.`, 'green');
        
        // Mostrar um exemplo de resultado
        if (response.data.items.length > 0) {
          const primeiroItem = response.data.items[0];
          log('\n📌 Exemplo de resultado:', 'yellow');
          log(`Título: ${primeiroItem.title}`, 'white');
          log(`Link: ${primeiroItem.link}`, 'white');
          if (primeiroItem.pagemap && primeiroItem.pagemap.cse_image) {
            log(`Imagem: ${primeiroItem.pagemap.cse_image[0]?.src || 'Não disponível'}`, 'white');
          }
        }
        
        return true;
      } else {
        log('❌ API do Google respondeu, mas sem resultados.', 'yellow');
      }
    } catch (error) {
      log(`❌ Erro ao testar API do Google: ${error.message}`, 'red');
      if (error.response) {
        log(`Status: ${error.response.status}`, 'red');
        log(`Mensagem: ${JSON.stringify(error.response.data)}`, 'red');
      }
    }
  } else {
    log('\n⚠️ Variáveis de ambiente incompletas. Não é possível testar a API do Google.', 'yellow');
  }
  
  return false;
}

// Testa o serviço local
async function testarServicoLocal() {
  log('\n🔍 Testando serviço local...', 'blue');
  
  try {
    // Usar o serviço diretamente se estiver disponível
    const googleSearchService = require('./backend/services/googleSearchService');
    
    const resultados = await googleSearchService.searchProducts('presente aniversário');
    
    if (resultados && resultados.length > 0) {
      log(`✅ Serviço local respondeu com sucesso! ${resultados.length} resultados encontrados.`, 'green');
      
      // Verificar fonte dos resultados
      const fonteGoogle = resultados.some(item => item.source === 'Google Custom Search');
      log(`Fonte dos resultados: ${fonteGoogle ? '✅ Google Custom Search (REAL)' : '⚠️ Simulados'}`, fonteGoogle ? 'green' : 'yellow');
      
      // Mostrar um exemplo
      log('\n📌 Exemplo de resultado:', 'yellow');
      log(`Título: ${resultados[0].title}`, 'white');
      log(`Link: ${resultados[0].link}`, 'white');
      log(`Fonte: ${resultados[0].source}`, 'white');
      log(`Imagem: ${resultados[0].image || 'Não disponível'}`, 'white');
      
      return true;
    } else {
      log('⚠️ Serviço local respondeu, mas sem resultados.', 'yellow');
    }
  } catch (error) {
    log(`❌ Erro ao testar serviço local: ${error.message}`, 'red');
  }
  
  return false;
}

// Executa todos os testes
async function executarTestes() {
  const configOk = await verificarConfiguracao();
  const servicoOk = await testarServicoLocal();
  
  log('\n📋 RESULTADO FINAL:', 'cyan');
  
  if (configOk && servicoOk) {
    log('✅ GOOGLE CUSTOM SEARCH API ESTÁ FUNCIONANDO CORRETAMENTE!', 'green');
  } else {
    log('❌ GOOGLE CUSTOM SEARCH API NÃO ESTÁ FUNCIONANDO CORRETAMENTE', 'red');
    
    log('\n🔧 CORREÇÕES SUGERIDAS:', 'yellow');
    if (!configOk) {
      log('1. Verifique se as variáveis de ambiente estão configuradas corretamente', 'yellow');
      log('2. Certifique-se de que USE_GOOGLE_SEARCH_API está definida como "true"', 'yellow');
      log('3. Verifique se as chaves de API são válidas', 'yellow');
    }
    if (!servicoOk) {
      log('1. Verifique se o serviço googleSearchService.js está carregando corretamente', 'yellow');
      log('2. Verifique se há erros nos logs do servidor', 'yellow');
      log('3. Execute o script corrigir-deteccao-google-search.js para melhorar a detecção da variável', 'yellow');
    }
  }
  
  log('\n==============================================================', 'cyan');
}

// Iniciar testes
executarTestes();
