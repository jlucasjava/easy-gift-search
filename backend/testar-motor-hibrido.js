// Teste do motor de busca híbrido
const hybridSearchService = require('./services/hybridSearchService');

// Função para testar o motor de busca híbrido
async function testarMotorHibrido() {
  console.log('🔍 TESTANDO MOTOR DE BUSCA HÍBRIDO');
  console.log('==================================');
  
  // Definir filtros de teste
  const filtros = {
    query: 'fone de ouvido bluetooth',
    precoMax: 200,
    num: 5
  };
  
  try {
    console.log(`👀 Buscando por "${filtros.query}" com preço máximo R$${filtros.precoMax}`);
    
    // Executar busca
    const resultado = await hybridSearchService.buscarProdutos(filtros);
    
    // Mostrar resultados
    console.log('\n✅ RESULTADOS DA BUSCA:');
    console.log(`Total de produtos encontrados: ${resultado.length}`);
    
    // Exibir cada produto
    resultado.forEach((produto, index) => {
      console.log(`\n📌 PRODUTO ${index + 1}:`);
      console.log(`Título: ${produto.title}`);
      console.log(`Preço: ${produto.price || 'Não disponível'}`);
      console.log(`Marketplace: ${produto.marketplace}`);
      console.log(`Link: ${produto.link}`);
      console.log(`Imagem: ${produto.image || 'Não disponível'}`);
    });
    
    console.log('\n🧮 ESTATÍSTICAS:');
    const estatisticas = hybridSearchService.obterEstatisticasCache();
    console.log(`Itens em cache: ${estatisticas.itemCount}`);
    console.log(`Cache hits: ${estatisticas.hits}`);
    console.log(`Cache misses: ${estatisticas.misses}`);
    
    return {
      sucesso: true,
      totalResultados: resultado.length,
      produtos: resultado
    };
  } catch (error) {
    console.error('❌ ERRO AO TESTAR MOTOR HÍBRIDO:', error);
    return {
      sucesso: false,
      erro: error.message
    };
  }
}

// Executar o teste
testarMotorHibrido()
  .then(resultado => {
    if (resultado.sucesso) {
      console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
      console.log(`Total de produtos encontrados: ${resultado.totalResultados}`);
    } else {
      console.log('\n❌ TESTE FALHOU!');
      console.log(`Erro: ${resultado.erro}`);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 ERRO CRÍTICO:', err);
    process.exit(1);
  });
