// Script para corrigir configurações de produção
const fs = require('fs');
const path = require('path');

// Corrige o problema de trust proxy no express-rate-limit
function fixTrustProxyWarning() {
  console.log('🔧 Corrigindo configuração de trust proxy para o express-rate-limit...');
  
  const serverPath = path.join(__dirname, 'backend', 'server.js');
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Verifica se já existe a configuração de trust proxy
  if (serverContent.includes("app.set('trust proxy', true)")) {
    console.log('⚠️ Encontrada configuração existente de trust proxy. Atualizando para opção mais segura...');
    
    // Substitui a configuração existente por uma versão mais segura
    const updatedContent = serverContent.replace(
      "app.set('trust proxy', true)",
      "// Configuração mais segura de trust proxy\napp.set('trust proxy', '127.0.0.1, ::1')"
    );
    
    fs.writeFileSync(serverPath, updatedContent);
    console.log('✅ Configuração de trust proxy atualizada com sucesso!');
  } else {
    console.log('❌ Não foi possível encontrar a configuração de trust proxy existente.');
  }
}

// Cria o arquivo de instruções para o Render
function createRenderEnvInstructions() {
  console.log('📝 Criando instruções para configuração de variáveis de ambiente no Render...');
  
  const renderEnvPath = path.join(__dirname, 'RENDER_ENV_CONFIG.md');
  const renderEnvContent = `# Configuração de Variáveis de Ambiente no Render

## ⚠️ IMPORTANTE: A API do Google não está funcionando em produção

O log do servidor mostra que a variável \`USE_GOOGLE_SEARCH_API\` está sendo lida como \`false\` em produção.

## Passo a Passo para Configurar Variáveis de Ambiente no Render

1. Acesse o [Dashboard do Render](https://dashboard.render.com/)
2. Selecione seu serviço "easy-gift-search"
3. Clique na aba "Environment"
4. Adicione as seguintes variáveis de ambiente:

\`\`\`
USE_GOOGLE_SEARCH_API=true
GOOGLE_SEARCH_API_KEY=AIzaSyBs07nRYL0fYREou8gwDkS7fruBydwXfvI
GOOGLE_SEARCH_CX=e17d0e713876e4dca
\`\`\`

5. Certifique-se de que a opção "Secret" esteja marcada para as chaves de API
6. Clique em "Save Changes"
7. Aguarde o redeploy automático ou clique em "Manual Deploy" > "Clear Build Cache & Deploy"

## Verificação

Após a aplicação da configuração, verifique os logs do servidor para confirmar que a API do Google está ativa:

\`\`\`
⚙️ CONFIGURAÇÕES:
   USE_GOOGLE_SEARCH_API: true
🎉 STATUS GERAL: GOOGLE CUSTOM SEARCH API ATIVA
\`\`\`

## Solução de Problemas

Se após configurar as variáveis, a API ainda não estiver funcionando:

1. Verifique se as variáveis foram salvas corretamente no painel do Render
2. Confirme que o serviço foi reiniciado após as alterações
3. Verifique se há erros nos logs relacionados à API do Google
4. Teste a API diretamente com um cliente HTTP como Postman ou cURL
`;

  fs.writeFileSync(renderEnvPath, renderEnvContent);
  console.log('✅ Instruções para o Render criadas com sucesso!');
}

// Corrige o erro de trust proxy
fixTrustProxyWarning();

// Cria instruções para o Render
createRenderEnvInstructions();

console.log('✅ Todas as correções aplicadas com sucesso!');
