// Script para testar a correção da Google Search API
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}=== TESTE DE VERIFICAÇÃO DA CORREÇÃO DO GOOGLE SEARCH API ===${colors.reset}`);

// Verificar se as chaves estão configuradas
const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
const cx = process.env.GOOGLE_SEARCH_CX;
const useGoogleSearch = process.env.USE_GOOGLE_SEARCH_API;

console.log(`\n${colors.blue}Verificando configurações:${colors.reset}`);
console.log(`API Key: ${apiKey ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`}`);
console.log(`CX: ${cx ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`}`);
console.log(`USE_GOOGLE_SEARCH_API: ${useGoogleSearch === 'true' ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`}`);

// Testar a função de extração de domínios
console.log(`\n${colors.blue}Testando funções corrigidas:${colors.reset}`);

// Importar diretamente do arquivo
const googleServicePath = path.join(__dirname, 'backend', 'services', 'googleSearchService.js');
if (!fs.existsSync(googleServicePath)) {
  console.log(`${colors.red}Arquivo do serviço Google não encontrado${colors.reset}`);
  process.exit(1);
}

// Ler o arquivo para extrair funções
const fileContent = fs.readFileSync(googleServicePath, 'utf8');

// Extrair e testar função extractDomainFromUrl
const extractDomainRegex = /function\s+extractDomainFromUrl\s*\(\s*url\s*\)\s*\{([\s\S]*?)\}/;
const extractMatch = fileContent.match(extractDomainRegex);

if (extractMatch) {
  const extractFunctionBody = extractMatch[1].trim();
  console.log(`${colors.green}✓ Função extractDomainFromUrl encontrada${colors.reset}`);
  
  // Criar função temporária para testar
  const tempExtractFunction = new Function('url', extractFunctionBody + `
    if (!url || typeof url !== 'string') return '';
    try {
      // Remover protocolo e parâmetros
      let domain = url.replace(/^(?:https?:\\/\\/)?(?:www\\.)?/i, '').split('/')[0];
      return domain.toLowerCase();
    } catch (error) {
      console.error('Erro ao extrair domínio da URL:', error);
      return url;
    }
  `);
  
  // Testar com algumas URLs
  const testUrls = [
    'https://www.amazon.com.br/produto/123',
    'http://mercadolivre.com.br/MLB-123?query=teste',
    'www.magazineluiza.com.br/categoria/produto',
    'americanas.com/produto-123',
    'https://subdominio.shopee.com.br/loja/item/123'
  ];
  
  console.log(`\n${colors.yellow}Testando extração de domínios:${colors.reset}`);
  testUrls.forEach(url => {
    try {
      const domain = tempExtractFunction(url);
      console.log(`${url} → ${domain} ${domain ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`}`);
    } catch (e) {
      console.log(`${url} → ${colors.red}ERRO: ${e.message}${colors.reset}`);
    }
  });
}

// Testar a API do Google com um termo simples
async function testarGoogleApi() {
  if (!apiKey || !cx) {
    console.log(`${colors.red}Chaves da API não configuradas. Teste não realizado.${colors.reset}`);
    return;
  }
  
  console.log(`\n${colors.magenta}Realizando teste com a API do Google...${colors.reset}`);
  
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=presente+relogio&filter=0&safe=moderate&num=5`;
    console.log(`URL da requisição: ${url}`);
    
    const response = await axios.get(url, { timeout: 15000 });
    
    if (response.data && response.data.items) {
      console.log(`${colors.green}✓ API respondeu com ${response.data.items.length} resultados${colors.reset}`);
      
      // Mostrar alguns detalhes dos resultados
      console.log(`\n${colors.yellow}Primeiros resultados:${colors.reset}`);
      response.data.items.slice(0, 3).forEach((item, index) => {
        console.log(`\n${colors.cyan}Resultado ${index + 1}:${colors.reset}`);
        console.log(`Título: ${item.title}`);
        console.log(`Link: ${item.link}`);
        console.log(`Snippet: ${item.snippet.substring(0, 100)}...`);
      });
      
      // Verificar domínios dos resultados
      const domains = response.data.items.map(item => {
        try {
          return new URL(item.link).hostname;
        } catch (e) {
          return 'invalid-url';
        }
      });
      
      console.log(`\n${colors.yellow}Domínios encontrados:${colors.reset}`);
      console.log(domains.join('\n'));
      
      // Verificar marketplaces conhecidos
      const knownMarketplaces = domains.filter(d => 
        d.includes('amazon') || 
        d.includes('mercadolivre') || 
        d.includes('magazineluiza') || 
        d.includes('americanas') ||
        d.includes('shopee') ||
        d.includes('submarino') ||
        d.includes('kabum')
      );
      
      console.log(`\n${colors.magenta}Marketplaces conhecidos: ${knownMarketplaces.length}/${domains.length}${colors.reset}`);
      if (knownMarketplaces.length > 0) {
        console.log(`${colors.green}✓ Marketplaces encontrados: ${knownMarketplaces.join(', ')}${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️ Nenhum marketplace conhecido nos resultados${colors.reset}`);
      }
      
    } else {
      console.log(`${colors.red}✗ API respondeu sem resultados${colors.reset}`);
      console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erro ao testar API: ${error.message}${colors.reset}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Dados: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Executar o teste da API
testarGoogleApi();
