// Script para corrigir o erro "domain is not defined" em googleSearchService.js
const fs = require('fs');
const path = require('path');

// Caminho para o arquivo googleSearchService.js
const filePath = path.join(__dirname, 'backend', 'services', 'googleSearchService.js');

try {
  // Ler o conteúdo do arquivo
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Substituir a função getMarketplaceImage para garantir que domain seja sempre definido
  const oldFunction = `function getMarketplaceImage(url, domain) {
  if (!url || !domain) return null;
  
  try {
    // Mercado Livre`;

  const newFunction = `function getMarketplaceImage(url, domain) {
  if (!url) return null;
  
  try {
    // Se o domínio não foi fornecido, extraí-lo da URL
    if (!domain) {
      domain = extractDomainFromUrl(url);
    }
    
    // Mercado Livre`;

  // Fazer a substituição
  if (content.includes(oldFunction)) {
    content = content.replace(oldFunction, newFunction);
    
    // Salvar o arquivo modificado
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Arquivo googleSearchService.js corrigido com sucesso!');
  } else {
    console.log('❌ Não foi possível encontrar o trecho exato para substituição.');
    console.log('Por favor, faça a correção manualmente:');
    console.log('1. Modifique a função getMarketplaceImage para extrair o domínio da URL se não for fornecido.');
  }
  
} catch (error) {
  console.error(`❌ Erro ao corrigir o arquivo: ${error.message}`);
}
