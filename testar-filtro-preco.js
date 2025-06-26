// Script para testar o filtro de preço
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

// Importar funções do googleSearchService para teste
const { 
  searchGoogle, 
  filterByPriceRange, 
  extractPrice, 
  isValidProductLink,
  detectMarketplace
} = require('./backend/services/googleSearchService');

// Função para formatar preço para exibição
function formatPreco(preco) {
  if (!preco) return colors.red + 'Não detectado' + colors.reset;
  return colors.green + preco + colors.reset;
}

// Função para testar extração de preço
async function testarExtracaoPreco() {
  console.log(`\n${colors.cyan}=== TESTE DE EXTRAÇÃO DE PREÇO ===${colors.reset}`);
  
  const exemplos = [
    "Smartphone Xiaomi Redmi Note 12 128GB 4G Wi-Fi Tela 6.67'' Dual Chip 6GB RAM - Preto R$ 1.250,00",
    "Perfume Masculino Ferrari Black 125ml por R$ 149,90",
    "Smart TV Samsung Neo QLED 4K QN85C 55 Polegadas, R$3.999,00",
    "Fone de Ouvido Bluetooth JBL Tune 510BT - R$ 199.99",
    "Notebook Dell Inspiron 15 3000 Intel Core i5 8GB 256GB SSD - R$2999",
    "Ventilador de Mesa Mallory, 30 centímetros - apenas 89,90",
    "Kit Gamer Mouse e Teclado - 129,00",
    "Cadeira Gamer ThunderX3 (R$ 799,90)",
    "Tênis Nike Revolution 6 R$299,99"
  ];
  
  console.log(`\n${colors.yellow}Testando extração de preço dos textos:${colors.reset}`);
  exemplos.forEach(texto => {
    const preco = extractPrice(texto, '');
    console.log(`${colors.blue}Texto: ${texto}${colors.reset}`);
    console.log(`Preço extraído: ${formatPreco(preco)}\n`);
  });
}

// Função para testar filtro de preço
async function testarFiltroPrecoBusca() {
  console.log(`\n${colors.cyan}=== TESTE DE BUSCA COM FILTRO DE PREÇO ===${colors.reset}`);

  // Termos e faixas de preço para testar
  const testes = [
    { termo: 'smartphone', precoMin: 1000, precoMax: 2000 },
    { termo: 'fone de ouvido', precoMin: 100, precoMax: 300 },
    { termo: 'perfume masculino', precoMin: 150, precoMax: 500 },
    { termo: 'relógio de pulso', precoMin: 200, precoMax: 800 }
  ];
  
  for (const teste of testes) {
    console.log(`\n${colors.magenta}Buscando: "${teste.termo}" entre R$${teste.precoMin} e R$${teste.precoMax}${colors.reset}`);
    
    try {
      // Buscar diretamente com a API de busca
      const resultados = await searchGoogle(
        teste.termo, 
        10, 
        1, 
        false, // Desabilitar cache para teste
        {
          precoMin: teste.precoMin,
          precoMax: teste.precoMax
        }
      );
      
      if (!resultados || resultados.length === 0) {
        console.log(`${colors.red}✗ Nenhum resultado encontrado${colors.reset}`);
        continue;
      }
      
      console.log(`${colors.green}✓ ${resultados.length} resultados encontrados${colors.reset}`);
      
      // Estatísticas de preço
      const comPreco = resultados.filter(item => item.price).length;
      console.log(`${colors.blue}Produtos com preço: ${comPreco}/${resultados.length} (${Math.round(comPreco/resultados.length*100)}%)${colors.reset}`);
      
      // Filtro validado
      console.log(`${colors.yellow}Verificando resultados dentro da faixa de preço:${colors.reset}`);
      
      resultados.forEach((item, index) => {
        if (index >= 5) return; // Mostrar apenas 5 resultados
        
        console.log(`\n${colors.blue}[${index+1}] ${item.title}${colors.reset}`);
        console.log(`Link: ${item.link}`);
        console.log(`Marketplace: ${item.marketplace || 'Desconhecido'}`);
        console.log(`Preço: ${formatPreco(item.price)}`);
        console.log(`É produto válido: ${isValidProductLink(item.link) ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);
      });
      
      if (resultados.length > 5) {
        console.log(`\n${colors.yellow}... e mais ${resultados.length - 5} resultados${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}✗ Erro: ${error.message}${colors.reset}`);
    }
  }
}

// Testar buscas com a API local
async function testarBuscaAPIComPreco() {
  console.log(`\n${colors.cyan}=== TESTE DE BUSCA NA API LOCAL COM FILTRO DE PREÇO ===${colors.reset}`);

  // URL do backend local
  const baseUrl = 'http://localhost:3000';
  
  // Termos e faixas de preço para testar
  const testes = [
    { termo: 'smartphone', precoMin: 1000, precoMax: 2000 },
    { termo: 'fone de ouvido', precoMin: 100, precoMax: 300 }
  ];
  
  for (const teste of testes) {
    console.log(`\n${colors.magenta}Buscando via API: "${teste.termo}" entre R$${teste.precoMin} e R$${teste.precoMax}${colors.reset}`);
    
    try {
      const url = `${baseUrl}/api/products?q=${encodeURIComponent(teste.termo)}&precoMin=${teste.precoMin}&precoMax=${teste.precoMax}`;
      console.log(`URL: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`${colors.green}✓ Sucesso! ${response.data.length} resultados${colors.reset}`);
        
        // Verificar preços
        const comPreco = response.data.filter(item => item.price).length;
        console.log(`${colors.blue}Produtos com preço: ${comPreco}/${response.data.length} (${Math.round(comPreco/response.data.length*100)}%)${colors.reset}`);
        
        // Mostrar detalhes dos 3 primeiros resultados
        console.log(`\n${colors.cyan}Detalhes dos primeiros resultados:${colors.reset}`);
        
        response.data.slice(0, 3).forEach((item, index) => {
          console.log(`\n${colors.blue}[${index+1}] ${item.title || item.nome}${colors.reset}`);
          console.log(`Link: ${item.link || item.url}`);
          console.log(`Marketplace: ${item.marketplace || 'Desconhecido'}`);
          console.log(`Preço: ${formatPreco(item.price || item.preco)}`);
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
    // Testar extração de preço
    await testarExtracaoPreco();
    
    // Testar busca com filtro de preço diretamente
    await testarFiltroPrecoBusca();
    
    // Perguntar se quer testar a API local
    console.log(`\n${colors.yellow}Deseja testar a busca com filtro de preço na API local? (Certifique-se de que o servidor está rodando na porta 3000)${colors.reset}`);
    console.log(`Para testar, execute o servidor com: ${colors.cyan}node backend/server.js${colors.reset}`);
    console.log(`Aperte Ctrl+C para cancelar ou espere 5 segundos para continuar...`);
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Testar busca na API
    await testarBuscaAPIComPreco();
    
    console.log(`\n${colors.green}✓ Testes concluídos!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Erro nos testes: ${error.message}${colors.reset}`);
  }
})();
