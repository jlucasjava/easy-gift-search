// Test script for new Bing Web Search and Google Maps APIs
require('dotenv').config();
const bingSearchService = require('./services/bingSearchService');
const googleMapsService = require('./services/googleMapsService');

console.log('🧪 TESTE DAS NOVAS APIs - Bing Web Search & Google Maps');
console.log('====================================================\n');

async function testeCompleto() {
  try {
    console.log('🔍 1. TESTE BING WEB SEARCH API');
    console.log('-'.repeat(40));
    
    // Teste 1: Busca web básica
    console.log('📝 Teste 1: Busca web básica');
    const buscaWeb = await bingSearchService.buscarWeb({
      query: 'presentes tecnologia 2025',
      mkt: 'pt-br',
      count: 5
    });
    console.log(`   ✅ Sucesso: ${buscaWeb.sucesso}`);
    console.log(`   📊 Resultados: ${buscaWeb.resultados?.length || 0}`);
    if (buscaWeb.resultados?.length > 0) {
      console.log(`   🔗 Primeiro: ${buscaWeb.resultados[0].titulo}`);
    }
    console.log('');

    // Teste 2: Busca de produtos específicos
    console.log('📝 Teste 2: Busca de produtos específicos');
    const buscaProdutos = await bingSearchService.buscarProdutos({
      produto: 'smartphone',
      categoria: 'eletrônicos',
      preco: '500-1000',
      marketplace: 'amazon.com.br'
    });
    console.log(`   ✅ Sucesso: ${buscaProdutos.sucesso}`);
    console.log(`   📊 Resultados: ${buscaProdutos.resultados?.length || 0}`);
    console.log('');

    // Teste 3: Recomendações baseadas em perfil
    console.log('📝 Teste 3: Recomendações baseadas em perfil');
    const recomendacoes = await bingSearchService.buscarRecomendacoes({
      idade: '25-35',
      genero: 'masculino',
      interesses: 'esportes tecnologia',
      orcamento: '200-500'
    });
    console.log(`   ✅ Sucesso: ${recomendacoes.sucesso}`);
    console.log(`   📊 Resultados: ${recomendacoes.resultados?.length || 0}`);
    console.log('');

    // Teste 4: Busca de tendências
    console.log('📝 Teste 4: Busca de tendências');
    const tendencias = await bingSearchService.buscarTendencias('presentes natal');
    console.log(`   ✅ Sucesso: ${tendencias.sucesso}`);
    console.log(`   📊 Resultados: ${tendencias.resultados?.length || 0}`);
    console.log('');

    console.log('🗺️ 2. TESTE GOOGLE MAPS API');
    console.log('-'.repeat(40));

    // Teste 5: Busca de localização
    console.log('📝 Teste 5: Busca de localização');
    const localizacao = await googleMapsService.buscarLocalizacao({
      text: 'Shopping Vila Lobos',
      place: 'São Paulo',
      city: 'São Paulo',
      country: 'Brasil'
    });
    console.log(`   ✅ Sucesso: ${localizacao.sucesso}`);
    console.log(`   📍 Local: ${localizacao.localizacao?.nome || 'N/A'}`);
    console.log(`   📍 Endereço: ${localizacao.localizacao?.endereco || 'N/A'}`);
    console.log('');

    // Teste 6: Busca de shopping centers
    console.log('📝 Teste 6: Busca de shopping centers');
    const shoppings = await googleMapsService.buscarShoppings({
      cidade: 'São Paulo',
      estado: 'SP'
    });
    console.log(`   ✅ Sucesso: ${shoppings.sucesso}`);
    console.log(`   🏬 Shopping: ${shoppings.localizacao?.nome || 'N/A'}`);
    console.log('');

    // Teste 7: Busca de lojas próximas
    console.log('📝 Teste 7: Busca de lojas próximas');
    const lojas = await googleMapsService.buscarLojasProximas({
      categoria: 'eletrônicos',
      cidade: 'São Paulo',
      latitude: '-23.5505',
      longitude: '-46.6333'
    });
    console.log(`   ✅ Sucesso: ${lojas.sucesso}`);
    console.log(`   🏪 Loja: ${lojas.localizacao?.nome || 'N/A'}`);
    console.log('');

    // Teste 8: Informações de entrega
    console.log('📝 Teste 8: Informações de entrega');
    const entrega = await googleMapsService.buscarInfoEntrega({
      cep: '01310-100',
      endereco: 'Avenida Paulista, 1000',
      cidade: 'São Paulo'
    });
    console.log(`   ✅ Sucesso: ${entrega.sucesso}`);
    console.log(`   📦 Entrega: ${entrega.entrega?.prazoEstimado || 'N/A'}`);
    console.log('');

    // Resumo final
    console.log('📊 RESUMO DOS TESTES');
    console.log('='.repeat(40));
    console.log('🔍 Bing Web Search API:');
    console.log(`   ✅ Busca Web: ${buscaWeb.sucesso ? 'OK' : 'FALHA'}`);
    console.log(`   ✅ Busca Produtos: ${buscaProdutos.sucesso ? 'OK' : 'FALHA'}`);
    console.log(`   ✅ Recomendações: ${recomendacoes.sucesso ? 'OK' : 'FALHA'}`);
    console.log(`   ✅ Tendências: ${tendencias.sucesso ? 'OK' : 'FALHA'}`);
    console.log('');
    console.log('🗺️ Google Maps API:');
    console.log(`   ✅ Localização: ${localizacao.sucesso ? 'OK' : 'FALHA'}`);
    console.log(`   ✅ Shoppings: ${shoppings.sucesso ? 'OK' : 'FALHA'}`);
    console.log(`   ✅ Lojas Próximas: ${lojas.sucesso ? 'OK' : 'FALHA'}`);
    console.log(`   ✅ Info Entrega: ${entrega.sucesso ? 'OK' : 'FALHA'}`);
    console.log('');

    const totalTestes = 8;
    const testesOK = [
      buscaWeb.sucesso,
      buscaProdutos.sucesso,
      recomendacoes.sucesso,
      tendencias.sucesso,
      localizacao.sucesso,
      shoppings.sucesso,
      lojas.sucesso,
      entrega.sucesso
    ].filter(Boolean).length;

    console.log(`🎯 RESULTADO FINAL: ${testesOK}/${totalTestes} testes passaram`);
    
    if (testesOK === totalTestes) {
      console.log('🎉 TODAS AS APIS FUNCIONANDO PERFEITAMENTE!');
    } else if (testesOK >= totalTestes * 0.5) {
      console.log('⚠️ ALGUMAS APIS COM PROBLEMAS, MAS FUNCIONAMENTO PARCIAL');
    } else {
      console.log('❌ PROBLEMAS CRÍTICOS DETECTADOS');
    }

    console.log('');
    console.log('📝 CONFIGURAÇÃO RECOMENDADA:');
    console.log('   - USE_BING_WEB_SEARCH_API=true');
    console.log('   - USE_GOOGLE_MAPS_API=true');
    console.log('   - RAPIDAPI_KEY_NEW configurada');
    console.log('');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar testes
testeCompleto().then(() => {
  console.log('✅ Testes concluídos!');
}).catch(error => {
  console.error('❌ Erro nos testes:', error.message);
});
