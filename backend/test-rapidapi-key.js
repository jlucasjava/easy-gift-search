// Test RapidAPI Key Configuration
require('dotenv').config();

console.log('=== TESTE DE CONFIGURAÇÃO DAS CHAVES RAPIDAPI ===');
console.log('');

console.log('1. VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE:');
console.log('RAPIDAPI_KEY_NEW exists:', !!process.env.RAPIDAPI_KEY_NEW);
console.log('RAPIDAPI_KEY_NEW length:', process.env.RAPIDAPI_KEY_NEW ? process.env.RAPIDAPI_KEY_NEW.length : 'undefined');
console.log('RAPIDAPI_KEY_NEW preview:', process.env.RAPIDAPI_KEY_NEW ? process.env.RAPIDAPI_KEY_NEW.substring(0, 15) + '...' : 'undefined');
console.log('');

console.log('2. VERIFICAÇÃO DE FLAGS DE ATIVAÇÃO:');
console.log('USE_LLAMA_API:', process.env.USE_LLAMA_API);
console.log('USE_GOOGLE_SEARCH_API:', process.env.USE_GOOGLE_SEARCH_API);
console.log('USE_ALIEXPRESS_DATAHUB_API:', process.env.USE_ALIEXPRESS_DATAHUB_API);
console.log('USE_BING_WEB_SEARCH_API:', process.env.USE_BING_WEB_SEARCH_API);
console.log('USE_GOOGLE_MAPS_API:', process.env.USE_GOOGLE_MAPS_API);
console.log('');

console.log('3. TESTE DIRETO DA API LLAMA:');

const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

async function testeLlamaAPI() {
  try {
    const requestConfig = {
      method: 'POST',
      url: 'https://open-ai21.p.rapidapi.com/conversationllama',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'open-ai21.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY_NEW
      },
      data: {
        messages: [
          {
            role: "user",
            content: "Hello, this is a test message"
          }
        ],
        web_access: false
      },
      timeout: 10000,
      httpsAgent
    };

    console.log('🦙 Fazendo requisição para Llama API...');
    console.log('URL:', requestConfig.url);
    console.log('Headers:', JSON.stringify(requestConfig.headers, null, 2));
    
    const response = await axios(requestConfig);
    
    console.log('✅ SUCESSO! Resposta recebida da API:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ ERRO na API:');
    console.log('Message:', error.message);
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    
    if (error.response?.status === 403) {
      console.log('🚨 ERRO 403: Chave da API inválida ou sem permissão');
    } else if (error.response?.status === 401) {
      console.log('🚨 ERRO 401: Não autorizado - verifique a chave da API');
    } else if (error.response?.status === 429) {
      console.log('🚨 ERRO 429: Limite de rate excedido');
    }
  }
}

testeLlamaAPI();
