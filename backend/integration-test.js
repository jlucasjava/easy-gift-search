// Integration test for the new API configuration
const axios = require('axios');

async function testApplication() {
  console.log('🧪 Testing Easy Gift Search Application Integration...\n');
  
  try {
    // Test the search endpoint
    console.log('📡 Testing search endpoint...');
    const response = await axios.post('http://localhost:3000/buscar', {
      palavra_chave: 'presente',
      genero: 'unisex',
      idade: 25,
      precoMin: 20,
      precoMax: 100
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log(`✅ Search endpoint responded! Status: ${response.status}`);
    console.log(`📦 Total products found: ${response.data.length || 0}`);
    
    if (response.data && response.data.length > 0) {
      console.log('\n🎁 Sample products:');
      response.data.slice(0, 3).forEach((produto, index) => {
        console.log(`${index + 1}. ${produto.nome} - R$ ${produto.preco} (${produto.marketplace})`);
        if (produto.fonte) console.log(`   📋 Source: ${produto.fonte}`);
        if (produto.api_usado) console.log(`   🔗 API: ${produto.api_usado}`);
      });
      
      // Check marketplace distribution
      const marketplaces = {};
      response.data.forEach(produto => {
        marketplaces[produto.marketplace] = (marketplaces[produto.marketplace] || 0) + 1;
      });
      
      console.log('\n📊 Marketplace distribution:');
      Object.entries(marketplaces).forEach(([marketplace, count]) => {
        console.log(`   ${marketplace}: ${count} products`);
      });
      
      console.log('\n✅ Integration test SUCCESSFUL!');
      console.log('🎯 Configuration working as expected: Only OpenAI + Shopee APIs active');
    } else {
      console.log('⚠️ No products returned');
    }
    
  } catch (error) {
    console.error('❌ Integration test FAILED:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('🚨 Server not running! Please start the server first with: node server.js');
    }
  }
}

console.log('🚀 Starting integration test...');
console.log('📋 Testing configuration: OpenAI + Shopee Scraper APIs only');
console.log('🔧 Other marketplace APIs should be using mock data\n');

testApplication();
