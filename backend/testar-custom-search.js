// Teste do motor de busca personalizado (customSearchService)
const customSearchService = require('./services/customSearchService');

// Função para testar o motor de busca
async function testarMotorPersonalizado() {
  console.log('🔍 Testando motor de busca personalizado...');
  
  // Definir filtros de teste
  const filtros = {
    query: 'fone de ouvido',
    precoMax: 150,
    num: 5
  };
  
  try {
    console.log(`👀 Buscando por "${filtros.query}" com preço máximo R$${filtros.precoMax}`);
    
    // Executar busca
    const resultado = await customSearchService.buscarProdutos(filtros);
    
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
    const estatisticas = customSearchService.obterEstatisticasCache();
    console.log(`Itens em cache: ${estatisticas.itemCount}`);
    
    return {
      sucesso: true,
      totalResultados: resultado.length,
      produtos: resultado
    };
  } catch (error) {
    console.error('❌ ERRO AO TESTAR MOTOR PERSONALIZADO:', error);
    return {
      sucesso: false,
      erro: error.message
    };
  }
}

// Executar o teste
testarMotorPersonalizado()
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
