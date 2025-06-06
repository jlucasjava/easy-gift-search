// Debug script to check production environment variables
console.log('🔍 DEBUGGING PRODUCTION ENVIRONMENT VARIABLES...\n');

// Load environment variables
require('dotenv').config();

console.log('📋 ENVIRONMENT DETAILS:');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT: ${process.env.PORT}`);
console.log(`PWD: ${process.cwd()}`);

console.log('\n🔑 API KEYS STATUS:');
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ SET (' + process.env.OPENAI_API_KEY.substring(0, 20) + '...)' : '❌ NOT SET'}`);
console.log(`RAPIDAPI_KEY: ${process.env.RAPIDAPI_KEY ? '✅ SET (' + process.env.RAPIDAPI_KEY.substring(0, 10) + '...)' : '❌ NOT SET'}`);
console.log(`RAPIDAPI_KEY_NEW: ${process.env.RAPIDAPI_KEY_NEW ? '✅ SET (' + process.env.RAPIDAPI_KEY_NEW.substring(0, 10) + '...)' : '❌ NOT SET'}`);
console.log(`SHOPEE_SCRAPER_API_KEY: ${process.env.SHOPEE_SCRAPER_API_KEY ? '✅ SET (' + process.env.SHOPEE_SCRAPER_API_KEY.substring(0, 10) + '...)' : '❌ NOT SET'}`);

console.log('\n⚙️ API CONFIGURATION FLAGS:');
console.log(`USE_REAL_AMAZON_API: ${process.env.USE_REAL_AMAZON_API || 'undefined'}`);
console.log(`USE_REAL_SHOPEE_API: ${process.env.USE_REAL_SHOPEE_API || 'undefined'}`);
console.log(`USE_REAL_ALIEXPRESS_API: ${process.env.USE_REAL_ALIEXPRESS_API || 'undefined'}`);
console.log(`USE_REAL_MERCADOLIVRE_API: ${process.env.USE_REAL_MERCADOLIVRE_API || 'undefined'}`);

console.log('\n🚀 ADVANCED API FLAGS:');
console.log(`USE_LLAMA_API: ${process.env.USE_LLAMA_API || 'undefined'}`);
console.log(`USE_GOOGLE_SEARCH_API: ${process.env.USE_GOOGLE_SEARCH_API || 'undefined'}`);
console.log(`USE_BING_WEB_SEARCH_API: ${process.env.USE_BING_WEB_SEARCH_API || 'undefined'}`);
console.log(`USE_GOOGLE_MAPS_API: ${process.env.USE_GOOGLE_MAPS_API || 'undefined'}`);

console.log('\n📁 CHECKING .env FILES:');
const fs = require('fs');
const envFiles = ['.env', '.env.production', '.env.local'];

envFiles.forEach(file => {
  try {
    const fullPath = require('path').resolve(file);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${file} exists at: ${fullPath}`);
    } else {
      console.log(`❌ ${file} not found`);
    }
  } catch (error) {
    console.log(`❌ Error checking ${file}: ${error.message}`);
  }
});

console.log('\n📊 DIAGNOSIS:');
if (!process.env.USE_REAL_SHOPEE_API) {
  console.log('❌ PROBLEM: USE_REAL_SHOPEE_API is not set');
  console.log('💡 SOLUTION: Environment variables are not being loaded properly');
}

if (!process.env.SHOPEE_SCRAPER_API_KEY) {
  console.log('❌ PROBLEM: SHOPEE_SCRAPER_API_KEY is not set');
  console.log('💡 SOLUTION: API key is not being loaded from environment');
}

console.log('\n🔧 RECOMMENDED ACTIONS:');
console.log('1. Check if .env file is in the correct directory');
console.log('2. Verify environment variables are set in Vercel dashboard');
console.log('3. Restart the server after environment changes');
console.log('4. Check for any dotenv loading issues');

console.log('\n✅ DEBUG COMPLETE!');
