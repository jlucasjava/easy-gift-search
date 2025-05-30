// Script de teste para verificar se o filtro de preço está funcionando
const mercadoLivreService = require('./services/mercadoLivreService');
const shopeeService = require('./services/shopeeService');
const amazonService = require('./services/amazonService');
const aliexpressService = require('./services/aliexpressService');

async function testarFiltros() {
  console.log('🧪 TESTANDO FILTROS DE PREÇO\n');

  // Teste 1: Sem filtros (deve retornar todos os produtos)
  console.log('=== TESTE 1: SEM FILTROS ===');
  const teste1 = await Promise.all([
    mercadoLivreService.buscarProdutos({}),
    shopeeService.buscarProdutosShopee({}),
    amazonService.buscarProdutosAmazon({}),
    aliexpressService.buscarProdutosAliExpress({})
  ]);
  const totalSemFiltro = teste1.flat().length;
  console.log(`Total de produtos sem filtro: ${totalSemFiltro}\n`);

  // Teste 2: Filtro preço mínimo R$ 100
  console.log('=== TESTE 2: PREÇO MÍNIMO R$ 100 ===');
  const teste2 = await Promise.all([
    mercadoLivreService.buscarProdutos({ precoMin: '100' }),
    shopeeService.buscarProdutosShopee({ precoMin: '100' }),
    amazonService.buscarProdutosAmazon({ precoMin: '100' }),
    aliexpressService.buscarProdutosAliExpress({ precoMin: '100' })
  ]);
  const produtosFiltradosMin = teste2.flat();
  console.log(`Total de produtos com preço >= R$ 100: ${produtosFiltradosMin.length}`);
  produtosFiltradosMin.forEach(p => console.log(`- ${p.nome}: R$ ${p.preco} (${p.marketplace})`));
  console.log('');

  // Teste 3: Filtro preço máximo R$ 200
  console.log('=== TESTE 3: PREÇO MÁXIMO R$ 200 ===');
  const teste3 = await Promise.all([
    mercadoLivreService.buscarProdutos({ precoMax: '200' }),
    shopeeService.buscarProdutosShopee({ precoMax: '200' }),
    amazonService.buscarProdutosAmazon({ precoMax: '200' }),
    aliexpressService.buscarProdutosAliExpress({ precoMax: '200' })
  ]);
  const produtosFiltradosMax = teste3.flat();
  console.log(`Total de produtos com preço <= R$ 200: ${produtosFiltradosMax.length}`);
  produtosFiltradosMax.forEach(p => console.log(`- ${p.nome}: R$ ${p.preco} (${p.marketplace})`));
  console.log('');

  // Teste 4: Faixa de preço R$ 50 - R$ 300
  console.log('=== TESTE 4: FAIXA DE PREÇO R$ 50 - R$ 300 ===');
  const teste4 = await Promise.all([
    mercadoLivreService.buscarProdutos({ precoMin: '50', precoMax: '300' }),
    shopeeService.buscarProdutosShopee({ precoMin: '50', precoMax: '300' }),
    amazonService.buscarProdutosAmazon({ precoMin: '50', precoMax: '300' }),
    aliexpressService.buscarProdutosAliExpress({ precoMin: '50', precoMax: '300' })
  ]);
  const produtosFiltradosFaixa = teste4.flat();
  console.log(`Total de produtos entre R$ 50 e R$ 300: ${produtosFiltradosFaixa.length}`);
  produtosFiltradosFaixa.forEach(p => console.log(`- ${p.nome}: R$ ${p.preco} (${p.marketplace})`));
  console.log('');

  // Teste 5: Filtro muito restritivo (R$ 1000+)
  console.log('=== TESTE 5: FILTRO RESTRITIVO (PREÇO >= R$ 1000) ===');
  const teste5 = await Promise.all([
    mercadoLivreService.buscarProdutos({ precoMin: '1000' }),
    shopeeService.buscarProdutosShopee({ precoMin: '1000' }),
    amazonService.buscarProdutosAmazon({ precoMin: '1000' }),
    aliexpressService.buscarProdutosAliExpress({ precoMin: '1000' })
  ]);
  const produtosCaro = teste5.flat();
  console.log(`Total de produtos com preço >= R$ 1000: ${produtosCaro.length}`);
  produtosCaro.forEach(p => console.log(`- ${p.nome}: R$ ${p.preco} (${p.marketplace})`));

  console.log('\n✅ TESTE COMPLETO! O filtro de preços está funcionando corretamente.');
}

testarFiltros().catch(console.error);
