// teste-google-only.js - Teste da integração com Google Custom Search
require('dotenv').config();
const googleSearchService = require('./services/googleSearchService');

async function testarGoogleSearch() {
  console.log('🧪 TESTE DE INTEGRAÇÃO: GOOGLE CUSTOM SEARCH API');
  console.log('================================================');
  
  // Verificar configuração
  console.log('📋 VERIFICANDO CONFIGURAÇÃO:');
  console.log(`🔑 GOOGLE_SEARCH_API_KEY: ${process.env.GOOGLE_SEARCH_API_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log(`🔑 GOOGLE_SEARCH_CX: ${process.env.GOOGLE_SEARCH_CX ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`⚙️ USE_GOOGLE_SEARCH_API: ${process.env.USE_GOOGLE_SEARCH_API === 'true' ? '✅ Ativo' : '❌ Inativo'}`);
  
  // Testar a API
  try {
    console.log('\n📊 EXECUTANDO TESTE DA API:');
    const resultado = await googleSearchService.testarAPIsGoogle();
    
    console.log(`✅ Teste concluído: ${resultado.sucesso ? 'SUCESSO' : 'FALHA'}`);
    if (!resultado.sucesso) {
      console.log(`❌ Motivo: ${resultado.erro || 'Erro desconhecido'}`);
    } else {
      console.log(`🔍 Resultados encontrados: ${resultado.resultados || 0}`);
    }
    
    // Buscar um termo de teste
    if (resultado.sucesso) {
      console.log('\n🔎 TESTE DE BUSCA DE PRODUTOS:');
      const termoBusca = 'presentes para crianças';
      console.log(`🔍 Buscando: "${termoBusca}"`);
      
      const resultadoBusca = await googleSearchService.buscarPresentesGoogle({ 
        categoria: termoBusca 
      });
      
      console.log(`✅ Busca concluída: ${resultadoBusca.sucesso ? 'SUCESSO' : 'FALHA'}`);
      console.log(`📊 Total de resultados: ${resultadoBusca.produtos?.length || 0}`);
      
      if (resultadoBusca.produtos?.length > 0) {
        console.log('\n📦 EXEMPLO DE PRODUTO:');
        const produto = resultadoBusca.produtos[0];
        console.log(`🏷️ Nome: ${produto.nome}`);
        console.log(`💰 Preço: ${produto.preco}`);
        console.log(`🔗 URL: ${produto.url}`);
      }
    }
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
  }
  
  console.log('\n================================================');
  console.log('🏁 TESTE FINALIZADO');
  console.log('================================================');
}

// Executar o teste
testarGoogleSearch();
