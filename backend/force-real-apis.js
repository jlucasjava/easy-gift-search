#!/usr/bin/env node
/**
 * SCRIPT DE CONFIGURAÇÃO: FORÇAR USO APENAS DE APIS REAIS
 * 
 * Este script modifica temporariamente os serviços para garantir que
 * APENAS dados reais sejam usados, ignorando completamente os mocks.
 */

require('dotenv').config();
console.log('🚀 CONFIGURANDO SISTEMA PARA USAR APENAS APIS REAIS...\n');

// 1. VERIFICAR CONFIGURAÇÃO ATUAL
console.log('📋 CONFIGURAÇÃO ATUAL:');
console.log('- USE_REAL_AMAZON_API:', process.env.USE_REAL_AMAZON_API);
console.log('- USE_REAL_SHOPEE_API:', process.env.USE_REAL_SHOPEE_API);
console.log('- USE_REAL_ALIEXPRESS_API:', process.env.USE_REAL_ALIEXPRESS_API);
console.log('- USE_REAL_MERCADOLIVRE_API:', process.env.USE_REAL_MERCADOLIVRE_API);
console.log('- RAPIDAPI_KEY configurada:', !!process.env.RAPIDAPI_KEY);
console.log('- RAPIDAPI_KEY_NEW configurada:', !!process.env.RAPIDAPI_KEY_NEW);
console.log('');

// 2. FORÇAR CONFIGURAÇÃO PARA PRODUÇÃO
process.env.USE_REAL_AMAZON_API = 'true';
process.env.USE_REAL_SHOPEE_API = 'true';
process.env.USE_REAL_ALIEXPRESS_API = 'true';
process.env.USE_REAL_MERCADOLIVRE_API = 'true';
process.env.NODE_ENV = 'production';

console.log('✅ CONFIGURAÇÃO ATUALIZADA PARA PRODUÇÃO!\n');

// 3. TESTAR TODOS OS SERVIÇOS
async function testarTodosServicos() {
  const amazonService = require('./services/amazonService');
  const shopeeService = require('./services/shopeeService');
  const aliexpressService = require('./services/aliexpressService');
  const mercadoLivreService = require('./services/mercadoLivreService');

  console.log('🧪 TESTANDO TODOS OS SERVIÇOS COM APIS REAIS...\n');

  // Teste Amazon
  console.log('1. 📦 TESTANDO AMAZON...');
  try {
    const resultadoAmazon = await amazonService.buscarProdutos({ genero: 'electronics' });
    console.log(`   ✅ Amazon: ${resultadoAmazon.length} produtos encontrados`);
    if (resultadoAmazon.length > 0) {
      console.log(`   📱 Primeiro produto: ${resultadoAmazon[0].nome}`);
      console.log(`   💰 Preço: R$ ${resultadoAmazon[0].preco}`);
    }
  } catch (error) {
    console.log(`   ❌ Amazon ERROR: ${error.message}`);
  }
  console.log('');

  // Teste Shopee
  console.log('2. 🛍️ TESTANDO SHOPEE...');
  try {
    const resultadoShopee = await shopeeService.buscarProdutos({ genero: 'electronics' });
    console.log(`   ✅ Shopee: ${resultadoShopee.length} produtos encontrados`);
    if (resultadoShopee.length > 0) {
      console.log(`   📱 Primeiro produto: ${resultadoShopee[0].nome}`);
      console.log(`   💰 Preço: R$ ${resultadoShopee[0].preco}`);
    }
  } catch (error) {
    console.log(`   ❌ Shopee ERROR: ${error.message}`);
  }
  console.log('');

  // Teste AliExpress
  console.log('3. 🛒 TESTANDO ALIEXPRESS...');
  try {
    const resultadoAliExpress = await aliexpressService.buscarProdutos({ genero: 'electronics' });
    console.log(`   ✅ AliExpress: ${resultadoAliExpress.length} produtos encontrados`);
    if (resultadoAliExpress.length > 0) {
      console.log(`   📱 Primeiro produto: ${resultadoAliExpress[0].nome}`);
      console.log(`   💰 Preço: R$ ${resultadoAliExpress[0].preco}`);
    }
  } catch (error) {
    console.log(`   ❌ AliExpress ERROR: ${error.message}`);
  }
  console.log('');

  // Teste Mercado Livre
  console.log('4. 🏪 TESTANDO MERCADO LIVRE...');
  try {
    const resultadoML = await mercadoLivreService.buscarProdutos({ genero: 'electronics' });
    console.log(`   ✅ Mercado Livre: ${resultadoML.length} produtos encontrados`);
    if (resultadoML.length > 0) {
      console.log(`   📱 Primeiro produto: ${resultadoML[0].nome}`);
      console.log(`   💰 Preço: R$ ${resultadoML[0].preco}`);
    }
  } catch (error) {
    console.log(`   ❌ Mercado Livre ERROR: ${error.message}`);
  }
  console.log('');

  console.log('🎉 TESTE DE CONFIGURAÇÃO CONCLUÍDO!\n');
  
  console.log('📋 PRÓXIMOS PASSOS:');
  console.log('1. Reiniciar o servidor backend');
  console.log('2. Verificar logs do servidor');
  console.log('3. Confirmar que não há mais mensagens "MODO DEMO"');
  console.log('4. Testar frontend para confirmar dados reais\n');
  
  console.log('🔧 COMANDOS ÚTEIS:');
  console.log('   • Reiniciar: npm run dev ou node server.js');
  console.log('   • Verificar logs: tail -f logs/server.log');
  console.log('   • Testar APIs: node test-all-rapidapi.js');
}

// Executar testes
testarTodosServicos().catch(console.error);
