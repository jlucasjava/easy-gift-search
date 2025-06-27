// Teste avançado do motor de busca personalizado
const customSearchService = require('./services/customSearchService');
const customSearchServiceV2 = require('./services/customSearchServiceV2');

// Definir diferentes produtos para testar
const testesProdutos = [
  { 
    nome: "Fone de ouvido barato", 
    query: "fone de ouvido",
    precoMax: 150 
  },
  { 
    nome: "Smartphone intermediário", 
    query: "smartphone intermediário",
    precoMax: 1200 
  },
  { 
    nome: "Mochila escolar", 
    query: "mochila escolar resistente",
    precoMax: 200 
  },
  { 
    nome: "Panela elétrica", 
    query: "panela elétrica arroz",
    precoMax: 180 
  }
];

// Função principal de teste
async function executarTesteAvancado() {
  console.log('🔍 TESTE AVANÇADO DOS MOTORES DE BUSCA');
  console.log('======================================');
  
  // Para cada produto
  for (const teste of testesProdutos) {
    console.log(`\n\n📱 TESTANDO: ${teste.nome.toUpperCase()}`);
    console.log(`Query: "${teste.query}" | Preço máximo: R$${teste.precoMax}`);
    console.log('----------------------------------------');
    
    // Definir filtros
    const filtros = {
      query: teste.query,
      precoMax: teste.precoMax,
      num: 3
    };
    
    try {
      // Testar V1
      console.log('\n🔍 MOTOR V1:');
      const resultadoV1 = await customSearchService.buscarProdutos(filtros);
      console.log(`✅ Encontrados: ${resultadoV1.length} produtos`);
      
      if (resultadoV1.length > 0) {
        resultadoV1.forEach((p, i) => {
          console.log(`  ${i+1}. ${p.title.slice(0, 50)}... | ${p.price || 'N/A'} | ${p.marketplace}`);
        });
      } else {
        console.log('  ❌ Nenhum produto encontrado');
      }
      
      // Testar V2
      console.log('\n🔍 MOTOR V2:');
      const resultadoV2 = await customSearchServiceV2.buscarProdutos(filtros);
      console.log(`✅ Encontrados: ${resultadoV2.length} produtos`);
      
      if (resultadoV2.length > 0) {
        resultadoV2.forEach((p, i) => {
          console.log(`  ${i+1}. ${p.title.slice(0, 50)}... | ${p.price || 'N/A'} | ${p.marketplace}`);
        });
      } else {
        console.log('  ❌ Nenhum produto encontrado');
      }
      
    } catch (error) {
      console.error(`❌ ERRO AO TESTAR "${teste.nome}":`, error);
    }
  }
  
  console.log('\n\n✅ TESTES CONCLUÍDOS!');
}

// Executar todos os testes
executarTesteAvancado()
  .then(() => {
    console.log('\nTodos os testes foram concluídos.');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 ERRO CRÍTICO:', err);
    process.exit(1);
  });
