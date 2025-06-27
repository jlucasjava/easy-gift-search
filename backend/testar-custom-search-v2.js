// Teste do motor de busca personalizado V2 (customSearchServiceV2)
const customSearchServiceV2 = require('./services/customSearchServiceV2');

// Função para testar o motor de busca V2
async function testarMotorPersonalizadoV2() {
  console.log('🔍 Testando motor de busca personalizado V2...');
  
  // Definir filtros de teste
  const filtros = {
    query: 'fone de ouvido',
    precoMax: 150,
    num: 5
  };
  
  try {
    console.log(`👀 Buscando por "${filtros.query}" com preço máximo R$${filtros.precoMax}`);
    
    // Executar busca
    const resultado = await customSearchServiceV2.buscarProdutos(filtros);
    
    // Mostrar resultados
    console.log('\n✅ RESULTADOS DA BUSCA V2:');
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
    
    return {
      sucesso: true,
      totalResultados: resultado.length,
      produtos: resultado
    };
  } catch (error) {
    console.error('❌ ERRO AO TESTAR MOTOR PERSONALIZADO V2:', error);
    return {
      sucesso: false,
      erro: error.message
    };
  }
}

// Executar o teste
testarMotorPersonalizadoV2()
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
