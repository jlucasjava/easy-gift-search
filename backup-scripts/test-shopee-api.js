// Test script for new Shopee Scraper API
require('dotenv').config();
const axios = require('axios');
const https = require('https');

// Configure HTTPS agent to handle SSL issues
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

async function testShopeeAPI() {
  console.log('🧪 Testing Shopee Scraper API...');
  console.log(`🔑 API Key available: ${process.env.SHOPEE_SCRAPER_API_KEY ? 'YES' : 'NO'}`);
  
  try {
    const shopeeUrl = "https://shopee.com.my/api/v4/pdp/get_pc?shop_id=12851682&item_id=187718196&detail_level=0";
    
    console.log('📡 Making API call...');
    console.log(`🌐 URL being sent: ${shopeeUrl}`);
      const response = await axios.post('https://shopee-scraper1.p.rapidapi.com/', {
      url: shopeeUrl
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'shopee-scraper1.p.rapidapi.com',
        'x-rapidapi-key': process.env.SHOPEE_SCRAPER_API_KEY
      },
      httpsAgent,
      timeout: 15000
    });

    console.log(`✅ Response received! Status: ${response.status}`);
    console.log('📦 Raw data (first 1000 chars):', JSON.stringify(response.data, null, 2).substring(0, 1000) + '...');
    
    if (response.data && response.data.data) {
      const item = response.data.data;
      console.log('✅ API Test SUCCESSFUL!');
      console.log(`📝 Product name: ${item.name || 'N/A'}`);
      console.log(`💰 Price: ${item.price ? (item.price / 100000) : 'N/A'}`);
      console.log(`🏪 Shop ID: ${item.shop_id || 'N/A'}`);
      console.log(`📦 Item ID: ${item.itemid || 'N/A'}`);
    } else {
      console.log('⚠️ API returned empty data');
    }
    
  } catch (error) {
    console.error('❌ API Test FAILED:', error.message);
    if (error.response) {
      console.error('📦 Error response:', error.response.data);
      console.error('📊 Status code:', error.response.status);
    }
  }
}

testShopeeAPI();
