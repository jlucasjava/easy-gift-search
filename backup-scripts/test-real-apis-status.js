// Script de teste para verificar se APIs reais estão sendo usadas
const axios = require('axios');

async function testarAPIs() {
  console.log('🧪 TESTANDO APIS APÓS CONFIGURAÇÃO...\n');
  
  try {
    console.log('📦 Testando rota principal /api/products...');
    const response = await axios.get('http://localhost:3000/api/products?genero=electronics&limite=10');
    const produtos = response.data.produtos || response.data;
    
    if (produtos && produtos.length > 0) {
      console.log(`✅ Produtos: ${produtos.length} encontrados`);
      
      // Separar por marketplace
      const amazon = produtos.filter(p => p.marketplace === 'Amazon');
      const shopee = produtos.filter(p => p.marketplace === 'Shopee');
      const aliexpress = produtos.filter(p => p.marketplace === 'AliExpress');
      const mercadoLivre = produtos.filter(p => p.marketplace === 'Mercado Livre');
      
      console.log(`📦 Amazon: ${amazon.length} produtos`);
      console.log(`🛍️ Shopee: ${shopee.length} produtos`);
      console.log(`🛒 AliExpress: ${aliexpress.length} produtos`);
      console.log(`🏪 Mercado Livre: ${mercadoLivre.length} produtos`);
      
      // Verificar se Amazon está usando dados reais
      if (amazon.length > 0) {
        const realAmazon = amazon.some(p => p.url && (p.url.includes('amazon.com') || p.url.includes('/dp/')));
        console.log(`🔍 Amazon - Dados reais: ${realAmazon ? '✅ SIM' : '❌ NÃO (mock)'}`);
        if (realAmazon) {
          console.log(`   📱 Exemplo: ${amazon[0].nome}`);
          console.log(`   💰 Preço: R$ ${amazon[0].preco}`);
        }
      }
      
      // Verificar outros marketplaces
      if (shopee.length > 0) {
        const realShopee = shopee.some(p => p.url && p.url.includes('shopee.com'));
        console.log(`🔍 Shopee - Dados reais: ${realShopee ? '✅ SIM' : '❌ NÃO (mock)'}`);
      }
      
      if (aliexpress.length > 0) {
        const realAliExpress = aliexpress.some(p => p.url && p.url.includes('aliexpress.com'));
        console.log(`🔍 AliExpress - Dados reais: ${realAliExpress ? '✅ SIM' : '❌ NÃO (mock)'}`);
      }
      
      if (mercadoLivre.length > 0) {
        const realML = mercadoLivre.some(p => p.url && p.url.includes('mercadolivre.com'));
        console.log(`🔍 Mercado Livre - Dados reais: ${realML ? '✅ SIM' : '❌ NÃO (mock)'}`);
      }
      
    } else {
      console.log('❌ Nenhum produto encontrado');
    }
  } catch (error) {
    console.log('❌ ERROR:', error.response?.status, error.message);
    if (error.response?.data) {
      console.log('Detalhes:', error.response.data);
    }
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Teste direto da Amazon
  try {
    console.log('🧪 Testando Amazon diretamente...');
    const amazonTest = await axios.get('http://localhost:3000/api/test/amazon?query=electronics&useReal=true');
    
    if (amazonTest.data.sucesso) {
      console.log(`✅ Teste Amazon: ${amazonTest.data.totalProdutos} produtos encontrados`);
      console.log(`🔗 Fonte: ${amazonTest.data.fonte}`);
      
      if (amazonTest.data.produtos && amazonTest.data.produtos.length > 0) {
        console.log(`📱 Produto exemplo: ${amazonTest.data.produtos[0].nome}`);
        console.log(`💰 Preço: R$ ${amazonTest.data.produtos[0].preco}`);
      }
    } else {
      console.log('❌ Teste Amazon falhou');
    }
  } catch (error) {
    console.log('❌ Teste Amazon ERROR:', error.message);
  }
  
  console.log('\n🎉 TESTE COMPLETO!\n');
  
  console.log('📋 RESUMO:');
  console.log('- Se "Dados reais: ✅ SIM" = APIs reais funcionando');
  console.log('- Se "Dados reais: ❌ NÃO" = Ainda usando mock data');
  console.log('\n🔧 Se ainda houver mock data, verificar:');
  console.log('1. Arquivo .env atualizado');
  console.log('2. Servidor reiniciado');
  console.log('3. Chaves RapidAPI válidas');
}

testarAPIs().catch(console.error);
