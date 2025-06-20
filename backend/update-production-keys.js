const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Cores para console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Função para atualizar as chaves da API no arquivo .env.production
function updateProductionApiKeys(apiKey, cxId) {
  try {
    // Ler o arquivo .env.production
    const envPath = path.join(__dirname, '.env.production');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Substituir a chave da API
    envContent = envContent.replace(
      /GOOGLE_SEARCH_API_KEY=.*/,
      `GOOGLE_SEARCH_API_KEY=${apiKey}`
    );
    
    // Substituir o CX ID
    envContent = envContent.replace(
      /GOOGLE_SEARCH_CX=.*/,
      `GOOGLE_SEARCH_CX=${cxId}`
    );
    
    // Escrever de volta no arquivo
    fs.writeFileSync(envPath, envContent);
    
    console.log(`${colors.green}✅ Chaves da API atualizadas com sucesso no arquivo .env.production${colors.reset}`);
    
    // Verificar se a atualização foi bem-sucedida
    const updatedContent = fs.readFileSync(envPath, 'utf8');
    if (updatedContent.includes(`GOOGLE_SEARCH_API_KEY=${apiKey}`) && 
        updatedContent.includes(`GOOGLE_SEARCH_CX=${cxId}`)) {
      console.log(`${colors.green}✓ Confirmado: as novas chaves estão no arquivo .env.production${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️ Aviso: Não foi possível confirmar a atualização completa das chaves${colors.reset}`);
    }
    
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Erro ao atualizar as chaves da API:${colors.reset}`, error.message);
    return false;
  }
}

// Verificar se o arquivo .env.production existe
const envProductionPath = path.join(__dirname, '.env.production');
if (!fs.existsSync(envProductionPath)) {
  console.error(`${colors.red}Erro: Arquivo .env.production não encontrado.${colors.reset}`);
  console.log(`${colors.yellow}Crie o arquivo .env.production primeiro antes de continuar.${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.blue}=== Atualização de Chaves de API para Produção ===${colors.reset}`);
console.log(`Este script irá atualizar as chaves do Google Custom Search no arquivo .env.production\n`);

// Verificar se há argumentos para usar as chaves do .env
const useEnvKeys = process.argv.includes('--use-env-keys');

if (useEnvKeys) {
  try {
    // Carregar chaves do .env
    require('dotenv').config();
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cxId = process.env.GOOGLE_SEARCH_CX;
    
    if (apiKey && cxId) {
      console.log(`${colors.blue}Usando chaves do arquivo .env${colors.reset}`);
      updateProductionApiKeys(apiKey, cxId);
      console.log(`\n${colors.green}✅ Processo concluído! Execute o script verify-production-environment.js para testar as chaves.${colors.reset}`);
      process.exit(0);
    } else {
      console.log(`${colors.yellow}⚠️ Chaves não encontradas no arquivo .env. Continuando com entrada manual.${colors.reset}\n`);
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠️ Erro ao ler chaves do .env: ${error.message}. Continuando com entrada manual.${colors.reset}\n`);
  }
}

// Pedir as novas chaves ao usuário
rl.question(`${colors.magenta}🔑 Digite a chave de API do Google para produção: ${colors.reset}`, (apiKey) => {
  if (!apiKey.trim()) {
    console.log(`${colors.red}❌ Nenhuma chave de API fornecida. O arquivo .env.production não foi alterado.${colors.reset}`);
    rl.close();
    return;
  }
  
  rl.question(`${colors.magenta}🔍 Digite o ID CX do Google Custom Search para produção: ${colors.reset}`, (cxId) => {
    if (!cxId.trim()) {
      console.log(`${colors.red}❌ Nenhum ID CX fornecido. O arquivo .env.production não foi alterado.${colors.reset}`);
      rl.close();
      return;
    }
    
    updateProductionApiKeys(apiKey.trim(), cxId.trim());
    console.log(`\n${colors.green}✅ Processo concluído! Execute o script verify-production-environment.js para testar as chaves.${colors.reset}`);
    rl.close();
  });
});
