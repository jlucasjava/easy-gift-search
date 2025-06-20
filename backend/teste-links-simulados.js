/**
 * Teste de validação dos links reais nos resultados simulados
 * Execute com: node teste-links-simulados.js
 */

// Importar o serviço de simulação de resultados
const simulateGoogleResults = require('./services/simulateGoogleResults');

// Realizar um teste com uma consulta genérica
const query = 'presente';
const num = 5; // Limitamos para 5 para a saída ser mais limpa
const start = 1;

console.log(`🧪 Testando simulação de resultados para: "${query}"`);
console.log('='.repeat(80));

// Obter resultados simulados
const resultados = simulateGoogleResults(query, num, start);

// Verificar se obtivemos resultados
if (!resultados || !resultados.length) {
  console.error('❌ Falha: nenhum resultado retornado.');
  process.exit(1);
}

console.log(`✅ Obtidos ${resultados.length} resultados simulados.`);
console.log('='.repeat(80));

// Validar links para cada resultado
resultados.forEach((resultado, i) => {
  const { title, link, marketplace } = resultado;
  
  console.log(`\n📦 PRODUTO ${i + 1}:`);
  console.log(`🏷️ Título: ${title}`);
  console.log(`🔗 Link: ${link}`);
  console.log(`🏪 Marketplace: ${marketplace || 'Não definido'}`);
    // Validar se o link é de um marketplace real
  const realMarketplaces = [
    'amazon.com.br', 'magazineluiza.com.br', 'americanas.com.br', 
    'submarino.com.br', 'casasbahia.com.br', 'sephora.com.br',
    'dell.com', 'pontofrio.com.br', 'riachuelo.com.br',
    'kabum.com.br', 'centauro.com.br', 'leroy.com.br',
    'fastshop.com.br', 'madeiramadeira.com.br', 'extra.com.br',
    'shoptime.com.br', 'havan.com.br', 'bagaggio.com.br',
    'flexform.com.br', 'dji.com'
  ];
  
  // Verificar se o link contém algum dos domínios de marketplaces reais
  const isRealMarketplace = realMarketplaces.some(domain => link.includes(domain));
  const notPlaceholder = !link.includes('exemplo.com.br');
  
  if (isRealMarketplace && notPlaceholder) {
    console.log('✅ Link válido para marketplace real');
  } else {
    console.log('❌ Link inválido ou usando placeholder');
  }
});

console.log('\n='.repeat(80));
console.log('✅ Teste concluído!');
