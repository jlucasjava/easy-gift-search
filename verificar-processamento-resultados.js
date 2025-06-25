// Script para verificar como a aplicação está processando os resultados da API
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Cores para saída no console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Configuração
console.log(`${colors.cyan}=== VERIFICAÇÃO DO PROCESSAMENTO DE RESULTADOS DA GOOGLE SEARCH API ===${colors.reset}`);

// Carregar e analisar o serviço de busca
try {
  // Caminhos dos arquivos principais
  const googleServicePath = path.join(__dirname, 'backend', 'services', 'googleSearchService.js');
  
  if (!fs.existsSync(googleServicePath)) {
    console.log(`${colors.red}ERRO: Arquivo ${googleServicePath} não encontrado${colors.reset}`);
    process.exit(1);
  }
  
  // Ler o conteúdo do arquivo
  const serviceContent = fs.readFileSync(googleServicePath, 'utf8');
  
  // Analisar funções críticas
  console.log(`${colors.yellow}Analisando funções críticas no googleSearchService.js...${colors.reset}`);
  
  // 1. Verificar filtros de marketplace
  let marketplacePattern = /isValidMarketplace|detectMarketplace/g;
  let marketplaceMatches = serviceContent.match(marketplacePattern) || [];
  
  console.log(`${colors.blue}Funções de validação de marketplace: ${marketplaceMatches.length} ocorrências${colors.reset}`);
  
  // 2. Extrair a função isValidMarketplace
  const isValidMarketplacePattern = /function\s+isValidMarketplace\s*\(\s*url\s*\)\s*{[^}]*}/s;
  const isValidMarketplaceMatch = serviceContent.match(isValidMarketplacePattern);
  
  if (isValidMarketplaceMatch) {
    console.log(`${colors.green}✓ Função isValidMarketplace encontrada${colors.reset}`);
    console.log(`${colors.yellow}Código da função:${colors.reset}`);
    console.log(isValidMarketplaceMatch[0]);
    
    // Analisar a lógica da função
    const domainPattern = /site:([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    let domainMatches = serviceContent.match(domainPattern) || [];
    let domains = domainMatches.map(match => match.replace('site:', ''));
    
    console.log(`\n${colors.blue}Domínios configurados para busca: ${domains.length}${colors.reset}`);
    domains.forEach(domain => console.log(`- ${domain}`));
    
    // Verificar se a função aceita esses domínios
    const validationPattern = /url\.includes\(['"]([^'"]+)['"]\)/g;
    let validationMatches = [];
    let match;
    while ((match = validationPattern.exec(isValidMarketplaceMatch[0])) !== null) {
      validationMatches.push(match[1]);
    }
    
    console.log(`\n${colors.blue}Domínios validados na função: ${validationMatches.length}${colors.reset}`);
    validationMatches.forEach(domain => console.log(`- ${domain}`));
    
    // Verificar discrepâncias
    const missingDomains = domains.filter(domain => 
      !validationMatches.some(validDomain => domain.includes(validDomain) || validDomain.includes(domain))
    );
    
    if (missingDomains.length > 0) {
      console.log(`\n${colors.red}⚠️ ALERTA: Domínios na consulta que não são validados pela função:${colors.reset}`);
      missingDomains.forEach(domain => console.log(`- ${domain}`));
    }
  } else {
    console.log(`${colors.red}✗ Função isValidMarketplace não encontrada${colors.reset}`);
  }
  
  // 3. Extrair a função processResults ou similar
  const processPattern = /function\s+(processResults|processApiResults|processGoogleResults)[^{]*{[^}]*}/s;
  const processMatch = serviceContent.match(processPattern);
  
  if (processMatch) {
    console.log(`\n${colors.green}✓ Função de processamento de resultados encontrada: ${processMatch[1]}${colors.reset}`);
    
    // Verificar se há filtros rigorosos
    const filterPatterns = [
      /filter\(/g,
      /\.filter\(/g,
      /if\s*\([^)]+\)\s*{\s*continue/g,
      /if\s*\([^)]+\)\s*{\s*return\s+null/g,
      /if\s*\([^)]+\)\s*{\s*return\s+\[\]/g
    ];
    
    let totalFilters = 0;
    
    filterPatterns.forEach(pattern => {
      const matches = (processMatch[0].match(pattern) || []).length;
      totalFilters += matches;
    });
    
    console.log(`${colors.blue}Filtros de resultados detectados: ${totalFilters}${colors.reset}`);
    
    if (totalFilters > 3) {
      console.log(`${colors.red}⚠️ ALERTA: Muitos filtros detectados, pode estar eliminando resultados válidos${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}✗ Função de processamento de resultados não encontrada explicitamente${colors.reset}`);
  }
  
  // 4. Analisar o código de extração de imagens
  const imagePattern = /function\s+(getBestImage|getImage|extractImage)[^{]*{[^}]*}/s;
  const imageMatch = serviceContent.match(imagePattern);
  
  if (imageMatch) {
    console.log(`\n${colors.green}✓ Função de extração de imagens encontrada: ${imageMatch[1]}${colors.reset}`);
    
    // Verificar complexidade
    const complexityPatterns = [
      /if\s*\(/g,
      /else\s*{/g,
      /\?\s*:/g // Operador ternário
    ];
    
    let complexityScore = 0;
    
    complexityPatterns.forEach(pattern => {
      const matches = (imageMatch[0].match(pattern) || []).length;
      complexityScore += matches;
    });
    
    console.log(`${colors.blue}Complexidade da extração de imagens: ${complexityScore}${colors.reset}`);
    
    if (complexityScore > 5) {
      console.log(`${colors.red}⚠️ ALERTA: Lógica de extração de imagens muito complexa, pode estar falhando${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}✗ Função de extração de imagens não encontrada explicitamente${colors.reset}`);
  }
  
  // 5. Verificar o código de busca principal
  const searchPattern = /function\s+searchGoogle[^{]*{[^}]*}/s;
  const searchMatch = serviceContent.match(searchPattern);
  
  if (searchMatch) {
    console.log(`\n${colors.green}✓ Função searchGoogle encontrada${colors.reset}`);
    
    // Verificar configurações de busca
    const configPattern = /params:\s*{[^}]*}/s;
    const configMatch = searchMatch[0].match(configPattern);
    
    if (configMatch) {
      console.log(`${colors.yellow}Configurações da busca:${colors.reset}`);
      console.log(configMatch[0]);
      
      // Analisar configurações específicas
      const criticalConfigs = [
        { name: 'gl', description: 'Geolocalização' },
        { name: 'cr', description: 'Restrição de país' },
        { name: 'lr', description: 'Restrição de idioma' },
        { name: 'safe', description: 'Filtro SafeSearch' },
        { name: 'filter', description: 'Filtro de duplicados' }
      ];
      
      criticalConfigs.forEach(config => {
        const configPattern = new RegExp(`${config.name}:\\s*['"]([^'"]+)['"]`);
        const match = configMatch[0].match(configPattern);
        
        if (match) {
          console.log(`${colors.blue}${config.description} (${config.name}): ${match[1]}${colors.reset}`);
          
          // Verificar valores que podem estar limitando demais
          if (config.name === 'filter' && match[1] === '1') {
            console.log(`${colors.red}⚠️ ALERTA: filter=1 pode estar eliminando resultados relevantes${colors.reset}`);
          }
        }
      });
    }
  } else {
    console.log(`${colors.red}✗ Função searchGoogle não encontrada${colors.reset}`);
  }
  
  // Conclusão
  console.log(`\n${colors.cyan}=== RECOMENDAÇÕES ===${colors.reset}`);
  console.log(`${colors.yellow}1. Execute o script teste-google-simples.js para verificar se a API está retornando resultados${colors.reset}`);
  console.log(`${colors.yellow}2. Considere modificar a consulta enviada ao Google para ser mais simples${colors.reset}`);
  console.log(`${colors.yellow}3. Verifique se os filtros de marketplace não estão muito restritivos${colors.reset}`);
  console.log(`${colors.yellow}4. Considere definir filter=0 nos parâmetros da API para obter mais resultados${colors.reset}`);
  console.log(`${colors.yellow}5. Verifique no painel do Google Custom Search se a engine está configurada corretamente${colors.reset}`);
  
} catch (error) {
  console.log(`${colors.red}ERRO: ${error.message}${colors.reset}`);
}
