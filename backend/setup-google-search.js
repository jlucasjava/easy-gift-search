#!/usr/bin/env node

/**
 * Script de Implementação Guiada do Google Custom Search API
 * Este script interativo ajuda a configurar e testar a API do Google Custom Search
 */

const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Criar interface de linha de comando
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m'
  }
};

// Funções utilitárias
function printHeader(text) {
  console.log('\n' + colors.fg.cyan + colors.bright + '='.repeat(60));
  console.log(` ${text}`);
  console.log('='.repeat(60) + colors.reset + '\n');
}

function printSuccess(text) {
  console.log(colors.fg.green + '✓ ' + text + colors.reset);
}

function printError(text) {
  console.log(colors.fg.red + '✗ ' + text + colors.reset);
}

function printInfo(text) {
  console.log(colors.fg.yellow + 'ℹ ' + text + colors.reset);
}

function execute(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    printError(`Erro ao executar comando: ${command}`);
    console.error(error.message);
    return null;
  }
}

// Passos da implementação
async function main() {
  printHeader('IMPLEMENTAÇÃO GUIADA DO GOOGLE CUSTOM SEARCH API');
  
  console.log('Este script interativo vai te guiar pelos passos para implementar');
  console.log('e testar a API do Google Custom Search no projeto Easy Gift Search.');
  console.log('\nVamos verificar sua configuração atual e ajudá-lo a continuar a implementação.\n');
  
  // Passo 1: Verificar as chaves atuais
  await verificarChaves();
  
  // Passo 2: Testar a API
  await testarAPI();
  
  // Passo 3: Otimizar implementação
  await otimizarImplementacao();
  
  // Passo 4: Preparar para produção
  await prepararProducao();
  
  // Finalização
  printHeader('IMPLEMENTAÇÃO CONCLUÍDA');
  console.log('Você completou todos os passos para a implementação da API do Google Custom Search!');
  console.log('\nPróximos passos recomendados:');
  console.log('1. Monitore o uso da API no Google Cloud Console');
  console.log('2. Refine as consultas para melhorar os resultados');
  console.log('3. Implante a aplicação em produção');
  console.log('\nObrigado por usar o script de implementação guiada!');
  
  rl.close();
}

// Passo 1: Verificar as chaves atuais
async function verificarChaves() {
  printHeader('PASSO 1: VERIFICAR CONFIGURAÇÃO ATUAL');
  
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cxId = process.env.GOOGLE_SEARCH_CX;
  const useGoogleSearch = process.env.USE_GOOGLE_SEARCH_API;
  
  console.log('Verificando configuração no arquivo .env:');
  console.log(`GOOGLE_SEARCH_API_KEY: ${apiKey ? '✓ Configurada' : '✗ Não configurada'}`);
  console.log(`GOOGLE_SEARCH_CX: ${cxId ? '✓ Configurado' : '✗ Não configurado'}`);
  console.log(`USE_GOOGLE_SEARCH_API: ${useGoogleSearch === 'true' ? '✓ Ativada' : '✗ Desativada'}`);
  
  // Se alguma chave estiver faltando, perguntar se deseja configurar
  if (!apiKey || !cxId || useGoogleSearch !== 'true') {
    return new Promise((resolve) => {
      rl.question('\nDeseja configurar as chaves agora? (S/n): ', async (answer) => {
        if (answer.toLowerCase() !== 'n') {
          await configurarChaves();
        } else {
          printInfo('Você optou por não configurar as chaves agora.');
          printInfo('Você pode configurá-las manualmente editando o arquivo .env');
        }
        resolve();
      });
    });
  } else {
    printSuccess('Todas as chaves estão configuradas corretamente!');
    return Promise.resolve();
  }
}

// Configurar chaves manualmente
async function configurarChaves() {
  printInfo('Vamos configurar as chaves da API do Google Custom Search.');
  
  // Perguntar pela API Key
  const apiKey = await new Promise((resolve) => {
    rl.question('Digite sua GOOGLE_SEARCH_API_KEY: ', (answer) => {
      resolve(answer.trim());
    });
  });
  
  // Perguntar pelo CX
  const cxId = await new Promise((resolve) => {
    rl.question('Digite seu GOOGLE_SEARCH_CX (ID do mecanismo de busca): ', (answer) => {
      resolve(answer.trim());
    });
  });
  
  // Atualizar o arquivo .env
  try {
    let envContent = fs.readFileSync(path.join(process.cwd(), 'backend', '.env'), 'utf8');
    
    // Substituir ou adicionar as chaves
    if (envContent.includes('GOOGLE_SEARCH_API_KEY=')) {
      envContent = envContent.replace(/GOOGLE_SEARCH_API_KEY=.*/, `GOOGLE_SEARCH_API_KEY=${apiKey}`);
    } else {
      envContent += `\nGOOGLE_SEARCH_API_KEY=${apiKey}`;
    }
    
    if (envContent.includes('GOOGLE_SEARCH_CX=')) {
      envContent = envContent.replace(/GOOGLE_SEARCH_CX=.*/, `GOOGLE_SEARCH_CX=${cxId}`);
    } else {
      envContent += `\nGOOGLE_SEARCH_CX=${cxId}`;
    }
    
    if (envContent.includes('USE_GOOGLE_SEARCH_API=')) {
      envContent = envContent.replace(/USE_GOOGLE_SEARCH_API=.*/, 'USE_GOOGLE_SEARCH_API=true');
    } else {
      envContent += '\nUSE_GOOGLE_SEARCH_API=true';
    }
    
    fs.writeFileSync(path.join(process.cwd(), 'backend', '.env'), envContent);
    printSuccess('Chaves atualizadas com sucesso no arquivo .env!');
    
    // Recarregar as variáveis de ambiente
    dotenv.config();
  } catch (error) {
    printError(`Erro ao atualizar o arquivo .env: ${error.message}`);
  }
}

// Passo 2: Testar a API
async function testarAPI() {
  printHeader('PASSO 2: TESTAR A API DO GOOGLE CUSTOM SEARCH');
  
  return new Promise((resolve) => {
    rl.question('Deseja executar o teste da API agora? (S/n): ', (answer) => {
      if (answer.toLowerCase() !== 'n') {
        printInfo('Executando o teste da API...');
        
        try {
          const output = execute('cd backend && node test-google-only-consolidated.js');
          console.log(output);
          
          if (output.includes('Resultado Final: 4/4 testes com sucesso')) {
            printSuccess('Todos os testes passaram com sucesso!');
          } else if (output.includes('Request failed with status code 403')) {
            printError('Erro 403 (Forbidden) detectado nos testes.');
            console.log('\nPossíveis causas:');
            console.log('1. A chave da API pode não estar ativa');
            console.log('2. Você pode ter excedido a cota diária (100 consultas/dia no plano gratuito)');
            console.log('3. A chave pode ter restrições que impedem seu uso');
            
            console.log('\nSugestões:');
            console.log('- Verifique o status da chave no Console do Google Cloud');
            console.log('- Crie uma nova chave de API, se necessário');
            console.log('- Verifique se a API Custom Search está ativada para o projeto');
          }
        } catch (error) {
          printError(`Erro ao executar o teste: ${error.message}`);
        }
      } else {
        printInfo('Você optou por não executar o teste agora.');
      }
      
      resolve();
    });
  });
}

// Passo 3: Otimizar implementação
async function otimizarImplementacao() {
  printHeader('PASSO 3: OTIMIZAR A IMPLEMENTAÇÃO');
  
  return new Promise((resolve) => {
    rl.question('Deseja implementar o sistema de cache para economizar chamadas à API? (S/n): ', async (answer) => {
      if (answer.toLowerCase() !== 'n') {
        printInfo('Implementando sistema de cache...');
        
        // Instalar node-cache
        try {
          execute('cd backend && npm install node-cache --save');
          printSuccess('Dependência node-cache instalada com sucesso!');
          
          // Sugerir implementação de cache
          printInfo('Para implementar o cache, adicione o seguinte código no início do arquivo googleSearchService.js:');
          console.log(`
const NodeCache = require('node-cache');
const searchCache = new NodeCache({ stdTTL: 3600 }); // Cache por 1 hora

// Modifique a função searchGoogle para usar cache
function searchGoogle(query, num = 10, start = 1) {
  const cacheKey = \`\${query}-\${num}-\${start}\`;
  const cachedResult = searchCache.get(cacheKey);
  
  if (cachedResult) {
    console.log(\`🔍 Usando resultados em cache para: "\${query}"\`);
    return cachedResult;
  }
  
  // ... resto do código existente ...
  
  // Adicione antes do return final:
  searchCache.set(cacheKey, resultados);
  return resultados;
}`);
          
          const implementarAgora = await new Promise((resolveInner) => {
            rl.question('\nDeseja que eu implemente isso automaticamente? (S/n): ', (ans) => {
              resolveInner(ans.toLowerCase() !== 'n');
            });
          });
          
          if (implementarAgora) {
            // Implementação automática seria feita aqui
            printInfo('Esta funcionalidade requer edição de código específica.');
            printInfo('Por favor, implemente manualmente seguindo as instruções acima.');
          }
        } catch (error) {
          printError(`Erro ao instalar dependência: ${error.message}`);
        }
      } else {
        printInfo('Você optou por não implementar o cache agora.');
      }
      
      resolve();
    });
  });
}

// Passo 4: Preparar para produção
async function prepararProducao() {
  printHeader('PASSO 4: PREPARAR PARA PRODUÇÃO');
  
  return new Promise((resolve) => {
    rl.question('Deseja criar um arquivo .env.production para ambiente de produção? (S/n): ', (answer) => {
      if (answer.toLowerCase() !== 'n') {
        try {
          // Criar arquivo .env.production baseado no .env atual
          const envContent = fs.readFileSync(path.join(process.cwd(), 'backend', '.env'), 'utf8');
          const prodEnvContent = envContent
            .replace(/NODE_ENV=.*/, 'NODE_ENV=production')
            .replace(/# .*Configuração.*/g, '# Configuração de Produção - Google Custom Search API');
          
          fs.writeFileSync(path.join(process.cwd(), 'backend', '.env.production'), prodEnvContent);
          printSuccess('Arquivo .env.production criado com sucesso!');
          
          printInfo('Lembre-se de ajustar as chaves de API para o ambiente de produção, se necessário.');
        } catch (error) {
          printError(`Erro ao criar arquivo .env.production: ${error.message}`);
        }
      } else {
        printInfo('Você optou por não criar o arquivo .env.production agora.');
      }
      
      resolve();
    });
  });
}

// Executar o script principal
main().catch(error => {
  console.error('Erro:', error);
  rl.close();
});
