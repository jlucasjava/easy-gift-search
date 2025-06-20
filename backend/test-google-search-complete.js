/**
 * Teste Completo da API Google Custom Search
 * 
 * Este script substitui os testes individuais de APIs que foram removidas do projeto.
 * Ele testa todas as funcionalidades relacionadas ao Google Custom Search:
 * - Verificação da configuração das variáveis de ambiente
 * - Teste básico de conexão com a API
 * - Teste de busca com diferentes parâmetros
 * - Teste de formatação de resultados
 */

require('dotenv').config();
const googleSearchService = require('./services/googleSearchService');
const axios = require('axios');

// Função para formatar resultados como tabela
function formatResultTable(results) {
  if (!results || results.length === 0) {
    return 'Nenhum resultado encontrado';
  }

  console.log(`\n📊 Resultados encontrados: ${results.length}`);
  console.log('---------------------------------------------------------------');
  console.log('| TÍTULO                       | PREÇO     | FONTE           |');
  console.log('---------------------------------------------------------------');
  
  results.slice(0, 3).forEach(item => {
    const title = item.nome ? item.nome.substring(0, 25).padEnd(25) : 'N/A'.padEnd(25);
    const price = item.preco ? item.preco.padEnd(9) : 'N/A'.padEnd(9);
    const source = (item.marketplace || 'Google').padEnd(15);
    console.log(`| ${title} | ${price} | ${source} |`);
  });
  
  console.log('---------------------------------------------------------------');
  if (results.length > 3) {
    console.log(`   ... e mais ${results.length - 3} resultados`);
  }
}

// Testes principais
async function runTests() {
  console.log('🧪 TESTES COMPLETOS - GOOGLE CUSTOM SEARCH API');
  console.log('==============================================');
  console.log('📅 Data:', new Date().toLocaleString());
  console.log('🌐 Ambiente:', process.env.NODE_ENV || 'development');
  
  // 1. Verificar configuração
  console.log('\n1️⃣ VERIFICANDO CONFIGURAÇÃO');
  console.log('--------------------------');
  const configOk = process.env.GOOGLE_SEARCH_API_KEY && 
                    process.env.GOOGLE_SEARCH_CX && 
                    process.env.USE_GOOGLE_SEARCH_API === 'true';
  
  console.log(`USE_GOOGLE_SEARCH_API: ${process.env.USE_GOOGLE_SEARCH_API === 'true' ? '✅' : '❌'}`);
  console.log(`GOOGLE_SEARCH_API_KEY: ${process.env.GOOGLE_SEARCH_API_KEY ? '✅' : '❌'}`);
  console.log(`GOOGLE_SEARCH_CX: ${process.env.GOOGLE_SEARCH_CX ? '✅' : '❌'}`);
  console.log(`Status geral: ${configOk ? '✅ OK' : '❌ CONFIGURAÇÃO INCOMPLETA'}`);
  
  if (!configOk) {
    console.log('\n⚠️ AVISO: Configuração incompleta. Os testes podem falhar.');
    console.log('Configure as variáveis de ambiente antes de executar os testes.');
  }
  
  // 2. Teste do serviço direto
  console.log('\n2️⃣ TESTANDO SERVIÇO GOOGLE SEARCH');
  console.log('--------------------------------');
  try {
    const testResult = await googleSearchService.testarAPIsGoogle();
    console.log(`Resultado: ${testResult.sucesso ? '✅ SUCESSO' : '❌ FALHA'}`);
    if (!testResult.sucesso) {
      console.log(`Erro: ${testResult.erro || 'Desconhecido'}`);
    }
  } catch (error) {
    console.log('❌ ERRO:', error.message);
  }
  
  // 3. Teste de busca básica
  console.log('\n3️⃣ TESTE DE BUSCA BÁSICA');
  console.log('------------------------');
  try {
    const searchTerm = 'presentes tecnologia';
    console.log(`Buscando: "${searchTerm}"`);
    
    const results = await googleSearchService.buscarPresentesGoogle({ categoria: searchTerm });
    console.log(`Status: ${results.sucesso ? '✅ SUCESSO' : '❌ FALHA'}`);
    formatResultTable(results.produtos);
  } catch (error) {
    console.log('❌ ERRO:', error.message);
  }
  
  // 4. Teste de busca com filtros
  console.log('\n4️⃣ TESTE DE BUSCA COM FILTROS');
  console.log('----------------------------');
  try {
    const filtros = {
      categoria: 'presente',
      genero: 'masculino',
      idade: '30',
      precoMax: 200
    };
    
    console.log('Filtros aplicados:');
    console.log(JSON.stringify(filtros, null, 2));
    
    const results = await googleSearchService.buscarPresentesGoogle(filtros);
    console.log(`Status: ${results.sucesso ? '✅ SUCESSO' : '❌ FALHA'}`);
    formatResultTable(results.produtos);
  } catch (error) {
    console.log('❌ ERRO:', error.message);
  }
  
  // 5. Teste dos endpoints da API
  console.log('\n5️⃣ TESTANDO ENDPOINTS DA API');
  console.log('---------------------------');
  
  // Configuração para testes locais
  const baseUrl = 'http://localhost:3000/api';
  
  try {
    console.log('\n• Testando /api/new-apis/teste-todas');
    try {
      const response = await axios.get(`${baseUrl}/new-apis/teste-todas`);
      console.log(`Status: ${response.status === 200 ? '✅ OK' : '❌ ERRO'}`);
      console.log(`Google API Status: ${response.data.google?.sucesso ? '✅ OPERACIONAL' : '❌ FALHA'}`);
    } catch (error) {
      console.log('❌ ERRO:', error.message);
    }
    
    console.log('\n• Testando /api/new-apis/google/buscar');
    try {
      const response = await axios.get(`${baseUrl}/new-apis/google/buscar?query=presentes`);
      console.log(`Status: ${response.status === 200 ? '✅ OK' : '❌ ERRO'}`);
      console.log(`Resultados: ${response.data.produtos?.length || 0}`);
    } catch (error) {
      console.log('❌ ERRO:', error.message);
    }
    
    console.log('\n• Testando /api/new-apis/busca-integrada');
    try {
      const response = await axios.get(`${baseUrl}/new-apis/busca-integrada?query=presentes&genero=feminino`);
      console.log(`Status: ${response.status === 200 ? '✅ OK' : '❌ ERRO'}`);
      console.log(`Resultados: ${response.data.produtos?.length || 0}`);
    } catch (error) {
      console.log('❌ ERRO:', error.message);
    }
    
    console.log('\n• Testando /api/products');
    try {
      const response = await axios.get(`${baseUrl}/products?query=eletrônicos`);
      console.log(`Status: ${response.status === 200 ? '✅ OK' : '❌ ERRO'}`);
      console.log(`Resultados: ${response.data.produtos?.length || 0}`);
    } catch (error) {
      console.log('❌ ERRO:', error.message);
    }
    
  } catch (error) {
    console.log('❌ ERRO GERAL NOS TESTES HTTP:', error.message);
    console.log('⚠️ Certifique-se de que o servidor está rodando na porta 3000');
  }

  console.log('\n==============================================');
  console.log('🏁 TESTES CONCLUÍDOS');
  console.log('==============================================');
}

// Executar os testes
runTests().catch(error => {
  console.error('❌ ERRO FATAL:', error);
});
