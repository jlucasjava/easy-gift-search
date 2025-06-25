// Teste direto da API do Google Custom Search
require('dotenv').config();
const axios = require('axios');

async function testarAPIGoogle() {
  console.error('🧪 TESTE DIRETO DA API DO GOOGLE CUSTOM SEARCH');
  console.error('===============================================');
  
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;
  
  console.error(`🔑 API Key: ${apiKey ? '✅ Configurada' : '❌ Ausente'}`);
  console.error(`🔑 CX: ${cx ? '✅ Configurado' : '❌ Ausente'}`);
  
  if (!apiKey || !cx) {
    console.error('❌ Erro: Chaves de API não configuradas!');
    return;
  }
  
  try {
    console.error('\n🔍 Fazendo requisição direta para a API do Google...');
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=presentes`;
    console.error(`URL: ${url}`);
    
    const response = await axios.get(url);
    
    if (response.status === 200 && response.data) {
      console.error(`✅ API respondeu com sucesso (status ${response.status})`);
      console.error(`✅ Total de resultados: ${response.data.searchInformation?.totalResults || 0}`);
      
      if (response.data.items && response.data.items.length > 0) {
        console.error(`✅ Itens retornados: ${response.data.items.length}`);
        console.error('\n📋 PRIMEIRO RESULTADO:');
        const item = response.data.items[0];
        console.error(`🔤 Título: ${item.title}`);
        console.error(`🔗 Link: ${item.link}`);
        console.error(`📝 Snippet: ${item.snippet?.substring(0, 100)}...`);
      } else {
        console.error('⚠️ Nenhum item retornado pela API!');
      }
      
      console.error('\n🎯 CONCLUSÃO: API do Google está funcionando corretamente!');
      console.error('✅ O problema está na integração com a aplicação, não na API.');
    } else {
      console.error(`❌ Erro: API retornou status ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Erro ao chamar a API:', error.message);
    
    if (error.response) {
      console.error(`❌ Status: ${error.response.status}`);
      console.error(`❌ Dados:`, error.response.data);
    }
  }
}

testarAPIGoogle();

testarAPIGoogle();
