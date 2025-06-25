// Script para verificação e correção da configuração do Google Search API no Render
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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

// Verificar configuração atual
function verificarConfiguracao() {
  log('======== VERIFICAÇÃO DE CONFIGURAÇÃO DO GOOGLE SEARCH API ========', 'cyan');
  
  // Verificar variáveis de ambiente
  const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const googleCx = process.env.GOOGLE_SEARCH_CX;
  const useGoogleSearch = process.env.USE_GOOGLE_SEARCH_API;
  
  log('\n🔍 Variáveis de ambiente encontradas:', 'blue');
  log(`GOOGLE_SEARCH_API_KEY: ${googleApiKey ? '✅ Configurada' : '❌ Não configurada'}`, googleApiKey ? 'green' : 'red');
  log(`GOOGLE_SEARCH_CX: ${googleCx ? '✅ Configurado' : '❌ Não configurado'}`, googleCx ? 'green' : 'red');
  log(`USE_GOOGLE_SEARCH_API: ${useGoogleSearch || 'não definida'} ${useGoogleSearch === 'true' ? '✅' : '❌'}`, useGoogleSearch === 'true' ? 'green' : 'red');

  // Verificar strings de validação
  log('\n🔍 Validando strings de ativação:', 'blue');
  log(`useGoogleSearch === 'true': ${useGoogleSearch === 'true'}`, useGoogleSearch === 'true' ? 'green' : 'red');
  log(`useGoogleSearch === true: ${useGoogleSearch === true}`, useGoogleSearch === true ? 'green' : 'red');
  log(`useGoogleSearch == true: ${useGoogleSearch == true}`, useGoogleSearch == true ? 'green' : 'red');
  log(`useGoogleSearch === '1': ${useGoogleSearch === '1'}`, useGoogleSearch === '1' ? 'green' : 'red');
  
  // Status geral
  const googleSearchEnabled = useGoogleSearch === 'true' || useGoogleSearch === true || useGoogleSearch === '1';
  const configCompleta = googleApiKey && googleCx && googleSearchEnabled;
  
  log('\n📊 RESULTADO DA VERIFICAÇÃO:', 'magenta');
  if (configCompleta) {
    log('✅ GOOGLE CUSTOM SEARCH API ESTÁ CORRETAMENTE CONFIGURADA', 'green');
  } else {
    log('❌ GOOGLE CUSTOM SEARCH API NÃO ESTÁ CORRETAMENTE CONFIGURADA', 'red');
    
    // Identificar problemas específicos
    if (!googleApiKey) log('   ❌ GOOGLE_SEARCH_API_KEY não está definida', 'red');
    if (!googleCx) log('   ❌ GOOGLE_SEARCH_CX não está definido', 'red');
    if (!googleSearchEnabled) log('   ❌ USE_GOOGLE_SEARCH_API não está definida como "true"', 'red');
  }
  
  return configCompleta;
}

// Gerar instruções para configuração no Render
function gerarInstrucoesRender() {
  log('\n📝 Gerando instruções para configuração no Render...', 'blue');
  
  const conteudo = `# Configuração do Google Search API no Render - INSTRUÇÕES ATUALIZADAS

## ⚠️ PROBLEMA IDENTIFICADO

A API do Google Custom Search não está funcionando corretamente em produção (Render). 
As verificações indicam que a variável de ambiente \`USE_GOOGLE_SEARCH_API\` não está sendo reconhecida como \`true\`.

## ✅ SOLUÇÃO PASSO A PASSO

1. **Acesse o Dashboard do Render**
   - URL: https://dashboard.render.com/
   - Faça login com suas credenciais
   - Selecione o serviço "easy-gift-search"

2. **Configure as Variáveis de Ambiente**
   - Clique na aba "Environment"
   - **REMOVA** todas as variáveis de ambiente existentes relacionadas ao Google Search API:
     - USE_GOOGLE_SEARCH_API
     - GOOGLE_SEARCH_API_KEY
     - GOOGLE_SEARCH_CX
   - Adicione novamente as seguintes variáveis (exatamente como mostrado abaixo):
   
   \`\`\`
   USE_GOOGLE_SEARCH_API=true
   GOOGLE_SEARCH_API_KEY=AIzaSyBs07nRYL0fYREou8gwDkS7fruBydwXfvI
   GOOGLE_SEARCH_CX=e17d0e713876e4dca
   \`\`\`
   
   - Marque a opção "Secret" para as chaves de API
   - Clique em "Save Changes"

3. **Force um Novo Deploy com Cache Limpo**
   - Clique em "Manual Deploy" no menu à direita
   - Selecione "Clear Build Cache & Deploy"
   - Aguarde a conclusão do deploy (geralmente leva alguns minutos)

4. **Verifique os Logs**
   - Após o deploy, clique na aba "Logs"
   - Procure por mensagens de inicialização do servidor
   - Confirme que aparece a mensagem:
     \`\`\`
     🎉 STATUS GERAL: GOOGLE CUSTOM SEARCH API ATIVA
     \`\`\`

5. **Teste a Aplicação**
   - Acesse o URL da aplicação
   - Faça uma busca por produtos
   - Verifique se os resultados estão sendo exibidos corretamente
   - Confirme que as imagens e links dos produtos são reais (não simulados)

## ❓ PROBLEMAS COMUNS

1. **A variável USE_GOOGLE_SEARCH_API não é reconhecida como true**
   - Certifique-se de digitar exatamente \`true\` (em minúsculas, sem aspas)
   - Tente remover todas as variáveis e adicioná-las novamente
   - Verifique se não há espaços extras no valor

2. **Os resultados continuam sendo simulados**
   - Verifique se o cache do aplicativo foi limpo durante o deploy
   - Tente adicionar \`?nocache=1\` ao final da URL para forçar uma atualização
   - Certifique-se de que todas as três variáveis foram configuradas corretamente

3. **Erros nos logs**
   - Se aparecerem erros relacionados à API do Google, verifique se as chaves estão corretas
   - Certifique-se de que o formato do CX está correto (sem espaços)

## 📋 VERIFICAÇÃO FINAL

Para confirmar que tudo está funcionando, acesse:

\`\`\`
https://easy-gift-search.onrender.com/api/status
\`\`\`

Você deve ver uma resposta JSON com \`googleSearchEnabled: true\`.

Data da atualização: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}
`;

  // Salvar instruções em arquivo
  const filePath = path.join(process.cwd(), 'RENDER_CONFIG_ATUALIZADO.md');
  fs.writeFileSync(filePath, conteudo);
  
  log(`✅ Instruções geradas com sucesso: ${filePath}`, 'green');
  
  // Criar script para teste após a configuração no Render
  criarScriptTestePosConfiguracao();
}

// Criar script para testar a configuração após as mudanças no Render
function criarScriptTestePosConfiguracao() {
  const conteudo = `// Script para testar a configuração do Google Search API após mudanças no Render
require('dotenv').config();
const axios = require('axios');

// URLs para teste
const RENDER_URL = 'https://easy-gift-search.onrender.com';
const API_STATUS_URL = \`\${RENDER_URL}/api/status\`;
const API_SEARCH_URL = \`\${RENDER_URL}/api/search\`;

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

  console.log(\`\${colors[color]}\${message}\${colors.reset}\`);
}

// Função para verificar o status da API
async function verificarStatusAPI() {
  try {
    log('======== TESTE DE CONFIGURAÇÃO DO GOOGLE SEARCH API NO RENDER ========', 'cyan');
    log('\\n🔍 Verificando status da API...', 'blue');
    
    const response = await axios.get(API_STATUS_URL);
    const data = response.data;
    
    log('📊 Resposta do servidor:', 'magenta');
    log(\`Status: \${response.status}\`, 'yellow');
    
    // Verificar status do Google Search
    const googleEnabled = data.apis && data.apis.google && data.apis.google.enabled;
    
    log(\`\\nGoogle Search API: \${googleEnabled ? '✅ ATIVA' : '❌ INATIVA'}\`, googleEnabled ? 'green' : 'red');
    
    if (data.apis && data.apis.google) {
      const googleApi = data.apis.google;
      log('Detalhes da configuração:', 'blue');
      log(\`- API Key configurada: \${googleApi.apiKeyConfigured ? '✅' : '❌'}\`, googleApi.apiKeyConfigured ? 'green' : 'red');
      log(\`- CX configurado: \${googleApi.cxConfigured ? '✅' : '❌'}\`, googleApi.cxConfigured ? 'green' : 'red');
      log(\`- Habilitada: \${googleApi.enabled ? '✅' : '❌'}\`, googleApi.enabled ? 'green' : 'red');
    }
    
    return googleEnabled;
  } catch (error) {
    log(\`❌ Erro ao verificar status da API: \${error.message}\`, 'red');
    return false;
  }
}

// Função para testar a busca
async function testarBusca() {
  try {
    log('\\n🔍 Testando busca de produtos...', 'blue');
    
    const query = 'presente aniversário';
    const response = await axios.get(\`\${API_SEARCH_URL}?q=\${encodeURIComponent(query)}\`);
    const data = response.data;
    
    log(\`Busca por: "\${query}"\`, 'yellow');
    log(\`Resultados encontrados: \${data.length || 0}\`, 'yellow');
    
    if (data && data.length > 0) {
      // Verificar se os resultados são reais ou simulados
      const primeiroResultado = data[0];
      log('\\n📊 Primeiro resultado:', 'magenta');
      log(\`Título: \${primeiroResultado.title}\`, 'white');
      log(\`Link: \${primeiroResultado.link}\`, 'white');
      log(\`Fonte: \${primeiroResultado.source}\`, 'white');
      
      const resultadosReais = data.some(item => item.source === 'Google Custom Search');
      log(\`\\nTipo de resultados: \${resultadosReais ? '✅ REAIS (Google Custom Search)' : '❌ SIMULADOS'}\`, resultadosReais ? 'green' : 'red');
      
      return resultadosReais;
    } else {
      log('❌ Nenhum resultado encontrado', 'red');
      return false;
    }
  } catch (error) {
    log(\`❌ Erro ao testar busca: \${error.message}\`, 'red');
    return false;
  }
}

// Executar testes
async function executarTestes() {
  const statusOk = await verificarStatusAPI();
  let buscaOk = false;
  
  if (statusOk) {
    buscaOk = await testarBusca();
  }
  
  log('\\n📋 RESULTADO FINAL DOS TESTES:', 'cyan');
  if (statusOk && buscaOk) {
    log('✅ GOOGLE CUSTOM SEARCH API ESTÁ FUNCIONANDO CORRETAMENTE NO RENDER', 'green');
  } else {
    log('❌ GOOGLE CUSTOM SEARCH API NÃO ESTÁ FUNCIONANDO CORRETAMENTE NO RENDER', 'red');
    log('\\n🔧 AÇÕES RECOMENDADAS:', 'yellow');
    log('1. Verifique se todas as variáveis de ambiente foram configuradas corretamente');
    log('2. Certifique-se de que o deploy foi realizado com cache limpo');
    log('3. Verifique os logs do servidor no painel do Render para mais detalhes');
  }
}

// Iniciar testes
executarTestes();
`;

  // Salvar script em arquivo
  const filePath = path.join(process.cwd(), 'testar-configuracao-render.js');
  fs.writeFileSync(filePath, conteudo);
  
  log(`✅ Script de teste criado: ${filePath}`, 'green');
}

// Executar verificação
const configOk = verificarConfiguracao();

// Se a configuração não estiver correta, gerar instruções
if (!configOk) {
  gerarInstrucoesRender();
}

log('\n📌 PRÓXIMOS PASSOS:', 'magenta');
log('1. Siga as instruções no arquivo RENDER_CONFIG_ATUALIZADO.md para configurar o Render', 'yellow');
log('2. Após fazer as alterações, execute o script testar-configuracao-render.js para verificar', 'yellow');
log('   Comando: node testar-configuracao-render.js', 'cyan');
log('\n==============================================================', 'cyan');
