// Script para ajustar parâmetros da API e tornar a busca menos restritiva
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
console.log(`${colors.cyan}=== AJUSTE DOS PARÂMETROS DA GOOGLE CUSTOM SEARCH API ===${colors.reset}`);

// Caminho do arquivo do serviço
const googleServicePath = path.join(__dirname, 'backend', 'services', 'googleSearchService.js');

if (!fs.existsSync(googleServicePath)) {
  console.log(`${colors.red}ERRO: Arquivo ${googleServicePath} não encontrado${colors.reset}`);
  process.exit(1);
}

// Criar backup do arquivo original
const backupPath = `${googleServicePath}.bak`;
fs.copyFileSync(googleServicePath, backupPath);
console.log(`${colors.green}✓ Backup criado: ${backupPath}${colors.reset}`);

// Ler o conteúdo do arquivo
let serviceContent = fs.readFileSync(googleServicePath, 'utf8');

// Modificações a serem realizadas
const modifications = [
  {
    description: 'Desativar filtro de duplicados',
    pattern: /filter:\s*['"]1['"]/g,
    replacement: 'filter: \'0\''
  },
  {
    description: 'Reduzir restrições de busca',
    pattern: /lr:\s*['"]lang_pt['"]/g,
    replacement: 'lr: \'lang_pt|lang_en\''
  },
  {
    description: 'Modificar SafeSearch para moderate',
    pattern: /safe:\s*['"]active['"]/g,
    replacement: 'safe: \'moderate\''
  },
  {
    description: 'Aumentar número de resultados',
    pattern: /Math\.min\(num,\s*10\)/g,
    replacement: 'Math.min(num, 10)'
  },
  {
    description: 'Tornar isValidMarketplace menos restritivo',
    pattern: /function\s+isValidMarketplace\s*\(\s*url\s*\)\s*{[^}]*}/s,
    finder: function(content) {
      const pattern = /function\s+isValidMarketplace\s*\(\s*url\s*\)\s*{[^}]*}/s;
      const match = content.match(pattern);
      if (!match) return null;
      
      let originalFunction = match[0];
      
      // Se a função for muito restritiva (muitos if, muitos retornos false)
      const falseReturns = (originalFunction.match(/return\s+false/g) || []).length;
      const ifStatements = (originalFunction.match(/if\s*\(/g) || []).length;
      
      if (falseReturns > 1 || ifStatements > 3) {
        // Modificar para uma versão menos restritiva
        const newFunction = `function isValidMarketplace(url) {
  if (!url) return false;
  url = url.toLowerCase();
  
  // Verificar se a URL é de um marketplace conhecido
  const marketplaces = [
    'mercadolivre.com.br', 'amazon.com.br', 'magazineluiza.com.br', 
    'americanas.com.br', 'shopee.com.br', 'casasbahia.com.br',
    'submarino.com.br', 'kabum.com.br', 'netshoes.com.br',
    'centauro.com.br', 'extra.com.br', 'pontofrio.com.br',
    'shoptime.com.br', 'fastshop.com.br', 'aliexpress.com'
  ];
  
  // Se a URL contiver qualquer um dos marketplaces, é válida
  return marketplaces.some(marketplace => url.includes(marketplace));
}`;
        
        return {
          original: originalFunction,
          replacement: newFunction
        };
      }
      
      return null;
    }
  },
  {
    description: 'Simplificar extração de imagens',
    pattern: /function\s+(getBestImage|getImage|extractImage)[^{]*{[^}]*}/s,
    finder: function(content) {
      const pattern = /function\s+(getBestImage)[^{]*{[^}]*}/s;
      const match = content.match(pattern);
      if (!match) return null;
      
      let originalFunction = match[0];
      const functionName = match[1];
      
      // Se a função for muito complexa
      const ifStatements = (originalFunction.match(/if\s*\(/g) || []).length;
      
      if (ifStatements > 4) {
        // Simplificar a função
        const newFunction = `function ${functionName}(item) {
  if (!item || !item.pagemap) return null;
  
  // Tentar obter da propriedade cse_image
  if (item.pagemap.cse_image && item.pagemap.cse_image.length > 0) {
    return item.pagemap.cse_image[0].src;
  }
  
  // Tentar obter da propriedade cse_thumbnail
  if (item.pagemap.cse_thumbnail && item.pagemap.cse_thumbnail.length > 0) {
    return item.pagemap.cse_thumbnail[0].src;
  }
  
  // Tentar obter de metatags
  if (item.pagemap.metatags && item.pagemap.metatags.length > 0) {
    const metatags = item.pagemap.metatags[0];
    
    // Verificar várias possíveis meta tags de imagem
    const possibleMetaTags = [
      'og:image', 'twitter:image', 'image', 'thumbnail'
    ];
    
    for (const tag of possibleMetaTags) {
      if (metatags[tag]) return metatags[tag];
    }
  }
  
  return null;
}`;
        
        return {
          original: originalFunction,
          replacement: newFunction
        };
      }
      
      return null;
    }
  },
  {
    description: 'Adicionar forçamento de aceitação de resultados',
    pattern: /(const validResults = resultados\.filter\(item => isValidMarketplace\(item\.link\)\);)/,
    replacement: '$1\n      \n      // MODIFICADO: Aceitar todos os resultados se não houver resultados válidos suficientes\n      if (validResults.length === 0) {\n        console.log(`⚠️ Nenhum resultado de marketplace válido encontrado, usando todos os resultados`);\n        return resultados;\n      }'
  }
];

// Aplicar modificações
let modificacoesRealizadas = 0;
let erros = 0;

for (const mod of modifications) {
  try {
    console.log(`\n${colors.yellow}Aplicando: ${mod.description}${colors.reset}`);
    
    if (mod.finder) {
      // Modificação complexa usando finder
      const result = mod.finder(serviceContent);
      
      if (result) {
        const newContent = serviceContent.replace(result.original, result.replacement);
        
        if (newContent !== serviceContent) {
          serviceContent = newContent;
          console.log(`${colors.green}✓ Modificação aplicada com sucesso${colors.reset}`);
          modificacoesRealizadas++;
        } else {
          console.log(`${colors.red}✗ Falha ao aplicar modificação${colors.reset}`);
          erros++;
        }
      } else {
        console.log(`${colors.blue}ℹ️ Nada para modificar${colors.reset}`);
      }
    } else {
      // Modificação simples usando pattern
      const originalContent = serviceContent;
      serviceContent = serviceContent.replace(mod.pattern, mod.replacement);
      
      if (serviceContent !== originalContent) {
        console.log(`${colors.green}✓ Modificação aplicada com sucesso${colors.reset}`);
        modificacoesRealizadas++;
      } else {
        console.log(`${colors.blue}ℹ️ Padrão não encontrado ou já modificado${colors.reset}`);
      }
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erro: ${error.message}${colors.reset}`);
    erros++;
  }
}

// Salvar as modificações
if (modificacoesRealizadas > 0) {
  fs.writeFileSync(googleServicePath, serviceContent);
  console.log(`\n${colors.green}✓ Arquivo salvo com ${modificacoesRealizadas} modificações${colors.reset}`);
} else {
  console.log(`\n${colors.yellow}ℹ️ Nenhuma modificação foi aplicada ao arquivo${colors.reset}`);
}

// Instruções finais
console.log(`\n${colors.cyan}=== PRÓXIMOS PASSOS ===${colors.reset}`);
console.log(`${colors.yellow}1. Reinicie o servidor para aplicar as alterações${colors.reset}`);
console.log(`${colors.yellow}2. Execute o script teste-google-simples.js para verificar se a API está retornando resultados${colors.reset}`);
console.log(`${colors.yellow}3. Teste a aplicação para ver se agora retorna produtos reais${colors.reset}`);
console.log(`${colors.yellow}4. Se necessário, você pode restaurar o backup do arquivo:${colors.reset}`);
console.log(`   cp "${backupPath}" "${googleServicePath}"\n`);
