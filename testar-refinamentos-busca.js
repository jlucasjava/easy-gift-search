// Script para testar melhorias no filtro da busca
require('dotenv').config();
const axios = require('axios');

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

// Termos de busca para testar o refinamento
const buscas = [
  'smartphone xiaomi',
  'perfume masculino',
  'tênis nike',
  'relógio de pulso',
  'fone de ouvido bluetooth'
];

// Funções importadas do googleSearchService.js para teste
const { isValidMarketplace, isValidProductLink, normalizeProductUrl, extractDomainFromUrl } = 
  require('./backend/services/googleSearchService');

// Testar URLs exemplo
function testarURLs() {
  console.log(`${colors.cyan}=== TESTE DE VERIFICAÇÃO DE URLS ===${colors.reset}`);
  
  const urlsExemplo = [
    // URLs boas de produtos
    'https://www.amazon.com.br/dp/B08FH4D6T4',
    'https://www.mercadolivre.com.br/produto/MLB-123456789',
    'https://www.magazineluiza.com.br/p/12345678',
    'https://www.americanas.com.br/produto/12345678',
    'https://shopee.com.br/product/12345/67890',
    'https://www.submarino.com.br/produto/12345678',
    
    // URLs ruins (não são produtos específicos)
    'https://www.amazon.com.br/s?k=smartphone',
    'https://lista.mercadolivre.com.br/eletronicos',
    'https://www.magazineluiza.com.br/busca/smartphone',
    'https://www.americanas.com.br/categoria/celulares',
    'https://shopee.com.br/search?keyword=perfume',
    
    // URLs com parâmetros de rastreamento
    'https://www.amazon.com.br/dp/B08FH4D6T4?tag=affiliate&utm_source=google',
    'https://www.mercadolivre.com.br/produto/MLB-123456789?utm_campaign=search'
  ];
  
  console.log(`\n${colors.yellow}Testando URLs com isValidProductLink:${colors.reset}`);
  urlsExemplo.forEach(url => {
    const isValid = isValidProductLink(url);
    console.log(`${isValid ? colors.green + '✓' : colors.red + '✗'} ${colors.reset}${url}`);
  });
  
  console.log(`\n${colors.yellow}Testando normalização de URLs:${colors.reset}`);
  urlsExemplo.forEach(url => {
    const normalized = normalizeProductUrl(url);
    console.log(`${url}\n  → ${colors.cyan}${normalized}${colors.reset}`);
  });
}

// Testar a busca real com o backend
async function testarBuscaAPI() {
  console.log(`\n${colors.cyan}=== TESTE DE BUSCA NA API LOCAL ===${colors.reset}`);
  
  // URL do backend local
  const baseUrl = 'http://localhost:3000';
  
  for (const termo of buscas) {
    console.log(`\n${colors.magenta}Buscando: "${termo}"${colors.reset}`);
    
    try {
      const url = `${baseUrl}/api/products?q=${encodeURIComponent(termo)}`;
      console.log(`URL: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`${colors.green}✓ Sucesso! ${response.data.length} resultados${colors.reset}`);
        
        // Verificar links de produtos
        const produtosValidos = response.data.filter(item => isValidProductLink(item.link));
        console.log(`${colors.blue}Links de produtos válidos: ${produtosValidos.length}/${response.data.length}${colors.reset}`);
        
        // Verificar marketplaces
        const marketplaces = {};
        response.data.forEach(item => {
          const domain = extractDomainFromUrl(item.link);
          marketplaces[domain] = (marketplaces[domain] || 0) + 1;
        });
        
        console.log(`${colors.yellow}Marketplaces encontrados:${colors.reset}`);
        Object.entries(marketplaces)
          .sort((a, b) => b[1] - a[1])
          .forEach(([domain, count]) => {
            console.log(`  ${domain}: ${count}`);
          });
        
        // Mostrar detalhes dos 3 primeiros resultados
        console.log(`\n${colors.cyan}Detalhes dos primeiros resultados:${colors.reset}`);
        response.data.slice(0, 3).forEach((item, index) => {
          console.log(`\n${colors.blue}[${index+1}] ${item.title}${colors.reset}`);
          console.log(`Link: ${item.link}`);
          console.log(`Marketplace: ${item.marketplace || 'Desconhecido'}`);
          console.log(`Preço: ${item.price || 'Não detectado'}`);
          console.log(`Imagem: ${item.image ? '✓' : '✗'}`);
          console.log(`É produto válido: ${isValidProductLink(item.link) ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);
        });
      } else {
        console.log(`${colors.red}✗ Resposta inesperada da API${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}✗ Erro: ${error.message}${colors.reset}`);
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
      }
    }
  }
}

// Iniciar os testes
(async () => {
  try {
    // Teste de validação de URLs
    testarURLs();
    
    // Perguntar se quer testar a API local
    console.log(`\n${colors.yellow}Deseja testar a busca na API local? (Certifique-se de que o servidor está rodando na porta 3000)${colors.reset}`);
    console.log(`Para testar, execute o servidor com: ${colors.cyan}node backend/server.js${colors.reset}`);
    console.log(`Aperte Ctrl+C para cancelar ou espere 5 segundos para continuar...`);
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Testar busca na API
    await testarBuscaAPI();
    
    console.log(`\n${colors.green}✓ Testes concluídos!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Erro nos testes: ${error.message}${colors.reset}`);
  }
})();
