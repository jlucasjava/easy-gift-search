// Script de teste específico para filtro de gênero
const mercadoLivreService = require('./services/mercadoLivreService');

async function testarFiltroGenero() {
  console.log('🧪 TESTANDO FILTRO DE GÊNERO\n');

  // Teste 1: Todos os produtos (sem filtro de gênero)
  console.log('=== TESTE 1: SEM FILTRO DE GÊNERO ===');
  const todos = await mercadoLivreService.buscarProdutos({});
  console.log(`Total de produtos: ${todos.length}`);
  todos.forEach(p => console.log(`- ${p.nome}: Gênero = ${p.genero}`));
  console.log('');

  // Teste 2: Filtro para masculino (como aparece no frontend)
  console.log('=== TESTE 2: FILTRO MASCULINO (como vem do frontend) ===');
  const masculino1 = await mercadoLivreService.buscarProdutos({ genero: 'Masculino' });
  console.log(`Produtos masculinos (Masculino): ${masculino1.length}`);
  masculino1.forEach(p => console.log(`- ${p.nome}: Gênero = ${p.genero}`));
  console.log('');

  // Teste 3: Filtro para masculino (lowercase)
  console.log('=== TESTE 3: FILTRO MASCULINO (lowercase) ===');
  const masculino2 = await mercadoLivreService.buscarProdutos({ genero: 'masculino' });
  console.log(`Produtos masculinos (masculino): ${masculino2.length}`);
  masculino2.forEach(p => console.log(`- ${p.nome}: Gênero = ${p.genero}`));
  console.log('');

  // Teste 4: Filtro para feminino
  console.log('=== TESTE 4: FILTRO FEMININO ===');
  const feminino = await mercadoLivreService.buscarProdutos({ genero: 'feminino' });
  console.log(`Produtos femininos: ${feminino.length}`);
  feminino.forEach(p => console.log(`- ${p.nome}: Gênero = ${p.genero}`));
  console.log('');

  // Teste 5: Cenário do bug reportado - masculino + preço >= 100
  console.log('=== TESTE 5: CENÁRIO DO BUG - MASCULINO + PREÇO >= 100 ===');
  const bugScenario = await mercadoLivreService.buscarProdutos({ 
    genero: 'Masculino', 
    precoMin: '100' 
  });
  console.log(`Produtos encontrados: ${bugScenario.length}`);
  bugScenario.forEach(p => console.log(`- ${p.nome}: Gênero = ${p.genero}, Preço = R$ ${p.preco}`));
  
  console.log('\n✅ TESTE DE GÊNERO COMPLETO!');
}

testarFiltroGenero().catch(console.error);
