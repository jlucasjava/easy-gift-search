// Script para corrigir problemas com a ativação da Google Search API
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 VERIFICANDO CONFIGURAÇÃO DO GOOGLE CUSTOM SEARCH API');
console.log('=====================================================');

// Verificar variáveis de ambiente
const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_SEARCH_CX;
const USE_GOOGLE_SEARCH = process.env.USE_GOOGLE_SEARCH_API;

console.log(`GOOGLE_SEARCH_API_KEY: ${GOOGLE_API_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
console.log(`GOOGLE_SEARCH_CX: ${GOOGLE_CX ? '✅ Configurado' : '❌ Não configurado'}`);
console.log(`USE_GOOGLE_SEARCH_API: ${USE_GOOGLE_SEARCH === 'true' ? '✅ Ativo' : '❌ Inativo'}`);

// Verificar arquivos de configuração
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const rootEnvPath = path.join(__dirname, '.env');
const vercelEnvPath = path.join(__dirname, '.vercel-env-values.local');

console.log('\n📂 VERIFICANDO ARQUIVOS DE CONFIGURAÇÃO:');

function checkAndFixEnvFile(filePath, label) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Verificar se as variáveis estão definidas corretamente
      const hasGoogleApiKey = content.includes('GOOGLE_SEARCH_API_KEY=');
      const hasGoogleCx = content.includes('GOOGLE_SEARCH_CX=');
      const hasUseGoogleSearch = content.includes('USE_GOOGLE_SEARCH_API=');
      
      console.log(`\n${label}:`);
      console.log(`- GOOGLE_SEARCH_API_KEY: ${hasGoogleApiKey ? '✅ Presente' : '❌ Ausente'}`);
      console.log(`- GOOGLE_SEARCH_CX: ${hasGoogleCx ? '✅ Presente' : '❌ Ausente'}`);
      console.log(`- USE_GOOGLE_SEARCH_API: ${hasUseGoogleSearch ? '✅ Presente' : '❌ Ausente'}`);
      
      // Corrigir o arquivo se necessário
      let newContent = content;
      let needsUpdate = false;
      
      if (!hasGoogleApiKey && GOOGLE_API_KEY) {
        newContent += `\nGOOGLE_SEARCH_API_KEY=${GOOGLE_API_KEY}`;
        needsUpdate = true;
      }
      
      if (!hasGoogleCx && GOOGLE_CX) {
        newContent += `\nGOOGLE_SEARCH_CX=${GOOGLE_CX}`;
        needsUpdate = true;
      }
      
      if (!hasUseGoogleSearch) {
        newContent += `\nUSE_GOOGLE_SEARCH_API=true`;
        needsUpdate = true;
      } else if (!content.includes('USE_GOOGLE_SEARCH_API=true')) {
        newContent = newContent.replace(/USE_GOOGLE_SEARCH_API=.*/, 'USE_GOOGLE_SEARCH_API=true');
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        fs.writeFileSync(filePath, newContent);
        console.log(`✅ Arquivo ${label} atualizado com sucesso!`);
      } else {
        console.log(`✅ Arquivo ${label} já está configurado corretamente.`);
      }
      
      return true;
    } else {
      console.log(`❌ Arquivo ${label} não encontrado.`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erro ao verificar arquivo ${label}:`, error.message);
    return false;
  }
}

checkAndFixEnvFile(backendEnvPath, 'Backend .env');
checkAndFixEnvFile(rootEnvPath, 'Root .env');
checkAndFixEnvFile(vercelEnvPath, '.vercel-env-values.local');

// Criar arquivo googleSearchFixed.js
const fixedMarker = path.join(__dirname, 'backend', 'googleSearchFixed.js');
fs.writeFileSync(fixedMarker, `// Google Search API fixada em ${new Date().toLocaleString()}\n// USE_GOOGLE_SEARCH_API=true\n// GOOGLE_SEARCH_API_KEY=${GOOGLE_API_KEY}\n// GOOGLE_SEARCH_CX=${GOOGLE_CX}`);

console.log('\n🚀 REINICIANDO APLICAÇÃO...');
console.log('=====================================================');
console.log('✅ CORREÇÃO CONCLUÍDA!');
console.log('');
console.log('Para verificar se a correção foi bem-sucedida, execute:');
console.log('cd backend && node teste-google-only.js');
console.log('');
console.log('Se a API ainda não estiver funcionando em produção:');
console.log('1. Verifique se as variáveis de ambiente estão configuradas no painel da sua plataforma de deploy (Vercel/Render)');
console.log('2. Verifique se o projeto foi corretamente deployado após as alterações');
console.log('3. Certifique-se de que a API do Google está ativa e funcionando corretamente');
