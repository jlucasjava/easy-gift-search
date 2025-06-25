/**
 * Script para corrigir o erro de trust proxy no Express
 */

const fs = require('fs');
const path = require('path');

// Caminho para o arquivo do servidor Express
const serverPath = path.join(__dirname, 'server.js');

console.log('🔧 Corrigindo configuração do Express para trust proxy...');

try {
  // Ler o conteúdo atual do arquivo
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Verificar se já tem a configuração de trust proxy
  if (serverContent.includes('app.set(\'trust proxy\', true)')) {
    console.log('⚠️ Configuração de trust proxy encontrada, mas precisa ser melhorada para evitar avisos de segurança.');
    
    // Substituir a configuração existente por uma versão mais segura
    const updatedContent = serverContent.replace(
      'app.set(\'trust proxy\', true)',
      '// Configuração mais segura de trust proxy para evitar avisos do express-rate-limit\napp.set(\'trust proxy\', \'127.0.0.1, ::1\')'
    );
    
    // Salvar o arquivo com as alterações
    fs.writeFileSync(serverPath, updatedContent, 'utf8');
    console.log('✅ Configuração de trust proxy atualizada para uma versão mais segura.');
  } else {
    // Procurar onde adicionar a configuração (após criar a aplicação Express)
    const appCreationPattern = /const app = express\(\);/;
    
    if (appCreationPattern.test(serverContent)) {
      // Adicionar a configuração de trust proxy após criar a aplicação Express
      const updatedContent = serverContent.replace(
        appCreationPattern,
        'const app = express();\n\n// Configurar trust proxy para funcionar com X-Forwarded-For em ambientes de proxy\napp.set(\'trust proxy\', true);'
      );
      
      // Salvar o arquivo atualizado
      fs.writeFileSync(serverPath, updatedContent, 'utf8');
      console.log('✅ Configuração de trust proxy adicionada com sucesso!');
    } else {
      console.error('❌ Não foi possível encontrar onde adicionar a configuração de trust proxy.');
    }
  }
} catch (error) {
  console.error('❌ Erro ao atualizar o arquivo:', error.message);
}
