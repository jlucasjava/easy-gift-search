// Teste comparativo entre Google Search e o motor de busca personalizado
const googleSearchService = require('./services/googleSearchService');
const customSearchService = require('./services/customSearchService');

// Função para testar e comparar os motores de busca
async function testarComparativo() {
  console.log('🔍 TESTE COMPARATIVO: GOOGLE SEARCH vs MOTOR PERSONALIZADO');
  console.log('===========================================================');
  
  // Definir filtros de teste
  const filtros = {
    query: 'smartphone',
    precoMax: 1000,
    num: 5
  };
  
  try {
    console.log(`\n👀 Buscando por "${filtros.query}" com preço máximo R$${filtros.precoMax}`);
    
    // Executar ambas as buscas
    console.log('\n🔍 Executando busca no Google Search API...');
    const resultadoGoogle = await googleSearchService.buscarPresentesGoogle({
      categoria: filtros.query,
      precoMax: filtros.precoMax,
      num: filtros.num
    });
    
    console.log('\n🔍 Executando busca no Motor Personalizado...');
    const resultadoCustom = await customSearchService.buscarProdutos(filtros);
    
    // Mostrar resultados comparativos
    console.log('\n📊 RESULTADOS COMPARATIVOS:');
    console.log(`Google Search: ${resultadoGoogle.produtos?.length || 0} produtos`);
    console.log(`Motor Personalizado: ${resultadoCustom.length} produtos`);
    
    // Exibir produtos do Google
    console.log('\n🔍 PRODUTOS DO GOOGLE SEARCH:');
    if (resultadoGoogle.produtos && resultadoGoogle.produtos.length > 0) {
      resultadoGoogle.produtos.forEach((produto, index) => {
        console.log(`\n📌 PRODUTO GOOGLE ${index + 1}:`);
        console.log(`Título: ${produto.title}`);
        console.log(`Preço: ${produto.price || 'Não disponível'}`);
        console.log(`Link: ${produto.link}`);
      });
    } else {
      console.log('Nenhum produto encontrado no Google Search');
    }
    
    // Exibir produtos do Motor Personalizado
    console.log('\n🔍 PRODUTOS DO MOTOR PERSONALIZADO:');
    if (resultadoCustom.length > 0) {
      resultadoCustom.forEach((produto, index) => {
        console.log(`\n📌 PRODUTO PERSONALIZADO ${index + 1}:`);
        console.log(`Título: ${produto.title}`);
        console.log(`Preço: ${produto.price || 'Não disponível'}`);
        console.log(`Marketplace: ${produto.marketplace}`);
        console.log(`Link: ${produto.link}`);
      });
    } else {
      console.log('Nenhum produto encontrado no Motor Personalizado');
    }
    
    return {
      sucesso: true,
      totalGoogle: resultadoGoogle.produtos?.length || 0,
      totalCustom: resultadoCustom.length,
      produtosGoogle: resultadoGoogle.produtos || [],
      produtosCustom: resultadoCustom
    };
  } catch (error) {
    console.error('❌ ERRO NO TESTE COMPARATIVO:', error);
    return {
      sucesso: false,
      erro: error.message
    };
  }
}

// Executar o teste
testarComparativo()
  .then(resultado => {
    if (resultado.sucesso) {
      console.log('\n✅ TESTE COMPARATIVO CONCLUÍDO!');
      console.log('\n📊 RESUMO FINAL:');
      console.log(`Google Search: ${resultado.totalGoogle} produtos`);
      console.log(`Motor Personalizado: ${resultado.totalCustom} produtos`);
      
      // Verificar qual teve melhor desempenho
      if (resultado.totalGoogle > 0 && resultado.totalCustom > 0) {
        // Contar quantos produtos do Google têm preço explícito
        const googleComPreco = resultado.produtosGoogle.filter(p => p.price).length;
        // Contar quantos produtos do motor personalizado têm preço explícito
        const customComPreco = resultado.produtosCustom.filter(p => p.price).length;
        
        console.log(`\nProdutos com preço (Google): ${googleComPreco}/${resultado.totalGoogle}`);
        console.log(`Produtos com preço (Personalizado): ${customComPreco}/${resultado.totalCustom}`);
        
        if (customComPreco > googleComPreco) {
          console.log('\n🏆 VENCEDOR: Motor Personalizado (mais produtos com preços)');
        } else if (googleComPreco > customComPreco) {
          console.log('\n🏆 VENCEDOR: Google Search (mais produtos com preços)');
        } else {
          console.log('\n🤝 EMPATE: Ambos os motores tiveram desempenho similar');
        }
      } else {
        if (resultado.totalCustom > resultado.totalGoogle) {
          console.log('\n🏆 VENCEDOR: Motor Personalizado (mais resultados)');
        } else if (resultado.totalGoogle > resultado.totalCustom) {
          console.log('\n🏆 VENCEDOR: Google Search (mais resultados)');
        } else {
          console.log('\n😐 EMPATE: Nenhum motor retornou resultados');
        }
      }
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
