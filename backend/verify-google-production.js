/**
 * Script para verificar a produção com Google Custom Search API
 * 
 * Este script verifica se as chaves da API estão configuradas corretamente
 * e testa a API do Google para garantir que tudo funciona em produção.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readline = require('readline');
const { execSync } = require('child_process');

// Configurar interface de linha de comando
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Caminho dos arquivos de ambiente
const envDevPath = path.join(__dirname, '.env');
const envProdPath = path.join(__dirname, '.env.production');
const vercelJsonPath = path.join(__dirname, '..', 'vercel.json');

/**
 * Verifica e cria o arquivo vercel.json se não existir
 */
async function checkVercelConfig() {
  console.log('🔍 Verificando configuração da Vercel...');
  
  if (!fs.existsSync(vercelJsonPath)) {
    console.log('⚠️ Arquivo vercel.json não encontrado. Criando configuração padrão...');
    
    const vercelConfig = {
      "version": 2,
      "builds": [
        { 
          "src": "backend/server.js", 
          "use": "@vercel/node" 
        },
        {
          "src": "public/**/*",
          "use": "@vercel/static"
        }
      ],
      "routes": [
        {
          "src": "/api/(.*)",
          "dest": "backend/server.js"
        },
        {
          "src": "/(.*)",
          "dest": "/public/$1"
        },
        {
          "src": "/",
          "dest": "/public/index.html"
        }
      ],
      "env": {
        "NODE_ENV": "production"
      }
    };
    
    fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2));
    console.log('✅ Arquivo vercel.json criado com sucesso!');
  } else {
    console.log('✅ Arquivo vercel.json encontrado!');
    const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
    console.log('ℹ️ Configuração atual:');
    console.log(`   - Versão: ${vercelConfig.version}`);
    console.log(`   - Builds: ${vercelConfig.builds.length}`);
    console.log(`   - Routes: ${vercelConfig.routes.length}`);
  }
}

/**
 * Verifica as chaves da API nos arquivos de ambiente
 */
async function checkGoogleApiKeys() {
  console.log('\n🔑 Verificando chaves da API do Google...');
  
  // Verificar arquivo .env
  if (!fs.existsSync(envDevPath)) {
    console.error('❌ Arquivo .env não encontrado! Crie o arquivo com as chaves da API.');
    return false;
  }
  
  // Ler arquivo .env
  const envDev = fs.readFileSync(envDevPath, 'utf8');
  const apiKeyDev = envDev.match(/GOOGLE_SEARCH_API_KEY=(.+)/)?.[1];
  const cxDev = envDev.match(/GOOGLE_SEARCH_CX=(.+)/)?.[1];
  
  if (!apiKeyDev || apiKeyDev === 'sua-chave-api-aqui') {
    console.error('❌ GOOGLE_SEARCH_API_KEY não configurada ou inválida no arquivo .env');
    return false;
  }
  
  if (!cxDev || cxDev === 'seu-cx-id-aqui') {
    console.error('❌ GOOGLE_SEARCH_CX não configurado ou inválido no arquivo .env');
    return false;
  }
  
  console.log('✅ Chaves da API do Google configuradas no ambiente de desenvolvimento.');
  
  // Verificar arquivo .env.production
  if (!fs.existsSync(envProdPath)) {
    console.log('⚠️ Arquivo .env.production não encontrado. Criando a partir do .env...');
    fs.copyFileSync(envDevPath, envProdPath);
    console.log('✅ Arquivo .env.production criado com sucesso!');
  }
  
  // Ler arquivo .env.production
  const envProd = fs.readFileSync(envProdPath, 'utf8');
  const apiKeyProd = envProd.match(/GOOGLE_SEARCH_API_KEY=(.+)/)?.[1];
  const cxProd = envProd.match(/GOOGLE_SEARCH_CX=(.+)/)?.[1];
  
  if (!apiKeyProd || apiKeyProd === 'sua-chave-api-aqui') {
    console.error('❌ GOOGLE_SEARCH_API_KEY não configurada ou inválida no arquivo .env.production');
    
    const answer = await askQuestion('Deseja usar a mesma chave API do ambiente de desenvolvimento para produção? (s/n): ');
    if (answer.toLowerCase() === 's') {
      // Substituir chave no arquivo .env.production
      const newEnvProd = envProd.replace(/GOOGLE_SEARCH_API_KEY=(.*)/, `GOOGLE_SEARCH_API_KEY=${apiKeyDev}`);
      fs.writeFileSync(envProdPath, newEnvProd);
      console.log('✅ GOOGLE_SEARCH_API_KEY copiada para o arquivo .env.production');
    } else {
      return false;
    }
  }
  
  if (!cxProd || cxProd === 'seu-cx-id-aqui') {
    console.error('❌ GOOGLE_SEARCH_CX não configurado ou inválido no arquivo .env.production');
    
    const answer = await askQuestion('Deseja usar o mesmo CX do ambiente de desenvolvimento para produção? (s/n): ');
    if (answer.toLowerCase() === 's') {
      // Substituir CX no arquivo .env.production
      const newEnvProd = envProd.replace(/GOOGLE_SEARCH_CX=(.*)/, `GOOGLE_SEARCH_CX=${cxDev}`);
      fs.writeFileSync(envProdPath, newEnvProd);
      console.log('✅ GOOGLE_SEARCH_CX copiado para o arquivo .env.production');
    } else {
      return false;
    }
  }
  
  console.log('✅ Chaves da API do Google configuradas no ambiente de produção.');
  return true;
}

/**
 * Testa a API do Google em ambiente de produção
 */
async function testGoogleApi() {
  console.log('\n🧪 Testando API do Google...');
  
  // Ler arquivo .env.production
  const envProd = fs.readFileSync(envProdPath, 'utf8');
  const apiKeyProd = envProd.match(/GOOGLE_SEARCH_API_KEY=(.+)/)?.[1];
  const cxProd = envProd.match(/GOOGLE_SEARCH_CX=(.+)/)?.[1];
  
  if (!apiKeyProd || !cxProd) {
    console.error('❌ Chaves da API não configuradas no arquivo .env.production');
    return false;
  }
  
  try {
    // Testar API com as chaves de produção
    const query = 'presente+teste';
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKeyProd}&cx=${cxProd}&q=${query}`;
    
    console.log('🔄 Enviando requisição para a API do Google...');
    const response = await axios.get(url);
    
    if (response.data && response.data.items && response.data.items.length > 0) {
      console.log(`✅ API do Google respondeu com sucesso! ${response.data.items.length} resultados encontrados.`);
      console.log('📊 Informações da resposta:');
      console.log(`   - Total de resultados: ${response.data.searchInformation.totalResults}`);
      console.log(`   - Tempo de resposta: ${response.data.searchInformation.searchTime} segundos`);
      
      // Mostrar informações de cota diária, se disponível
      if (response.headers['x-ratelimit-limit'] && response.headers['x-ratelimit-remaining']) {
        console.log('📈 Informações de cota:');
        console.log(`   - Limite diário: ${response.headers['x-ratelimit-limit']}`);
        console.log(`   - Restante: ${response.headers['x-ratelimit-remaining']}`);
      }
      
      return true;
    } else {
      console.warn('⚠️ API do Google respondeu, mas não retornou resultados.');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar API do Google:', error.message);
    
    if (error.response) {
      console.error(`   - Código de erro: ${error.response.status}`);
      console.error(`   - Mensagem: ${JSON.stringify(error.response.data)}`);
      
      if (error.response.status === 403) {
        console.error('\n❌ Erro 403 Forbidden: A chave da API pode estar inativa ou com restrições.');
        console.error('   - Verifique se a API está ativada no Google Cloud Console');
        console.error('   - Verifique se a chave não tem restrições de IP ou domínio');
        console.error('   - Verifique se não excedeu a cota diária (100 consultas/dia no plano gratuito)');
      }
    }
    
    return false;
  }
}

/**
 * Monitora o uso da API do Google
 */
async function monitorApiUsage() {
  console.log('\n📊 Monitoramento de Uso da API do Google');
  console.log('=====================================');
  console.log('A API gratuita do Google Custom Search tem os seguintes limites:');
  console.log('- 100 consultas gratuitas por dia');
  console.log('- Máximo de 10 resultados por consulta');
  console.log('- Máximo de 10 consultas por segundo');
  
  console.log('\n📋 Instruções para monitorar o uso da API:');
  console.log('1. Acesse o Google Cloud Console: https://console.cloud.google.com/');
  console.log('2. Selecione seu projeto');
  console.log('3. Navegue para "APIs & Serviços" > "Painel"');
  console.log('4. Selecione "Custom Search API"');
  console.log('5. Visualize o uso da API na seção "Cotas"');
  
  console.log('\n💡 Dicas para economizar consultas:');
  console.log('- Utilize o sistema de cache implementado');
  console.log('- Limite o número de consultas automáticas');
  console.log('- Use termos de busca mais específicos para obter resultados relevantes na primeira consulta');
  
  const answer = await askQuestion('\nDeseja abrir o Google Cloud Console para verificar o uso da API? (s/n): ');
  if (answer.toLowerCase() === 's') {
    try {
      console.log('🌐 Abrindo Google Cloud Console...');
      execSync('start https://console.cloud.google.com/apis/dashboard', { stdio: 'ignore' });
    } catch (error) {
      console.error('❌ Erro ao abrir o navegador:', error.message);
    }
  }
}

/**
 * Função auxiliar para fazer perguntas ao usuário
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Verificação de Produção com Google Custom Search API');
  console.log('====================================================');
  
  try {
    // Verificar configuração da Vercel
    await checkVercelConfig();
    
    // Verificar chaves da API
    const keysOk = await checkGoogleApiKeys();
    if (!keysOk) {
      console.warn('⚠️ Configuração de chaves incompleta. Corrija os problemas antes de continuar.');
    }
    
    // Testar API do Google
    const apiTest = await testGoogleApi();
    if (!apiTest) {
      console.warn('⚠️ Teste da API falhou. Verifique as chaves e configurações.');
    }
    
    // Monitorar uso da API
    await monitorApiUsage();
    
    console.log('\n✅ Verificação de produção concluída!');
    console.log('\n🚀 Para implantar na Vercel:');
    console.log('1. Instale o CLI da Vercel: npm install -g vercel');
    console.log('2. Execute: vercel --prod');
    console.log('3. Configure as variáveis de ambiente na Vercel após a implantação');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error.message);
  } finally {
    rl.close();
  }
}

// Executar função principal
main();
