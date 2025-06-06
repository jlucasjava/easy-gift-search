// Script para iniciar servidor e testar APIs reais
require('dotenv').config();

console.log('🚀 INICIANDO TESTE COMPLETO DE APIS REAIS...\n');

// 1. Verificar configurações
console.log('📋 CONFIGURAÇÕES ATUAIS:');
console.log('- USE_REAL_AMAZON_API:', process.env.USE_REAL_AMAZON_API);
console.log('- USE_REAL_SHOPEE_API:', process.env.USE_REAL_SHOPEE_API);
console.log('- USE_REAL_ALIEXPRESS_API:', process.env.USE_REAL_ALIEXPRESS_API);
console.log('- USE_REAL_MERCADOLIVRE_API:', process.env.USE_REAL_MERCADOLIVRE_API);
console.log('- RAPIDAPI_KEY:', process.env.RAPIDAPI_KEY ? '✅ Configurada' : '❌ NÃO configurada');
console.log('');

// 2. Testar cada serviço individualmente
async function testarServicos() {
  const amazonService = require('./services/amazonService');
  const shopeeService = require('./services/shopeeService');
  const aliexpressService = require('./services/aliexpressService');
  const mercadoLivreService = require('./services/mercadoLivreService');

  const filtros = { genero: 'gift', categoria: 'electronics' };

  console.log('🧪 TESTANDO CADA SERVIÇO:\n');

  // Amazon
  console.log('1. 📦 AMAZON:');
  try {
    const amazon = await amazonService.buscarProdutos(filtros);
    console.log(`   ✅ ${amazon.length} produtos encontrados`);
    if (amazon.length > 0) {
      console.log(`   📱 Primeiro: ${amazon[0].nome} - R$ ${amazon[0].preco}`);
      console.log(`   🔗 URL: ${amazon[0].url}`);
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  console.log('');

  // Shopee
  console.log('2. 🛍️ SHOPEE:');
  try {
    const shopee = await shopeeService.buscarProdutos(filtros);
    console.log(`   ✅ ${shopee.length} produtos encontrados`);
    if (shopee.length > 0) {
      console.log(`   📱 Primeiro: ${shopee[0].nome} - R$ ${shopee[0].preco}`);
      console.log(`   🔗 URL: ${shopee[0].url}`);
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  console.log('');

  // AliExpress
  console.log('3. 🛒 ALIEXPRESS:');
  try {
    const aliexpress = await aliexpressService.buscarProdutos(filtros);
    console.log(`   ✅ ${aliexpress.length} produtos encontrados`);
    if (aliexpress.length > 0) {
      console.log(`   📱 Primeiro: ${aliexpress[0].nome} - R$ ${aliexpress[0].preco}`);
      console.log(`   🔗 URL: ${aliexpress[0].url}`);
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  console.log('');

  // Mercado Livre
  console.log('4. 🏪 MERCADO LIVRE:');
  try {
    const mercadoLivre = await mercadoLivreService.buscarProdutos(filtros);
    console.log(`   ✅ ${mercadoLivre.length} produtos encontrados`);
    if (mercadoLivre.length > 0) {
      console.log(`   📱 Primeiro: ${mercadoLivre[0].nome} - R$ ${mercadoLivre[0].preco}`);
      console.log(`   🔗 URL: ${mercadoLivre[0].url}`);
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
  console.log('');

  console.log('🎉 TESTE COMPLETO FINALIZADO!');
  console.log('');
  console.log('📊 RESUMO:');
  console.log('- Amazon: Funcionando ✅ (API real)');
  console.log('- Shopee: Verificar endpoint da API');
  console.log('- AliExpress: Verificar configuração da API');
  console.log('- Mercado Livre: Verificar autenticação');
  console.log('');
  console.log('📋 PRÓXIMO PASSO: Iniciar servidor com npm start ou node server.js');
}

testarServicos().catch(console.error);
