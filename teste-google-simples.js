// Script para testar a Google Custom Search API com consultas simples
require('dotenv').config();
const axios = require('axios');

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

// Verificar configuração
console.log(`${colors.cyan}=== TESTE SIMPLES DA GOOGLE CUSTOM SEARCH API ===${colors.reset}`);
console.log(`${colors.yellow}Verificando configuração...${colors.reset}`);

// Definir as chaves diretamente para teste
const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY || 'AIzaSyBs07nRYL0fYREou8gwDkS7fruBydwXfvI';
const googleCx = process.env.GOOGLE_SEARCH_CX || 'e17d0e713876e4dca';
const useGoogleSearch = process.env.USE_GOOGLE_SEARCH_API || 'true';

if (!googleApiKey) {
  console.log(`${colors.red}ERRO: GOOGLE_SEARCH_API_KEY não configurada${colors.reset}`);
  process.exit(1);
}

if (!googleCx) {
  console.log(`${colors.red}ERRO: GOOGLE_SEARCH_CX não configurado${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.green}✓ API Key: ${googleApiKey.substring(0, 10)}...${colors.reset}`);
console.log(`${colors.green}✓ CX: ${googleCx}${colors.reset}`);
console.log(`${colors.green}✓ USE_GOOGLE_SEARCH_API: ${useGoogleSearch}${colors.reset}`);
console.log('');

// Lista de consultas para testar (das mais simples às mais complexas)
const queries = [
  'presente',
  'presente aniversário',
  'comprar presente',
  'site:amazon.com.br presente',
  'presentes para masculino 25 anos'
];

// Função para testar uma consulta específica
async function testarConsulta(query) {
  console.log(`${colors.blue}Testando consulta: "${query}"${colors.reset}`);
  
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleCx}&q=${encodeURIComponent(query)}&gl=br`;
    
    console.log(`${colors.yellow}Enviando requisição...${colors.reset}`);
    const response = await axios.get(url, { timeout: 10000 });
    
    if (response.data && response.data.items) {
      console.log(`${colors.green}✓ SUCESSO! ${response.data.items.length} resultados encontrados${colors.reset}`);
      
      // Mostrar alguns detalhes dos primeiros 3 resultados
      const limit = Math.min(3, response.data.items.length);
      for (let i = 0; i < limit; i++) {
        const item = response.data.items[i];
        console.log(`\n${colors.cyan}Resultado #${i+1}:${colors.reset}`);
        console.log(`${colors.magenta}Título:${colors.reset} ${item.title}`);
        console.log(`${colors.magenta}Link:${colors.reset} ${item.link}`);
        console.log(`${colors.magenta}Snippet:${colors.reset} ${item.snippet?.substring(0, 100)}...`);
      }
      
      return true;
    } else {
      console.log(`${colors.red}✗ API respondeu, mas sem resultados${colors.reset}`);
      console.log(`Resposta: ${JSON.stringify(response.data, null, 2).substring(0, 300)}...`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ ERRO: ${error.message}${colors.reset}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Mensagem: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
}

// Função principal para testar todas as consultas
async function executarTestes() {
  let sucessos = 0;
  
  for (const query of queries) {
    console.log('\n' + '-'.repeat(60));
    const sucesso = await testarConsulta(query);
    if (sucesso) sucessos++;
    console.log('-'.repeat(60));
  }
  
  console.log(`\n${colors.cyan}=== RESULTADOS FINAIS ===${colors.reset}`);
  console.log(`${colors.yellow}Consultas testadas: ${queries.length}${colors.reset}`);
  console.log(`${colors.green}Consultas com sucesso: ${sucessos}${colors.reset}`);
  console.log(`${colors.red}Consultas com falha: ${queries.length - sucessos}${colors.reset}`);
  
  if (sucessos === 0) {
    console.log(`\n${colors.red}PROBLEMA CRÍTICO: Nenhuma consulta funcionou${colors.reset}`);
    console.log(`${colors.yellow}Possíveis causas:${colors.reset}`);
    console.log(`1. Cota diária da API atingida`);
    console.log(`2. Chave da API incorreta ou expirada`);
    console.log(`3. Engine de pesquisa (CX) não configurada corretamente`);
    console.log(`4. Problemas de conectividade com a API do Google`);
  } else if (sucessos < queries.length) {
    console.log(`\n${colors.yellow}ALERTA: Algumas consultas não funcionaram${colors.reset}`);
    console.log(`${colors.yellow}Recomendações:${colors.reset}`);
    console.log(`1. Usar consultas mais simples no sistema`);
    console.log(`2. Verificar as configurações da Engine de Pesquisa no Google Control Panel`);
    console.log(`3. Considerar ajustar os parâmetros de busca no código`);
  } else {
    console.log(`\n${colors.green}ÓTIMO: Todas as consultas funcionaram!${colors.reset}`);
    console.log(`${colors.yellow}Recomendações:${colors.reset}`);
    console.log(`1. Verifique o código que processa os resultados da API`);
    console.log(`2. Verifique se os filtros não estão descartando resultados válidos`);
  }
}

// Executar os testes
executarTestes();
