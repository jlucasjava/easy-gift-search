// API Status Configuration - Real-time status checker
require('dotenv').config();

/**
 * Display API configuration status on server startup
 */
function displayAPIStatus() {
  console.log('\n🚀 ============= EASY GIFT SEARCH - API STATUS =============');
  console.log(`📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('');

  // Amazon API Status
  const amazonReal = process.env.USE_REAL_AMAZON_API === 'true';
  const amazonKey = !!process.env.RAPIDAPI_KEY;
  console.log('📦 AMAZON:');
  if (amazonReal && amazonKey) {
    console.log('   ✅ REAL API ATIVA - Usando RapidAPI Real-Time Amazon Data');
    console.log('   🔑 RAPIDAPI_KEY configurada');
  } else if (amazonReal && !amazonKey) {
    console.log('   ⚠️ CONFIGURAÇÃO INCOMPLETA - USE_REAL_AMAZON_API=true mas RAPIDAPI_KEY não encontrada');
    console.log('   🔄 Fallback para dados mock');
  } else {
    console.log('   🔧 MODO DEMO - Usando dados mock da Amazon');
  }
  // Shopee API Status  
  const shopeeReal = process.env.USE_REAL_SHOPEE_API === 'true';
  const shopeeScraperKey = !!process.env.SHOPEE_SCRAPER_API_KEY;
  console.log('');
  console.log('🛍️ SHOPEE:');
  if (shopeeReal && shopeeScraperKey) {
    console.log('   ✅ REAL API ATIVA - Usando shopee-scraper1.p.rapidapi.com');
    console.log('   🔑 SHOPEE_SCRAPER_API_KEY configurada');
  } else if (shopeeReal && !shopeeScraperKey) {
    console.log('   ⚠️ CONFIGURAÇÃO INCOMPLETA - USE_REAL_SHOPEE_API=true mas SHOPEE_SCRAPER_API_KEY não encontrada');
    console.log('   🔄 Fallback para dados mock');
  } else {
    console.log('   🔧 MODO DEMO - Usando dados mock do Shopee');
  }

  // AliExpress API Status
  const aliExpressReal = process.env.USE_REAL_ALIEXPRESS_API === 'true';
  console.log('');
  console.log('🛒 ALIEXPRESS:');
  if (aliExpressReal && amazonKey) {
    console.log('   ✅ REAL API ATIVA - Usando api.aliexpress.com');
  } else {
    console.log('   🔄 MODO DEMO - Usando dados mock do AliExpress');
  }

  // Mercado Livre API Status
  const mercadoLivreReal = process.env.USE_REAL_MERCADOLIVRE_API === 'true';
  console.log('');
  console.log('🏪 MERCADO LIVRE:');
  if (mercadoLivreReal) {
    console.log('   ✅ REAL API ATIVA - Usando api.mercadolibre.com');
  } else {
    console.log('   🔄 MODO DEMO - Usando dados mock do Mercado Livre');
  }

  console.log('');  console.log('🔑 CHAVES DE API:');
  console.log(`   RAPIDAPI_KEY: ${process.env.RAPIDAPI_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log(`   RAPIDAPI_KEY_NEW: ${process.env.RAPIDAPI_KEY_NEW ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log(`   SHOPEE_SCRAPER_API_KEY: ${process.env.SHOPEE_SCRAPER_API_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Configurada' : '❌ Não configurada'}`);

  console.log('');
  console.log('⚙️ CONFIGURAÇÕES AVANÇADAS:');
  console.log(`   USE_LLAMA_API: ${process.env.USE_LLAMA_API || 'false'}`);
  console.log(`   USE_GOOGLE_SEARCH_API: ${process.env.USE_GOOGLE_SEARCH_API || 'false'}`);
  console.log(`   USE_BING_WEB_SEARCH_API: ${process.env.USE_BING_WEB_SEARCH_API || 'false'}`);
  console.log(`   USE_GOOGLE_MAPS_API: ${process.env.USE_GOOGLE_MAPS_API || 'false'}`);

  console.log('');
  const totalReal = [amazonReal && amazonKey, shopeeReal && shopeeScraperKey, aliExpressReal && amazonKey, mercadoLivreReal].filter(Boolean).length;
  const totalMarketplaces = 4;
  
  if (totalReal === totalMarketplaces) {
    console.log('🎉 STATUS GERAL: TODAS AS APIS REAIS ATIVAS (' + totalReal + '/' + totalMarketplaces + ')');
  } else if (totalReal > 0) {
    console.log(`⚠️ STATUS GERAL: CONFIGURAÇÃO MISTA (${totalReal}/${totalMarketplaces} APIs reais)`);
  } else {
    console.log('🔧 STATUS GERAL: MODO DEMO COMPLETO (0/' + totalMarketplaces + ' APIs reais)');
  }
  
  console.log('==========================================================\n');
}

/**
 * Check if all required API keys are configured
 */
function validateAPIConfiguration() {
  const missingKeys = [];
  
  if (process.env.USE_REAL_AMAZON_API === 'true' && !process.env.RAPIDAPI_KEY) {
    missingKeys.push('RAPIDAPI_KEY (para Amazon)');
  }
    if (process.env.USE_REAL_SHOPEE_API === 'true' && !process.env.SHOPEE_SCRAPER_API_KEY) {
    missingKeys.push('SHOPEE_SCRAPER_API_KEY (para Shopee)');
  }
  
  if (process.env.USE_REAL_ALIEXPRESS_API === 'true' && !process.env.RAPIDAPI_KEY) {
    missingKeys.push('RAPIDAPI_KEY (para AliExpress)');
  }

  if (missingKeys.length > 0) {
    console.log('⚠️ ATENÇÃO: Chaves de API faltando:');
    missingKeys.forEach(key => console.log(`   ❌ ${key}`));
    console.log('🔧 APIs com chaves faltando usarão dados mock automaticamente.\n');
  }

  return missingKeys.length === 0;
}

module.exports = {
  displayAPIStatus,
  validateAPIConfiguration
};
