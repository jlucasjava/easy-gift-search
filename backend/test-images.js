// Script de teste para verificar URLs de imagens
const mercadoLivreService = require('./services/mercadoLivreService');
const shopeeService = require('./services/shopeeService');
const amazonService = require('./services/amazonService');
const aliexpressService = require('./services/aliexpressService');

async function testarImagensProdutos() {
  console.log('🖼️ TESTANDO URLs DE IMAGENS DOS PRODUTOS\n');

  // Buscar todos os produtos
  const [ml, shopee, amazon, ali] = await Promise.all([
    mercadoLivreService.buscarProdutos({}),
    shopeeService.buscarProdutosShopee({}),
    amazonService.buscarProdutosAmazon({}),
    aliexpressService.buscarProdutosAliExpress({})
  ]);

  const todosProdutos = [...ml, ...shopee, ...amazon, ...ali];

  console.log(`=== VERIFICANDO ${todosProdutos.length} PRODUTOS ===\n`);

  todosProdutos.forEach((produto, index) => {
    console.log(`${index + 1}. ${produto.nome}`);
    console.log(`   Marketplace: ${produto.marketplace}`);
    console.log(`   Imagem: ${produto.imagem}`);
    
    // Verificar se é uma URL placeholder ou real do marketplace
    if (produto.imagem.includes('placeholder.com') || produto.imagem.includes('via.placeholder.com')) {
      console.log(`   ⚠️  PLACEHOLDER - Imagem não real`);
    } else if (produto.imagem.includes('mlstatic.com')) {
      console.log(`   ✅ URL REAL do Mercado Livre`);
    } else if (produto.imagem.includes('shopee')) {
      console.log(`   ✅ URL REAL da Shopee`);
    } else {
      console.log(`   🔍 URL de origem: ${produto.marketplace}`);
    }
    console.log('');
  });

  // Contar tipos de imagem
  const placeholder = todosProdutos.filter(p => p.imagem.includes('placeholder')).length;
  const mercadoLivre = todosProdutos.filter(p => p.imagem.includes('mlstatic')).length;
  const outras = todosProdutos.length - placeholder - mercadoLivre;

  console.log('=== RESUMO ===');
  console.log(`📊 Total de produtos: ${todosProdutos.length}`);
  console.log(`🖼️  Imagens placeholder: ${placeholder}`);
  console.log(`🏪 Imagens reais ML: ${mercadoLivre}`);
  console.log(`🔗 Outras imagens: ${outras}`);
  
  if (placeholder > 0) {
    console.log(`\n⚠️  ${placeholder} imagens são placeholders e precisam ser corrigidas!`);
  }
}

testarImagensProdutos().catch(console.error);
