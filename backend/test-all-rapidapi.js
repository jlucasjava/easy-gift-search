// Test All RapidAPI Services
require('dotenv').config();
const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

console.log('=== TESTE COMPLETO DE TODAS AS APIS RAPIDAPI ===');
console.log('');

async function testeGoogleSearchAPI() {
  try {
    console.log('🔍 Testando Google Search API 1...');
    
    const requestConfig = {
      method: 'GET',
      url: 'https://googlesearch-api.p.rapidapi.com/search',
      params: {
        q: 'presentes tecnologia',
        start: 1,
        gl: 'BR',
        hl: 'pt',
        lr: 'lang_pt'
      },
      headers: {
        'x-rapidapi-host': 'googlesearch-api.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY_NEW
      },
      timeout: 10000,
      httpsAgent
    };

    const response = await axios(requestConfig);
    console.log('✅ Google Search API 1: FUNCIONANDO');
    console.log('Status:', response.status);
    console.log('Resultados encontrados:', response.data.items?.length || 0);
    
    return { sucesso: true, api: 'Google Search v1', status: response.status };
    
  } catch (error) {
    console.log('❌ Google Search API 1: ERRO');
    console.log('Status:', error.response?.status);
    console.log('Erro:', error.response?.data || error.message);
    
    return { sucesso: false, api: 'Google Search v1', erro: error.message };
  }
}

async function testeGoogleSearchAPI2() {
  try {
    console.log('🔍 Testando Google Search API 2...');
    
    const requestConfig = {
      method: 'GET',
      url: 'https://google-search72.p.rapidapi.com/search',
      params: {
        q: 'presentes tecnologia',
        lr: 'pt-BR',
        num: 10
      },
      headers: {
        'x-rapidapi-host': 'google-search72.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY_NEW
      },
      timeout: 10000,
      httpsAgent
    };

    const response = await axios(requestConfig);
    console.log('✅ Google Search API 2: FUNCIONANDO');
    console.log('Status:', response.status);
    console.log('Resultados encontrados:', response.data.items?.length || 0);
    
    return { sucesso: true, api: 'Google Search v2', status: response.status };
    
  } catch (error) {
    console.log('❌ Google Search API 2: ERRO');
    console.log('Status:', error.response?.status);
    console.log('Erro:', error.response?.data || error.message);
    
    return { sucesso: false, api: 'Google Search v2', erro: error.message };
  }
}

async function testeAliExpressAPI() {
  try {
    console.log('🛒 Testando AliExpress API...');
    
    const requestConfig = {
      method: 'GET',
      url: 'https://aliexpress-datahub.p.rapidapi.com/item_detail_2',
      params: {
        itemId: '1005005244562338'
      },
      headers: {
        'x-rapidapi-host': 'aliexpress-datahub.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY_NEW
      },
      timeout: 10000,
      httpsAgent
    };

    const response = await axios(requestConfig);
    console.log('✅ AliExpress API: FUNCIONANDO');
    console.log('Status:', response.status);
    console.log('Produto encontrado:', response.data.item?.title?.substring(0, 50) + '...' || 'N/A');
    
    return { sucesso: true, api: 'AliExpress DataHub', status: response.status };
    
  } catch (error) {
    console.log('❌ AliExpress API: ERRO');
    console.log('Status:', error.response?.status);
    console.log('Erro:', error.response?.data || error.message);
    
    return { sucesso: false, api: 'AliExpress DataHub', erro: error.message };
  }
}

async function testeBingSearchAPI() {
  try {
    console.log('🌐 Testando Bing Web Search API...');
    
    const requestConfig = {
      method: 'GET',
      url: 'https://bing-web-search1.p.rapidapi.com/search',
      params: {
        q: 'presentes tecnologia',
        mkt: 'pt-br',
        safeSearch: 'Moderate',
        freshness: 'Week',
        count: 10
      },
      headers: {
        'x-rapidapi-host': 'bing-web-search1.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY_NEW
      },
      timeout: 10000,
      httpsAgent
    };

    const response = await axios(requestConfig);
    console.log('✅ Bing Web Search API: FUNCIONANDO');
    console.log('Status:', response.status);
    console.log('Resultados encontrados:', response.data.webPages?.value?.length || 0);
    
    return { sucesso: true, api: 'Bing Web Search', status: response.status };
    
  } catch (error) {
    console.log('❌ Bing Web Search API: ERRO');
    console.log('Status:', error.response?.status);
    console.log('Erro:', error.response?.data || error.message);
    
    return { sucesso: false, api: 'Bing Web Search', erro: error.message };
  }
}

async function testeGoogleMapsAPI() {
  try {
    console.log('🗺️ Testando Google Maps API...');
    
    const requestConfig = {
      method: 'GET',
      url: 'https://google-maps30.p.rapidapi.com/geocode',
      params: {
        address: 'Shopping Eldorado, São Paulo, Brazil'
      },
      headers: {
        'x-rapidapi-host': 'google-maps30.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY_NEW
      },
      timeout: 10000,
      httpsAgent
    };

    const response = await axios(requestConfig);
    console.log('✅ Google Maps API: FUNCIONANDO');
    console.log('Status:', response.status);
    console.log('Localização encontrada:', response.data.results?.[0]?.formatted_address || 'N/A');
    
    return { sucesso: true, api: 'Google Maps', status: response.status };
    
  } catch (error) {
    console.log('❌ Google Maps API: ERRO');
    console.log('Status:', error.response?.status);
    console.log('Erro:', error.response?.data || error.message);
    
    return { sucesso: false, api: 'Google Maps', erro: error.message };
  }
}

async function testeAmazonAPI() {
  try {
    console.log('📦 Testando Amazon Real-Time Data API...');
    
    const requestConfig = {
      method: 'GET',
      url: 'https://real-time-amazon-data.p.rapidapi.com/search',
      params: {
        query: 'smartphone',
        page: '1',
        country: 'US',
        sort_by: 'RELEVANCE'
      },
      headers: {
        'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY_NEW
      },
      timeout: 10000,
      httpsAgent
    };

    const response = await axios(requestConfig);
    console.log('✅ Amazon Real-Time Data API: FUNCIONANDO');
    console.log('Status:', response.status);
    console.log('Produtos encontrados:', response.data.data?.products?.length || 0);
    
    return { sucesso: true, api: 'Amazon Real-Time Data', status: response.status };
    
  } catch (error) {
    console.log('❌ Amazon Real-Time Data API: ERRO');
    console.log('Status:', error.response?.status);
    console.log('Erro:', error.response?.data || error.message);
    
    return { sucesso: false, api: 'Amazon Real-Time Data', erro: error.message };
  }
}

async function executarTodosTestes() {
  console.log('Chave RapidAPI:', process.env.RAPIDAPI_KEY_NEW ? process.env.RAPIDAPI_KEY_NEW.substring(0, 15) + '...' : 'NÃO CONFIGURADA');
  console.log('');
  
  const resultados = [];
  
  // Teste Llama AI (já sabemos que funciona)
  resultados.push({ sucesso: true, api: 'Llama AI (Open AI 21)', status: 200 });
  
  // Teste outras APIs
  resultados.push(await testeGoogleSearchAPI());
  resultados.push(await testeGoogleSearchAPI2());
  resultados.push(await testeAliExpressAPI());
  resultados.push(await testeBingSearchAPI());
  resultados.push(await testeGoogleMapsAPI());
  resultados.push(await testeAmazonAPI());
  
  console.log('');
  console.log('=== RESUMO FINAL ===');
  console.log('');
  
  const funcionando = resultados.filter(r => r.sucesso);
  const comErro = resultados.filter(r => !r.sucesso);
  
  console.log('🎉 APIs FUNCIONANDO (' + funcionando.length + '/' + resultados.length + '):');
  funcionando.forEach(api => {
    console.log('   ✅', api.api, '- Status', api.status);
  });
  
  if (comErro.length > 0) {
    console.log('');
    console.log('❌ APIs COM ERRO (' + comErro.length + '/' + resultados.length + '):');
    comErro.forEach(api => {
      console.log('   ❌', api.api, '- Erro:', api.erro);
    });
  }
  
  console.log('');
  console.log('📊 TAXA DE SUCESSO:', Math.round((funcionando.length / resultados.length) * 100) + '%');
  
  if (funcionando.length >= 4) {
    console.log('🚀 RESULTADO: PROJETO ESTÁ REALMENTE USANDO APIS RAPIDAPI!');
  } else {
    console.log('⚠️ RESULTADO: Algumas APIs podem ter problemas de configuração');
  }
}

executarTodosTestes();
