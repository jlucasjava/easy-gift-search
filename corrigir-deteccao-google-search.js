// Script para corrigir a detecção da variável USE_GOOGLE_SEARCH_API
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Função para exibir mensagem formatada
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

// Função para verificar e atualizar arquivos
function verificarEAtualizarArquivos() {
  log('======== CORREÇÃO DA DETECÇÃO DA VARIÁVEL USE_GOOGLE_SEARCH_API ========', 'cyan');
  
  // Lista de arquivos que podem precisar de correção
  const arquivos = [
    path.join(process.cwd(), 'backend', 'config', 'apiStatus.js'),
    path.join(process.cwd(), 'backend', 'services', 'googleSearchService.js'),
    path.join(process.cwd(), 'backend', 'controllers', 'newApisController.js'),
    path.join(process.cwd(), 'backend', 'test-current-status.js')
  ];
  
  let totalArquivosAtualizados = 0;
  
  // Verifica e atualiza cada arquivo
  arquivos.forEach(arquivo => {
    try {
      if (!fs.existsSync(arquivo)) {
        log(`⚠️ Arquivo não encontrado: ${arquivo}`, 'yellow');
        return;
      }
      
      let conteudo = fs.readFileSync(arquivo, 'utf8');
      let conteudoOriginal = conteudo;
      let arquivoModificado = false;
      
      // 1. Corrigir verificações simples de USE_GOOGLE_SEARCH_API === 'true'
      if (conteudo.includes("process.env.USE_GOOGLE_SEARCH_API === 'true'")) {
        const regex = /process\.env\.USE_GOOGLE_SEARCH_API === 'true'/g;
        const substituicao = `process.env.USE_GOOGLE_SEARCH_API === 'true' || 
                  process.env.USE_GOOGLE_SEARCH_API === true || 
                  process.env.USE_GOOGLE_SEARCH_API === '1' || 
                  process.env.USE_GOOGLE_SEARCH_API == 'true'`;
        
        conteudo = conteudo.replace(regex, substituicao);
        arquivoModificado = true;
      }
      
      // 2. Corrigir verificações do tipo googleSearchEnabled = ...
      if (conteudo.includes('const googleSearchEnabled = process.env.USE_GOOGLE_SEARCH_API === ')) {
        const regex = /const googleSearchEnabled = process\.env\.USE_GOOGLE_SEARCH_API === ['"]true['"];?/g;
        const substituicao = `const googleSearchEnabled = process.env.USE_GOOGLE_SEARCH_API === 'true' || 
                  process.env.USE_GOOGLE_SEARCH_API === true || 
                  process.env.USE_GOOGLE_SEARCH_API === '1' || 
                  process.env.USE_GOOGLE_SEARCH_API == 'true';`;
        
        conteudo = conteudo.replace(regex, substituicao);
        arquivoModificado = true;
      }
      
      // 3. Corrigir if statements com USE_GOOGLE_SEARCH_API
      if (conteudo.includes('if (process.env.USE_GOOGLE_SEARCH_API === ')) {
        const regex = /if \(process\.env\.USE_GOOGLE_SEARCH_API === ['"]true['"]\)/g;
        const substituicao = `if (process.env.USE_GOOGLE_SEARCH_API === 'true' || 
      process.env.USE_GOOGLE_SEARCH_API === true || 
      process.env.USE_GOOGLE_SEARCH_API === '1' || 
      process.env.USE_GOOGLE_SEARCH_API == 'true')`;
        
        conteudo = conteudo.replace(regex, substituicao);
        arquivoModificado = true;
      }
      
      // 4. Modificação especial para apiStatus.js - adicionar força para produção
      if (arquivo.includes('apiStatus.js')) {
        // Verifica se já existe a linha de força para produção
        if (!conteudo.includes('// Force Google Search API in production')) {
          // Encontra a linha após as importações iniciais
          const linhas = conteudo.split('\n');
          let indicePosImportacao = 0;
          
          for (let i = 0; i < linhas.length; i++) {
            if (linhas[i].includes('require(') || linhas[i].includes('import ')) {
              indicePosImportacao = i;
            } else if (linhas[i].trim() !== '' && indicePosImportacao > 0) {
              indicePosImportacao = i;
              break;
            }
          }
          
          // Adiciona código para forçar ativação em produção
          const codigoForcaProducao = `
// Force Google Search API in production
if (process.env.NODE_ENV === 'production') {
  process.env.USE_GOOGLE_SEARCH_API = 'true';
  console.log('⚠️ Forçando ativação da Google Search API em produção');
}
`;
          
          linhas.splice(indicePosImportacao + 1, 0, codigoForcaProducao);
          conteudo = linhas.join('\n');
          arquivoModificado = true;
        }
      }
      
      // Salva as alterações se o arquivo foi modificado
      if (arquivoModificado) {
        // Criar backup do arquivo original
        fs.writeFileSync(`${arquivo}.bak`, conteudoOriginal);
        log(`✅ Backup criado: ${arquivo}.bak`, 'green');
        
        // Salvar novo conteúdo
        fs.writeFileSync(arquivo, conteudo);
        log(`✅ Arquivo atualizado: ${arquivo}`, 'green');
        
        totalArquivosAtualizados++;
      } else {
        log(`ℹ️ Nenhuma alteração necessária em: ${arquivo}`, 'blue');
      }
      
    } catch (error) {
      log(`❌ Erro ao processar o arquivo ${arquivo}: ${error.message}`, 'red');
    }
  });
  
  return totalArquivosAtualizados;
}

// Executar a verificação e atualização
const arquivosAtualizados = verificarEAtualizarArquivos();

// Relatório final
log('\n📊 RELATÓRIO FINAL:', 'magenta');
if (arquivosAtualizados > 0) {
  log(`✅ ${arquivosAtualizados} arquivo(s) atualizado(s) com sucesso`, 'green');
  log('\n🔧 IMPORTANTE:', 'yellow');
  log('1. As alterações melhoram a detecção da variável USE_GOOGLE_SEARCH_API', 'yellow');
  log('2. Para ambiente de produção (Render), foi adicionado código para forçar a ativação', 'yellow');
  log('3. Você ainda precisa configurar corretamente as variáveis de ambiente no Render', 'yellow');
  log('\n📋 PRÓXIMOS PASSOS:', 'cyan');
  log('1. Commit e push das alterações para o repositório', 'white');
  log('2. Faça o deploy no Render com cache limpo', 'white');
  log('3. Verifique os logs para confirmar que a API está ativa', 'white');
} else {
  log('ℹ️ Nenhum arquivo precisou ser atualizado', 'blue');
}

log('\n==============================================================', 'cyan');
