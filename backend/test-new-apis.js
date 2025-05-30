
const axios = require('axios');
require('dotenv').config();

/**
 * Script de teste para as novas APIs integradas:
 * - Llama AI (Open AI 21)
 * - Google Search APIs (2 versões)
 * - AliExpress DataHub API
 */

const BASE_URL = 'http://localhost:3000/api/new-apis';

console.log('🚀 TESTE DAS NOVAS APIS - EASY GIFT SEARCH');
console.log('============================================');

async function testarTodasAPIs() {
  try {
    console.log('\n📋 1. TESTANDO INFORMAÇÕES GERAIS...');
    const info = await axios.get(`${BASE_URL}/info`);
    console.log('✅ Status das APIs:', JSON.stringify(info.data.configuracao, null, 2));

    console.log('\n🧪 2. TESTANDO TODAS AS APIS...');
    const testeGeral = await axios.get(`${BASE_URL}/teste-todas`);
    console.log('📊 Resultado geral:', testeGeral.data.resumo);
    
    if (testeGeral.data.testes.llama_ai.sucesso) {
      console.log('✅ Llama AI: FUNCIONANDO');
    } else {
      console.log('❌ Llama AI: FALHA -', testeGeral.data.testes.llama_ai.erro);
    }

    if (testeGeral.data.testes.google_search.sucesso) {
      console.log('✅ Google Search: FUNCIONANDO');
      console.log('  - API v1:', testeGeral.data.testes.google_search.apis.googleAPI1.sucesso ? 'OK' : 'FALHA');
      console.log('  - API v2:', testeGeral.data.testes.google_search.apis.googleAPI2.sucesso ? 'OK' : 'FALHA');
    } else {
      console.log('❌ Google Search: FALHA');
    }

    if (testeGeral.data.testes.aliexpress.sucesso) {
      console.log('✅ AliExpress: FUNCIONANDO');
    } else {
      console.log('❌ AliExpress: FALHA -', testeGeral.data.testes.aliexpress.erro);
    }

    console.log('\n🦙 3. TESTANDO LLAMA AI - RECOMENDAÇÃO...');
    try {
      const recomendacao = await axios.post(`${BASE_URL}/llama/recomendacao`, {
        message: "Preciso de sugestões de presentes para uma pessoa de 25 anos que gosta de jogos e tecnologia",
        webAccess: false
      });
      console.log('✅ Recomendação Llama:', recomendacao.data.sucesso ? 'SUCESSO' : 'FALHA');
      if (recomendacao.data.resposta?.choices?.[0]?.message?.content) {
        console.log('💬 Resposta:', recomendacao.data.resposta.choices[0].message.content.substring(0, 150) + '...');
      }
    } catch (error) {
      console.log('❌ Erro na recomendação Llama:', error.response?.data?.erro || error.message);
    }

    console.log('\n🎁 4. TESTANDO LLAMA AI - SUGESTÕES DE PRESENTES...');
    try {
      const sugestoes = await axios.post(`${BASE_URL}/llama/sugestoes`, {
        idade: "30",
        genero: "feminino",
        interesses: "culinária e leitura",
        orcamento: 150
      });
      console.log('✅ Sugestões Llama:', sugestoes.data.sucesso ? 'SUCESSO' : 'FALHA');
      if (sugestoes.data.resposta?.choices?.[0]?.message?.content) {
        console.log('💡 Sugestões:', sugestoes.data.resposta.choices[0].message.content.substring(0, 150) + '...');
      }
    } catch (error) {
      console.log('❌ Erro nas sugestões Llama:', error.response?.data?.erro || error.message);
    }

    console.log('\n🔍 5. TESTANDO GOOGLE SEARCH - BUSCA INTEGRADA...');
    try {
      const googleBusca = await axios.get(`${BASE_URL}/google/buscar?query=presentes tecnologia&api=both`);
      console.log('✅ Google Search:', googleBusca.data.sucesso ? 'SUCESSO' : 'FALHA');
      console.log(`📊 Resultados encontrados: ${googleBusca.data.totalResultados || 0}`);
      if (googleBusca.data.resultados?.length > 0) {
        console.log('🔗 Primeiro resultado:', googleBusca.data.resultados[0].titulo.substring(0, 100) + '...');
      }
    } catch (error) {
      console.log('❌ Erro no Google Search:', error.response?.data?.erro || error.message);
    }

    console.log('\n🛒 6. TESTANDO ALIEXPRESS - DETALHES DE PRODUTO...');
    try {
      const aliexpress = await axios.get(`${BASE_URL}/aliexpress/detalhes/1005005244562338`);
      console.log('✅ AliExpress:', aliexpress.data.sucesso ? 'SUCESSO' : 'FALHA');
      if (aliexpress.data.produto) {
        console.log('📱 Produto:', aliexpress.data.produto.nome?.substring(0, 100) + '...');
        console.log('💰 Preço:', `R$ ${aliexpress.data.produto.preco}`);
        console.log('⭐ Rating:', aliexpress.data.produto.rating);
      }
    } catch (error) {
      console.log('❌ Erro no AliExpress:', error.response?.data?.erro || error.message);
    }

    console.log('\n🔄 7. TESTANDO BUSCA INTEGRADA...');
    try {
      const buscaIntegrada = await axios.get(`${BASE_URL}/busca-integrada?query=smartphone&categoria=eletrônicos&idade=25&genero=unissex&orcamento=300`);
      console.log('✅ Busca Integrada:', buscaIntegrada.data.sucesso ? 'SUCESSO' : 'FALHA');
      console.log('📊 Fontes ativas:', buscaIntegrada.data.estatisticas.fontes_ativas.join(', '));
      console.log('🔍 Google:', buscaIntegrada.data.dados.busca_google.total_resultados || 0, 'resultados');
      console.log('🤖 IA:', buscaIntegrada.data.dados.recomendacao_ia.sucesso ? 'Recomendação gerada' : 'Falha na IA');
    } catch (error) {
      console.log('❌ Erro na busca integrada:', error.response?.data?.erro || error.message);
    }

    console.log('\n🎯 8. TESTANDO DEMONSTRAÇÕES...');
    try {
      const demoLlama = await axios.get(`${BASE_URL}/demo/llama`);
      console.log('✅ Demo Llama:', demoLlama.data?.sucesso ? 'SUCESSO' : 'FALHA');
      
      const demoGoogle = await axios.get(`${BASE_URL}/demo/google`);
      console.log('✅ Demo Google:', demoGoogle.data?.sucesso ? 'SUCESSO' : 'FALHA');
      
      const demoAliExpress = await axios.get(`${BASE_URL}/demo/aliexpress`);
      console.log('✅ Demo AliExpress:', demoAliExpress.data?.sucesso ? 'SUCESSO' : 'FALHA');
    } catch (error) {
      console.log('❌ Erro nas demonstrações:', error.response?.data?.erro || error.message);
    }

    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('====================');
    console.log('📈 Status Final das APIs:');
    console.log(`- Total APIs testadas: 4`);
    console.log(`- APIs funcionando: ${testeGeral.data.resumo.apis_funcionando.length}`);
    console.log(`- Status geral: ${testeGeral.data.resumo.status_geral}`);
    console.log('\n🔗 Endpoints disponíveis:');
    console.log('- GET /api/new-apis/info');
    console.log('- GET /api/new-apis/teste-todas');
    console.log('- POST /api/new-apis/llama/recomendacao');
    console.log('- POST /api/new-apis/llama/sugestoes');
    console.log('- GET /api/new-apis/google/buscar');
    console.log('- GET /api/new-apis/aliexpress/detalhes/:itemId');
    console.log('- GET /api/new-apis/busca-integrada');

  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Dica: Certifique-se de que o servidor está rodando na porta 3000');
      console.log('Execute: npm start ou node server.js');
    }
  }
}

// Executar teste se o script for chamado diretamente
if (require.main === module) {
  console.log('🔧 Configuração:');
  console.log('- RAPIDAPI_KEY_NEW:', process.env.RAPIDAPI_KEY_NEW ? '✅ Configurada' : '❌ Não configurada');
  console.log('- USE_LLAMA_API:', process.env.USE_LLAMA_API);
  console.log('- USE_GOOGLE_SEARCH_API:', process.env.USE_GOOGLE_SEARCH_API);
  console.log('- USE_ALIEXPRESS_DATAHUB_API:', process.env.USE_ALIEXPRESS_DATAHUB_API);
  console.log('');
  
  testarTodasAPIs();
}

module.exports = { testarTodasAPIs };
