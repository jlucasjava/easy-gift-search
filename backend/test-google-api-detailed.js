// test-google-api-detailed.js
require('dotenv').config();
const axios = require('axios');

async function testGoogleAPI() {
  console.log('🔍 Testando API do Google Custom Search com detalhes do erro...');
  console.log(`GOOGLE_SEARCH_API_KEY: ${process.env.GOOGLE_SEARCH_API_KEY ? 'Configurada' : 'Não configurada'}`);
  console.log(`GOOGLE_SEARCH_CX: ${process.env.GOOGLE_SEARCH_CX ? 'Configurado' : 'Não configurado'}`);
  
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: process.env.GOOGLE_SEARCH_API_KEY,
        cx: process.env.GOOGLE_SEARCH_CX,
        q: 'teste simples',
        num: 1
      }
    });
    
    console.log('✅ API respondeu com sucesso!');
    console.log(`Status: ${response.status}`);
    console.log(`Total de resultados: ${response.data.searchInformation?.totalResults || 'N/A'}`);
    return true;
  } catch (error) {
    console.log('❌ Erro na requisição:');
    console.log(`Status: ${error.response?.status || 'N/A'}`);
    console.log(`Mensagem: ${error.message}`);
    
    if (error.response?.data) {
      console.log('\nDetalhes do erro:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.response?.status === 403) {
      console.log('\n🔑 SUGESTÕES PARA ERRO 403:');
      console.log('1. A chave da API pode não estar ativa');
      console.log('2. Você pode ter excedido a cota diária (100 consultas/dia no plano gratuito)');
      console.log('3. A Custom Search API pode não estar habilitada no seu projeto do Google Cloud');
      console.log('4. Sua chave de API pode ter restrições que impedem seu uso');
    }
    
    return false;
  }
}

testGoogleAPI();
