/**
 * Script para gerar instruções para configuração da Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Gerando instruções para configuração da Vercel...');

// Ler as variáveis de ambiente do arquivo local
const envFilePath = path.join(__dirname, '..', '.vercel-env-values.local');
try {
  const envContent = fs.readFileSync(envFilePath, 'utf8');
  
  // Extrair as variáveis de ambiente importantes
  const googleApiKey = envContent.match(/GOOGLE_SEARCH_API_KEY=([^\r\n]+)/)?.[1];
  const googleCx = envContent.match(/GOOGLE_SEARCH_CX=([^\r\n]+)/)?.[1];
  const useGoogleSearch = envContent.match(/USE_GOOGLE_SEARCH_API=([^\r\n]+)/)?.[1];
  
  // Criar o arquivo de instruções
  const instructionsPath = path.join(__dirname, '..', 'VERCEL_CONFIG_INSTRUCTIONS.md');
  const instructions = `# Instruções para Configuração da Vercel

## Variáveis de Ambiente Necessárias

Para garantir o funcionamento correto da API de busca do Google, configure as seguintes variáveis de ambiente no projeto Vercel:

\`\`\`
USE_GOOGLE_SEARCH_API=true
GOOGLE_SEARCH_API_KEY=${googleApiKey || 'sua-chave-api-aqui'}
GOOGLE_SEARCH_CX=${googleCx || 'seu-cx-id-aqui'}
\`\`\`

## Como Configurar

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Selecione o projeto "Easy Gift Search"
3. Clique na aba "Settings"
4. Navegue até "Environment Variables" 
5. Adicione as variáveis acima uma a uma
6. Certifique-se de que estão marcadas para os ambientes "Production", "Preview" e "Development"
7. Clique em "Save" para salvar as configurações
8. Redeploy o projeto para aplicar as novas variáveis de ambiente

## Verificação

Após o deploy, verifique se a API está funcionando corretamente acessando:
\`https://seu-projeto.vercel.app/api/system/status\`

Você deve ver uma mensagem indicando que o Google Custom Search está ativo.
`;
  
  fs.writeFileSync(instructionsPath, instructions, 'utf8');
  
  console.log('✅ Instruções geradas com sucesso em VERCEL_CONFIG_INSTRUCTIONS.md');
  console.log('');
  console.log('🔔 IMPORTANTE: Você precisa configurar estas variáveis de ambiente na Vercel para que a API funcione corretamente.');
  console.log('');
  
} catch (error) {
  console.error('❌ Erro ao gerar instruções:', error.message);
}
