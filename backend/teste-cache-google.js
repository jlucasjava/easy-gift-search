// teste-cache-google.js - Teste do sistema de cache para Google Custom Search
require('dotenv').config();
const googleSearchService = require('./services/googleSearchService');

async function testarCacheGoogleSearch() {
  console.log('🧪 TESTE DE CACHE: GOOGLE CUSTOM SEARCH API');
  console.log('============================================');
  
  // Consulta de teste
  const queryTeste = 'presentes para aniversário';
  
  // Primeira busca (deve acessar a API)
  console.log('\n📊 TESTE #1: Primeira busca (deve acessar a API)');
  console.time('Primeira busca');
  const resultados1 = await googleSearchService.searchGoogle(queryTeste, 5);
  console.timeEnd('Primeira busca');
  console.log(`✅ Resultados encontrados: ${resultados1.length}`);
  
  // Segunda busca (deve usar cache)
  console.log('\n📊 TESTE #2: Segunda busca (deve usar cache)');
  console.time('Segunda busca');
  const resultados2 = await googleSearchService.searchGoogle(queryTeste, 5);
  console.timeEnd('Segunda busca');
  console.log(`✅ Resultados encontrados: ${resultados2.length}`);
  
  // Estatísticas do cache
  console.log('\n📊 ESTATÍSTICAS DO CACHE:');
  const stats = googleSearchService.getCacheStats();
  console.log(`📦 Total de itens em cache: ${stats.itemCount}`);
  console.log(`🔑 Chaves em cache: ${stats.keys.join(', ')}`);
  console.log(`📈 Estatísticas: ${JSON.stringify(stats.stats)}`);
  
  // Teste com parâmetros diferentes (nova entrada no cache)
  console.log('\n📊 TESTE #3: Busca com parâmetros diferentes');
  console.time('Busca com outros parâmetros');
  const resultados3 = await googleSearchService.searchGoogle(`${queryTeste} crianças`, 5);
  console.timeEnd('Busca com outros parâmetros');
  console.log(`✅ Resultados encontrados: ${resultados3.length}`);
  
  // Estatísticas atualizadas
  const statsAtualizadas = googleSearchService.getCacheStats();
  console.log(`📦 Total de itens em cache atualizado: ${statsAtualizadas.itemCount}`);
  
  // Limpar cache
  console.log('\n🧹 LIMPANDO CACHE...');
  const itemsRemovidos = googleSearchService.clearCache();
  console.log(`✅ Items removidos do cache: ${itemsRemovidos}`);
  
  // Verificar se o cache está vazio
  const statsFinal = googleSearchService.getCacheStats();
  console.log(`📦 Total de itens em cache após limpeza: ${statsFinal.itemCount}`);
  
  console.log('\n============================================');
  console.log('🏁 TESTE DE CACHE FINALIZADO');
  console.log('============================================');
}

// Executar o teste
testarCacheGoogleSearch();
