/**
 * Script para verificar o ambiente de produção do Easy Gift Search
 * Este script testa as chaves de API, endpoints e limites no ambiente de produção
 */

require('dotenv').config({ path: '.env.production' });
const axios = require('axios');
const colors = require('colors/safe');
const fs = require('fs');
const path = require('path');

// Verificar se o arquivo .env.production existe
const envProductionPath = path.join(__dirname, '.env.production');
if (!fs.existsSync(envProductionPath)) {
  console.error(colors.red('Erro: Arquivo .env.production não encontrado.'));
  console.log(colors.yellow('Crie o arquivo .env.production com suas chaves de produção antes de continuar.'));
  process.exit(1);
}

// Configuração
const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_SEARCH_CX;
let BASE_URL = process.env.PRODUCTION_URL || 'https://seu-site-de-producao.vercel.app';
const USE_LOCALHOST = process.argv.includes('--localhost');

if (USE_LOCALHOST) {
  console.log(colors.yellow('Modo de teste local ativado. Usando localhost em vez do URL de produção.'));
  BASE_URL = 'http://localhost:3000';
}

// Verificar variáveis de ambiente
console.log(colors.cyan('=== Verificando Variáveis de Ambiente de Produção ==='));
if (!GOOGLE_API_KEY) {
  console.error(colors.red('Erro: GOOGLE_SEARCH_API_KEY não definida no .env.production'));
  process.exit(1);
}

if (!GOOGLE_CX) {
  console.error(colors.red('Erro: GOOGLE_SEARCH_CX não definida no .env.production'));
  process.exit(1);
}

console.log(colors.green('✓ Variáveis de ambiente de produção encontradas'));
console.log(`API Key: ${GOOGLE_API_KEY.substring(0, 5)}...${GOOGLE_API_KEY.substring(GOOGLE_API_KEY.length - 5)}`);
console.log(`CX: ${GOOGLE_CX.substring(0, 5)}...${GOOGLE_CX.substring(GOOGLE_CX.length - 5)}`);

// Teste direto da API do Google
async function testGoogleAPI() {
  console.log(colors.cyan('\n=== Testando API do Google em Produção ==='));
  
  try {
    const query = 'presente tecnologia';
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}&num=5`;
    
    console.log(`Testando consulta: "${query}"`);
    const response = await axios.get(url);
    
    if (response.data && response.data.items && response.data.items.length > 0) {
      console.log(colors.green(`✓ API do Google respondeu com sucesso (${response.data.items.length} resultados)`));
      console.log(colors.gray(`  Primeiro resultado: ${response.data.items[0].title}`));
      
      // Verificar limite diário disponível
      if (response.headers['x-ratelimit-remaining']) {
        console.log(colors.yellow(`  Consultas restantes hoje: ${response.headers['x-ratelimit-remaining']}`));
      }
    } else {
      console.log(colors.yellow('⚠ API do Google respondeu, mas sem resultados.'));
    }
    
    return true;
  } catch (error) {
    console.error(colors.red(`✗ Erro ao testar API do Google: ${error.message}`));
    if (error.response) {
      console.error(colors.red(`  Status: ${error.response.status}`));
      console.error(colors.red(`  Erro: ${JSON.stringify(error.response.data, null, 2)}`));
    }
    return false;
  }
}

// Testar endpoints da aplicação
async function testEndpoints() {
  console.log(colors.cyan('\n=== Testando Endpoints da Aplicação em Produção ==='));
  
  const endpoints = [
    { url: '/api/test', name: 'Status da API' },
    { url: '/api/products/search?query=presente', name: 'Busca de Produtos' },
    { url: '/api/recommend/random', name: 'Recomendações Aleatórias' }
  ];
  
  let success = true;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testando endpoint: ${endpoint.name} (${endpoint.url})`);
      const response = await axios.get(`${BASE_URL}${endpoint.url}`);
      
      if (response.status === 200) {
        console.log(colors.green(`✓ ${endpoint.name} respondeu com sucesso`));
        
        if (endpoint.url.includes('/search')) {
          const resultCount = response.data.produtos ? response.data.produtos.length : 0;
          console.log(colors.gray(`  Resultados: ${resultCount}`));
          
          if (resultCount > 0) {
            // Validar campos importantes
            const sample = response.data.produtos[0];
            const hasRequiredFields = sample.nome && sample.url && (sample.imagem || sample.imagemUrl);
            if (hasRequiredFields) {
              console.log(colors.green('  ✓ Formato dos dados validado'));
            } else {
              console.log(colors.yellow('  ⚠ Alguns campos obrigatórios estão ausentes nos resultados'));
              console.log(colors.gray(`  Primeiro item: ${JSON.stringify(sample, null, 2)}`));
              success = false;
            }
          }
        }
      } else {
        console.log(colors.yellow(`⚠ ${endpoint.name} respondeu com status ${response.status}`));
        success = false;
      }
    } catch (error) {
      console.error(colors.red(`✗ Erro ao testar ${endpoint.name}: ${error.message}`));
      if (error.response) {
        console.error(colors.red(`  Status: ${error.response.status}`));
      }
      success = false;
    }
  }
  
  return success;
}

// Testar a integração frontend-backend
async function testFrontendIntegration() {
  console.log(colors.cyan('\n=== Verificando Integração Frontend-Backend ==='));
  
  try {
    console.log(`Testando acesso ao frontend: ${BASE_URL}`);
    const response = await axios.get(BASE_URL);
    
    if (response.status === 200) {
      console.log(colors.green('✓ Frontend acessível'));
      
      // Verificar se o HTML contém elementos importantes
      const html = response.data;
      const hasSearchForm = html.includes('form') && html.includes('search');
      const hasAppJs = html.includes('app.js') || html.includes('app.min.js');
      
      if (hasSearchForm && hasAppJs) {
        console.log(colors.green('✓ Elementos essenciais do frontend encontrados'));
        return true;
      } else {
        console.log(colors.yellow('⚠ Alguns elementos essenciais do frontend não foram encontrados'));
        return false;
      }
    } else {
      console.log(colors.yellow(`⚠ Frontend respondeu com status ${response.status}`));
      return false;
    }
  } catch (error) {
    console.error(colors.red(`✗ Erro ao testar frontend: ${error.message}`));
    return false;
  }
}

// Monitorar uso da API
async function checkApiUsage() {
  console.log(colors.cyan('\n=== Monitoramento de Uso da API ==='));
  console.log(colors.yellow('Para verificar o uso e limites da API do Google Custom Search:'));
  console.log('1. Acesse o Console do Google Cloud: https://console.cloud.google.com/');
  console.log('2. Navegue até APIs & Serviços > Painel');
  console.log('3. Selecione "Custom Search API" na lista de APIs');
  console.log('4. Verifique o gráfico de uso e as cotas disponíveis');
  console.log(colors.yellow('\nLimite gratuito: 100 consultas por dia'));
  
  // Fazer uma consulta de teste para verificar os headers de limite
  try {
    const query = 'teste limite api';
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}&num=1`;
    const response = await axios.get(url);
    
    // Tentar extrair informações de limite dos headers (pode não estar disponível)
    const rateLimit = response.headers['x-ratelimit-limit'];
    const rateRemaining = response.headers['x-ratelimit-remaining'];
    
    if (rateLimit && rateRemaining) {
      console.log(colors.green(`\nLimite total: ${rateLimit}`));
      console.log(colors.green(`Consultas restantes: ${rateRemaining}`));
      console.log(colors.yellow(`Uso atual: ${rateLimit - rateRemaining}/${rateLimit}`));
    } else {
      console.log(colors.yellow('\nNão foi possível determinar o uso exato da API através dos headers.'));
    }
  } catch (error) {
    console.log(colors.red('\nNão foi possível verificar os limites da API via headers.'));
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log(colors.cyan('======================================'));
  console.log(colors.cyan('= VERIFICAÇÃO DE AMBIENTE DE PRODUÇÃO ='));
  console.log(colors.cyan('======================================'));
  console.log(`URL de Produção: ${BASE_URL}`);
  
  let googleApiSuccess = await testGoogleAPI();
  let endpointsSuccess = false;
  let frontendSuccess = false;
  
  if (googleApiSuccess) {
    endpointsSuccess = await testEndpoints();
    frontendSuccess = await testFrontendIntegration();
    await checkApiUsage();
  }
  
  console.log(colors.cyan('\n=== RESUMO DOS TESTES ==='));
  console.log(`API do Google: ${googleApiSuccess ? colors.green('✓ OK') : colors.red('✗ FALHA')}`);
  console.log(`Endpoints da Aplicação: ${endpointsSuccess ? colors.green('✓ OK') : colors.red('✗ FALHA')}`);
  console.log(`Integração Frontend: ${frontendSuccess ? colors.green('✓ OK') : colors.red('✗ FALHA')}`);
  
  const overallSuccess = googleApiSuccess && endpointsSuccess && frontendSuccess;
  console.log(colors.cyan('\n=== RESULTADO FINAL ==='));
  console.log(overallSuccess 
    ? colors.green('✅ TODOS OS TESTES PASSARAM! O ambiente de produção está funcionando corretamente.')
    : colors.red('❌ FALHA! Alguns testes não passaram. Revise os erros acima.'));
  
  return overallSuccess;
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = {
  testGoogleAPI,
  testEndpoints,
  testFrontendIntegration,
  checkApiUsage,
  runAllTests
};
