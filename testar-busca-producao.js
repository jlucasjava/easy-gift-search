// Script para testar a busca em produção
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

console.log(`${colors.cyan}=== TESTE DE BUSCA EM PRODUÇÃO (APÓS DEPLOY) ===${colors.reset}`);
console.log(`${colors.yellow}Data: ${new Date().toLocaleString()}${colors.reset}\n`);

// URL base - ajuste conforme necessário
const baseUrl = 'https://easy-gift-search.vercel.app';
// Termos de busca para testar
const searchTerms = [
  'relógio de presente',
  'perfume importado',
  'smartphone novo',
  'tênis nike',
  'caixa de som bluetooth'
];

async function testSearchTerm(term) {
  console.log(`${colors.blue}Testando busca: "${term}"${colors.reset}`);
  
  try {
    // Endpoint de busca - ajuste conforme a estrutura da sua API
    const url = `${baseUrl}/api/products?q=${encodeURIComponent(term)}`;
    console.log(`URL: ${url}`);
    
    const startTime = Date.now();
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'Accept': 'application/json'
      }
    });
    const endTime = Date.now();
    
    if (response.data && Array.isArray(response.data)) {
      console.log(`${colors.green}✓ Sucesso! ${response.data.length} resultados (${endTime - startTime}ms)${colors.reset}`);
      
      // Verificar se temos produtos de marketplaces reais
      const marketplaceResults = response.data.filter(item => {
        if (!item.link) return false;
        
        const link = item.link.toLowerCase();
        return link.includes('amazon') || 
               link.includes('mercadolivre') || 
               link.includes('magazineluiza') || 
               link.includes('americanas') ||
               link.includes('shopee');
      });
      
      console.log(`${colors.yellow}Produtos de marketplaces: ${marketplaceResults.length}/${response.data.length}${colors.reset}`);
      
      // Mostrar os 3 primeiros resultados
      console.log(`\n${colors.magenta}Primeiros resultados:${colors.reset}`);
      response.data.slice(0, 3).forEach((item, index) => {
        console.log(`\n${colors.cyan}[${index+1}] ${item.title || 'Sem título'}${colors.reset}`);
        console.log(`Link: ${item.link || 'N/A'}`);
        console.log(`Imagem: ${item.image ? '✓' : '✗'}`);
        
        // Detectar marketplace
        let marketplace = 'Desconhecido';
        if (item.link) {
          const link = item.link.toLowerCase();
          if (link.includes('amazon')) marketplace = 'Amazon';
          else if (link.includes('mercadolivre')) marketplace = 'Mercado Livre';
          else if (link.includes('magazineluiza')) marketplace = 'Magazine Luiza';
          else if (link.includes('americanas')) marketplace = 'Americanas';
          else if (link.includes('shopee')) marketplace = 'Shopee';
          else if (link.includes('submarino')) marketplace = 'Submarino';
          else if (link.includes('casasbahia')) marketplace = 'Casas Bahia';
        }
        console.log(`Marketplace: ${marketplace}`);
      });
      
    } else {
      console.log(`${colors.yellow}⚠️ Resposta sem resultados ou formato inesperado${colors.reset}`);
      console.log(JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erro: ${error.message}${colors.reset}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Dados: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
    }
  }
  
  console.log('\n' + '-'.repeat(50) + '\n');
}

// Executar testes sequencialmente
async function runTests() {
  for (const term of searchTerms) {
    await testSearchTerm(term);
  }
  
  console.log(`${colors.green}✓ Testes concluídos!${colors.reset}`);
  console.log(`\n${colors.yellow}PRÓXIMOS PASSOS:${colors.reset}`);
  console.log(`1. Verifique se os resultados incluem produtos reais`);
  console.log(`2. Confirme se as imagens estão aparecendo corretamente`);
  console.log(`3. Verifique os logs do servidor para confirmar que a API do Google está sendo usada`);
  console.log(`4. Teste o site completo para garantir que tudo funciona como esperado`);
}

// Iniciar testes
runTests();
