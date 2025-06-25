// Script para corrigir dependências circulares nos serviços
const fs = require('fs');
const path = require('path');

// Caminho para o arquivo googleSearchService.js
const filePath = path.join(__dirname, 'backend', 'services', 'googleSearchService.js');
const simulateResultsPath = path.join(__dirname, 'backend', 'services', 'simulateGoogleResults.js');

try {
  // Ler o conteúdo do arquivo googleSearchService.js
  let content = fs.readFileSync(filePath, 'utf8');
  let simulateContent = fs.readFileSync(simulateResultsPath, 'utf8');
  
  // Verificar se há dependência circular entre os arquivos
  if (simulateContent.includes('const { extractDomainFromUrl, getMarketplaceImage, detectMarketplace }')) {
    console.log('⚠️ Detectada dependência circular entre googleSearchService.js e simulateGoogleResults.js');
    
    // Modificar simulateGoogleResults.js para não importar funções de googleSearchService.js
    const newSimulateContent = simulateContent.replace(
      'const { extractDomainFromUrl, getMarketplaceImage, detectMarketplace } = require(\'./googleSearchService\');',
      `// Evitando dependência circular com googleSearchService.js
// Implementações simplificadas das funções necessárias
function extractDomainFromUrl(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return '';
  }
}

function detectMarketplace(url) {
  if (!url || typeof url !== 'string') return 'Desconhecido';
  const domain = extractDomainFromUrl(url);
  
  if (domain.includes('mercadolivre.com.br')) return 'Mercado Livre';
  if (domain.includes('amazon.com.br')) return 'Amazon';
  if (domain.includes('magazineluiza.com.br')) return 'Magazine Luiza';
  if (domain.includes('americanas.com.br')) return 'Americanas';
  if (domain.includes('shopee.com.br')) return 'Shopee';
  return 'Loja Online';
}

function getMarketplaceImage(url) {
  return null; // Simplificado para evitar dependência circular
}`
    );
    
    // Salvar as alterações
    fs.writeFileSync(simulateResultsPath, newSimulateContent);
    console.log('✅ Corrigida dependência circular em simulateGoogleResults.js');
  }
  
  // Atualizar googleSearchService.js para aceitar vários formatos de valor true
  if (content.includes('process.env.USE_GOOGLE_SEARCH_API === \'true\'')) {
    const newContent = content.replace(
      /process\.env\.USE_GOOGLE_SEARCH_API === 'true'/g,
      "process.env.USE_GOOGLE_SEARCH_API === 'true' || process.env.USE_GOOGLE_SEARCH_API === true || process.env.USE_GOOGLE_SEARCH_API === '1'"
    );
    
    fs.writeFileSync(filePath, newContent);
    console.log('✅ Melhorada detecção de USE_GOOGLE_SEARCH_API em googleSearchService.js');
  }
  
  console.log('✅ Correções aplicadas com sucesso!');
  
  // Criar arquivo para forçar a ativação da API do Google
  const forceGoogleApiPath = path.join(__dirname, 'backend', 'FORCE_GOOGLE_API_ACTIVE');
  fs.writeFileSync(forceGoogleApiPath, `Google API ativada em: ${new Date().toLocaleString()}`);
  console.log('✅ Arquivo de forçar ativação da API do Google criado');
  
} catch (error) {
  console.error(`❌ Erro ao aplicar correções: ${error.message}`);
}
