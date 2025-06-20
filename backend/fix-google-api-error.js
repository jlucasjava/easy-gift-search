require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const { execSync } = require('child_process');

// Cria uma interface de linha de comando
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para fazer uma pergunta e obter resposta
function pergunta(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Função para testar a API do Google com detalhes
async function testarGoogleAPI() {
  console.log('\n🧪 Testando a API do Google Custom Search...');
  
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;
  
  if (!apiKey) {
    console.log('❌ GOOGLE_SEARCH_API_KEY não encontrada no arquivo .env');
    return false;
  }
  
  if (!cx) {
    console.log('❌ GOOGLE_SEARCH_CX não encontrado no arquivo .env');
    return false;
  }
  
  console.log(`✓ GOOGLE_SEARCH_API_KEY: ${apiKey.substring(0, 10)}...`);
  console.log(`✓ GOOGLE_SEARCH_CX: ${cx}`);
  
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=teste`;
  
  try {
    console.log('\n🔍 Fazendo requisição para a API do Google...');
    const response = await axios.get(url);
    
    if (response.status === 200) {
      console.log('✅ API respondeu com sucesso (200 OK)!');
      console.log(`📊 Total de resultados: ${response.data.searchInformation.totalResults}`);
      console.log(`🔍 Primeiro resultado: "${response.data.items?.[0]?.title || 'Nenhum resultado'}"`);
      return true;
    } else {
      console.log(`❌ API respondeu com código de status inesperado: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao fazer requisição para a API:');
    console.log(`   Status: ${error.response?.status || 'Desconhecido'}`);
    console.log(`   Mensagem: ${error.message}`);
    
    if (error.response?.data) {
      console.log('\nDetalhes do erro:');
      console.log(JSON.stringify(error.response.data, null, 2));
      
      // Análise específica para erro 403
      if (error.response.status === 403) {
        const errorData = error.response.data;
        const errorReason = errorData.error?.errors?.[0]?.reason || '';
        const errorMessage = errorData.error?.message || '';
        
        console.log('\n🔍 Análise do erro 403:');
        
        if (errorMessage.includes('API_KEY_SERVICE_BLOCKED') || errorMessage.includes('blocked')) {
          console.log('⚠️ A chave da API está bloqueada para o serviço Custom Search.');
          console.log('   Isso geralmente significa que a API Custom Search não está ativada no seu projeto do Google Cloud.');
        }
        
        if (errorMessage.includes('quota') || errorReason === 'dailyLimitExceeded') {
          console.log('⚠️ Você excedeu a cota diária da API (limite de 100 consultas por dia no plano gratuito).');
        }
        
        if (errorMessage.includes('key not valid') || errorReason === 'keyInvalid') {
          console.log('⚠️ A chave da API não é válida ou expirou.');
        }
      }
    }
    
    return false;
  }
}

// Função para atualizar a chave da API no .env
function atualizarChaveAPI(novaChave) {
  try {
    let envContent = fs.readFileSync('.env', 'utf8');
    envContent = envContent.replace(/GOOGLE_SEARCH_API_KEY=.*/g, `GOOGLE_SEARCH_API_KEY=${novaChave}`);
    fs.writeFileSync('.env', envContent);
    console.log('✅ Chave da API atualizada com sucesso no arquivo .env');
    return true;
  } catch (error) {
    console.log('❌ Erro ao atualizar a chave da API:', error.message);
    return false;
  }
}

// Função para atualizar o CX no .env
function atualizarCX(novoCX) {
  try {
    let envContent = fs.readFileSync('.env', 'utf8');
    envContent = envContent.replace(/GOOGLE_SEARCH_CX=.*/g, `GOOGLE_SEARCH_CX=${novoCX}`);
    fs.writeFileSync('.env', envContent);
    console.log('✅ CX atualizado com sucesso no arquivo .env');
    return true;
  } catch (error) {
    console.log('❌ Erro ao atualizar o CX:', error.message);
    return false;
  }
}

// Função para abrir o Google Cloud Console no navegador
function abrirGoogleConsole() {
  try {
    console.log('🌐 Abrindo o Google Cloud Console no navegador...');
    
    if (process.platform === 'win32') {
      execSync('start https://console.cloud.google.com/apis/library/customsearch.googleapis.com');
    } else if (process.platform === 'darwin') {
      execSync('open https://console.cloud.google.com/apis/library/customsearch.googleapis.com');
    } else {
      execSync('xdg-open https://console.cloud.google.com/apis/library/customsearch.googleapis.com');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Erro ao abrir o navegador:', error.message);
    return false;
  }
}

// Função para abrir o Programmatic Search Engine no navegador
function abrirPSE() {
  try {
    console.log('🌐 Abrindo o Programmatic Search Engine no navegador...');
    
    if (process.platform === 'win32') {
      execSync('start https://programmablesearchengine.google.com/');
    } else if (process.platform === 'darwin') {
      execSync('open https://programmablesearchengine.google.com/');
    } else {
      execSync('xdg-open https://programmablesearchengine.google.com/');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Erro ao abrir o navegador:', error.message);
    return false;
  }
}

// Função principal assíncrona
async function main() {
  console.log('===========================================');
  console.log('🔧 ASSISTENTE DE CORREÇÃO DA API DO GOOGLE');
  console.log('===========================================');
  console.log('\nEste script vai ajudar você a diagnosticar e corrigir problemas com a API do Google Custom Search.');
  
  // Testar a API atual
  console.log('\n📋 ETAPA 1: Verificando configuração atual da API...');
  const apiOk = await testarGoogleAPI();
  
  if (apiOk) {
    console.log('\n✅ A API do Google Custom Search está funcionando corretamente!');
    console.log('   Não é necessário realizar nenhuma correção.');
    rl.close();
    return;
  }
  
  console.log('\n📋 ETAPA 2: Verificando o problema...');
  
  // Perguntar se quer abrir o console do Google Cloud
  const abrirConsole = await pergunta('\n❓ Deseja abrir o console do Google Cloud para ativar a API? (s/n): ');
  
  if (abrirConsole.toLowerCase() === 's') {
    abrirGoogleConsole();
    console.log('\n🔍 No console do Google Cloud:');
    console.log('1. Faça login na sua conta do Google');
    console.log('2. Selecione o projeto correto na parte superior');
    console.log('3. Na página da Custom Search API, clique em "Ativar"');
    console.log('4. Aguarde a ativação da API');
    
    await pergunta('\nPressione Enter quando terminar de ativar a API...');
  }
  
  // Perguntar se quer criar uma nova chave de API
  const criarNovaChave = await pergunta('\n❓ Deseja criar uma nova chave de API? (s/n): ');
  
  if (criarNovaChave.toLowerCase() === 's') {
    console.log('\n🔍 Para criar uma nova chave de API:');
    console.log('1. Acesse https://console.cloud.google.com/apis/credentials');
    console.log('2. Clique em "Criar credenciais" > "Chave de API"');
    console.log('3. Copie a nova chave de API');
    
    abrirGoogleConsole();
    
    const novaChave = await pergunta('\n📝 Cole a nova chave de API aqui: ');
    
    if (novaChave.trim()) {
      atualizarChaveAPI(novaChave.trim());
    }
  }
  
  // Perguntar se quer verificar o mecanismo de busca
  const verificarPSE = await pergunta('\n❓ Deseja verificar o mecanismo de busca personalizada (CX)? (s/n): ');
  
  if (verificarPSE.toLowerCase() === 's') {
    console.log('\n🔍 Para verificar o mecanismo de busca:');
    console.log('1. Acesse https://programmablesearchengine.google.com/');
    console.log('2. Verifique se o mecanismo está ativo');
    console.log('3. Copie o ID do mecanismo (Search engine ID)');
    
    abrirPSE();
    
    const novoCX = await pergunta('\n📝 Cole o ID do mecanismo de busca (CX) aqui (deixe em branco para manter o atual): ');
    
    if (novoCX.trim()) {
      atualizarCX(novoCX.trim());
    }
  }
  
  // Testar novamente após as alterações
  console.log('\n📋 ETAPA 3: Testando novamente a API após alterações...');
  const apiCorrigida = await testarGoogleAPI();
  
  if (apiCorrigida) {
    console.log('\n🎉 SUCESSO! A API do Google Custom Search está funcionando corretamente agora!');
    console.log('   Você pode continuar com a implementação do projeto.');
  } else {
    console.log('\n⚠️ A API ainda não está funcionando corretamente.');
    console.log('   Aqui estão algumas sugestões adicionais:');
    console.log('   1. Verifique se a API Custom Search está ativada para o projeto correto');
    console.log('   2. Verifique se a chave de API não tem restrições que impedem seu uso');
    console.log('   3. Verifique se você não excedeu a cota diária (100 consultas/dia no plano gratuito)');
    console.log('   4. Tente criar um novo projeto no Google Cloud e configurar tudo do zero');
    console.log('   5. Consulte a documentação oficial: https://developers.google.com/custom-search/v1/overview');
  }
  
  // Verificar se quer executar o script de teste consolidado
  const executarTeste = await pergunta('\n❓ Deseja executar o script de teste consolidado para verificar a integração completa? (s/n): ');
  
  if (executarTeste.toLowerCase() === 's') {
    console.log('\n🧪 Executando o script de teste consolidado...');
    try {
      execSync('node test-google-only-consolidated.js', { stdio: 'inherit' });
    } catch (error) {
      console.log('❌ Erro ao executar o script de teste:', error.message);
    }
  }
  
  rl.close();
}

// Executar a função principal
main().catch(error => {
  console.error('Erro não tratado:', error);
  rl.close();
});
