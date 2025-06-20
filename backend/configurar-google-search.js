/**
 * Script para configurar corretamente a API do Google Custom Search
 * Execute este script para garantir que a configuração esteja correta
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configurações da API Google
const googleConfig = {
  GOOGLE_SEARCH_API_KEY: 'AIzaSyBs07nRYL0fYREou8gwDkS7fruBydwXfvI',
  GOOGLE_SEARCH_CX: 'e17d0e713876e4dca',
  USE_GOOGLE_SEARCH_API: 'true'
};

// Arquivo .env principal
const envFile = path.join(__dirname, '.env');
// Arquivo .env.production
const envProdFile = path.join(__dirname, '.env.production');

// Conteúdo do arquivo .env
const envContent = `# Configuração do Easy Gift Search - Atualizado em ${new Date().toLocaleString()}
# Google Custom Search API
GOOGLE_SEARCH_API_KEY=${googleConfig.GOOGLE_SEARCH_API_KEY}
GOOGLE_SEARCH_CX=${googleConfig.GOOGLE_SEARCH_CX}
USE_GOOGLE_SEARCH_API=${googleConfig.USE_GOOGLE_SEARCH_API}

# Configuração do servidor
PORT=10000
NODE_ENV=production

# Configurações de cache
CACHE_TTL=3600
`;

// Conteúdo do arquivo .env.production
const envProdContent = `# Configuração de produção do Easy Gift Search - Atualizado em ${new Date().toLocaleString()}
# Google Custom Search API
GOOGLE_SEARCH_API_KEY=${googleConfig.GOOGLE_SEARCH_API_KEY}
GOOGLE_SEARCH_CX=${googleConfig.GOOGLE_SEARCH_CX}
USE_GOOGLE_SEARCH_API=${googleConfig.USE_GOOGLE_SEARCH_API}

# Configuração do servidor
PORT=10000
NODE_ENV=production

# Configurações de cache e segurança
CACHE_TTL=3600
CORS_ENABLED=true

# URL de produção para verificações
PRODUCTION_URL=https://easy-gift-search.vercel.app
`;

// Escrever os arquivos
fs.writeFileSync(envFile, envContent, 'utf8');
console.log(`✅ Arquivo .env atualizado com sucesso!`);

fs.writeFileSync(envProdFile, envProdContent, 'utf8');
console.log(`✅ Arquivo .env.production atualizado com sucesso!`);

// Verificar se a API do Google está configurada corretamente
console.log('\n🔍 Verificando configuração da API Google Custom Search...');
console.log(`API Key: ${googleConfig.GOOGLE_SEARCH_API_KEY.substring(0, 10)}...`);
console.log(`CX ID: ${googleConfig.GOOGLE_SEARCH_CX}`);
console.log(`API Ativada: ${googleConfig.USE_GOOGLE_SEARCH_API}`);

// Função para reiniciar o servidor
function restartServer() {
  console.log('\n🔄 Reiniciando o servidor para aplicar as configurações...');
  exec('npm restart', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Erro ao reiniciar: ${error.message}`);
      console.log('Por favor, reinicie o servidor manualmente.');
      return;
    }
    
    console.log(`✅ Servidor reiniciado com sucesso!`);
    console.log(stdout);
    
    console.log('\n🚀 Configuração concluída! A API do Google Custom Search agora deve estar funcionando.');
    console.log('Para testar, acesse: http://localhost:10000/api/monitor/api-status');
  });
}

// Perguntar se deseja reiniciar o servidor
console.log('\n⚠️ Para aplicar as configurações, o servidor precisa ser reiniciado.');
console.log('Você deseja reiniciar o servidor agora? (Responda manualmente ou use o script abaixo)');
console.log('\nPara reiniciar manualmente, execute:');
console.log('- No ambiente de desenvolvimento: npm restart');
console.log('- No ambiente de produção: Reinicie o serviço no painel da Render ou Vercel');
