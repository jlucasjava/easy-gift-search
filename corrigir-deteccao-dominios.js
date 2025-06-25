// Script para corrigir a detecção de domínios na função isValidMarketplace
const fs = require('fs');
const path = require('path');

// Caminho do arquivo de serviço
const googleServicePath = path.join(__dirname, 'backend', 'services', 'googleSearchService.js');

// Verificar se o arquivo existe
if (!fs.existsSync(googleServicePath)) {
  console.error('Arquivo googleSearchService.js não encontrado');
  process.exit(1);
}

// Criar backup do arquivo se ainda não existir
const backupPath = `${googleServicePath}.domain.bak`;
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(googleServicePath, backupPath);
  console.log(`Backup criado: ${backupPath}`);
}

// Ler o conteúdo do arquivo
let content = fs.readFileSync(googleServicePath, 'utf8');

// Expressão regular para encontrar a função isValidMarketplace
const functionRegex = /function\s+isValidMarketplace\s*\(\s*url\s*\)\s*\{[\s\S]*?\}\s*try\s*\{[\s\S]*?\}\s*catch[\s\S]*?\}/g;
const match = content.match(functionRegex);

if (!match) {
  console.error('Função isValidMarketplace não encontrada no arquivo');
  process.exit(1);
}

// Nova implementação da função
const newFunction = `function isValidMarketplace(url) {
  if (!url || typeof url !== 'string') return false;
  
  url = url.toLowerCase();
  
  // Lista simplificada de domínios de marketplaces
  const marketplaces = [
    'mercadolivre.com.br', 'mercadolibre.com',
    'amazon.com.br', 'amazon.com',
    'magazineluiza.com.br', 'magalu.com',
    'americanas.com.br', 'americanas.com',
    'submarino.com.br', 'shoptime.com.br',
    'casasbahia.com.br', 'pontofrio.com.br', 'extra.com.br',
    'shopee.com.br', 'aliexpress.com',
    'kabum.com.br', 'fastshop.com.br',
    'netshoes.com.br', 'centauro.com.br'
  ];
  
  // Verificar se a URL contém qualquer um dos marketplaces
  return marketplaces.some(marketplace => url.includes(marketplace));
}`;

// Substituir a função antiga pela nova
const updatedContent = content.replace(functionRegex, newFunction);

// Salvar o arquivo atualizado
fs.writeFileSync(googleServicePath, updatedContent);
console.log('Função isValidMarketplace atualizada com sucesso');

// Adicionar código para forçar aceitação de todos os resultados
const processResultsRegex = /if\s*\(validResults\.length\s*>=\s*Math\.min\(5,\s*resultados\.length\s*\/\s*2\)\)\s*\{[\s\S]*?resultados\s*=\s*validResults;[\s\S]*?\}/g;
const processMatch = updatedContent.match(processResultsRegex);

if (processMatch) {
  const newProcessCode = `if (validResults.length >= 1) {
        console.log(\`✅ Encontrados \${validResults.length} resultados de marketplaces válidos\`);
        resultados = validResults;
      } else {
        console.log(\`⚠️ Nenhum resultado de marketplace válido encontrado, usando todos os resultados\`);
        // Manter todos os resultados quando não há resultados válidos
      }`;
  
  const finalContent = updatedContent.replace(processResultsRegex, newProcessCode);
  fs.writeFileSync(googleServicePath, finalContent);
  console.log('Código de processamento de resultados atualizado');
}

// Corrigir a extração de domínio de URL
const extractDomainRegex = /function\s+extractDomainFromUrl\s*\(\s*url\s*\)\s*\{[\s\S]*?\}/g;
const extractMatch = updatedContent.match(extractDomainRegex);

if (extractMatch) {
  const newExtractFunction = `function extractDomainFromUrl(url) {
  if (!url || typeof url !== 'string') return '';
  
  try {
    // Remover protocolo e parâmetros
    let domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
    return domain.toLowerCase();
  } catch (error) {
    console.error('Erro ao extrair domínio da URL:', error);
    return url;
  }
}`;
  
  const extractUpdatedContent = fs.readFileSync(googleServicePath, 'utf8').replace(extractDomainRegex, newExtractFunction);
  fs.writeFileSync(googleServicePath, extractUpdatedContent);
  console.log('Função extractDomainFromUrl atualizada');
}

console.log('\nTodas as correções foram aplicadas. Reinicie o servidor para aplicar as alterações.');
