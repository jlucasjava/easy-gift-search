/**
 * Teste de integração dos links reais com o frontend
 * Este script verifica como o backend formata os dados antes de enviá-los para o frontend
 */

// Importar o serviço de simulação de resultados
const simulateGoogleResults = require('./services/simulateGoogleResults');

// Simular a formatação que acontece no controller para o frontend
function formatResultsForFrontend(results) {
  return results.map(item => ({
    nome: item.title,
    titulo: item.title,
    descricao: item.snippet,
    preco: item.price,
    imagem: item.image,
    url: item.link,
    marketplace: item.marketplace || 'Google',
    id: Math.random().toString(36).substr(2, 9) // Simulando a geração de ID
  }));
}

// Realizar um teste com uma consulta de presente para homem
const query = 'presente para homem';
const num = 3; // Limitando para 3 resultados para saída mais limpa
const start = 1;

console.log(`🧪 Testando integração com frontend para: "${query}"`);
console.log('='.repeat(80));

// Obter resultados simulados
const resultados = simulateGoogleResults(query, num, start);

// Verificar se obtivemos resultados
if (!resultados || !resultados.length) {
  console.error('❌ Falha: nenhum resultado retornado.');
  process.exit(1);
}

// Formatar como o controller faria
const resultadosFormatados = formatResultsForFrontend(resultados);

console.log(`✅ Formatados ${resultadosFormatados.length} resultados para o frontend.`);
console.log('='.repeat(80));

// Mostrar como o frontend vai receber os dados
resultadosFormatados.forEach((produto, i) => {
  console.log(`\n📦 PRODUTO ${i + 1} (FORMATADO PARA FRONTEND):`);
  console.log(JSON.stringify(produto, null, 2));
  
  // Validar campos críticos
  const camposObrigatorios = ['nome', 'url', 'marketplace'];
  const camposFaltantes = camposObrigatorios.filter(campo => !produto[campo]);
  
  if (camposFaltantes.length === 0) {
    console.log('✅ Todos os campos obrigatórios estão presentes');
  } else {
    console.log(`❌ Campos obrigatórios faltando: ${camposFaltantes.join(', ')}`);
  }
  
  // Validar URL
  if (produto.url && !produto.url.includes('exemplo.com.br')) {
    console.log('✅ URL real para marketplace');
  } else {
    console.log('❌ URL inválida ou usando placeholder');
  }
  
  // Validar marketplace
  if (produto.marketplace && produto.marketplace !== 'Desconhecido') {
    console.log(`✅ Marketplace definido: ${produto.marketplace}`);
  } else {
    console.log('❌ Marketplace não definido corretamente');
  }
});

console.log('\n='.repeat(80));
console.log('✅ Teste de integração concluído!');
