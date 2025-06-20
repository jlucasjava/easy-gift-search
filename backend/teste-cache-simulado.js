// teste-cache-simulado.js - Teste de simulação do sistema de cache
const NodeCache = require('node-cache');

// Criação do cache com TTL de 60 segundos para facilitar o teste
const cache = new NodeCache({ stdTTL: 60, checkperiod: 10 });

// Função que simula uma chamada de API lenta
async function simulateAPICall(query) {
    console.log(`🔍 Simulando chamada de API para: "${query}"`);
    
    // Simular um delay para representar uma chamada de API (2 segundos)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Retornar dados simulados
    return {
        items: [
            { id: 1, title: `Resultado 1 para ${query}`, price: 'R$ 99,90' },
            { id: 2, title: `Resultado 2 para ${query}`, price: 'R$ 149,90' },
            { id: 3, title: `Resultado 3 para ${query}`, price: 'R$ 199,90' }
        ],
        totalResults: 3,
        query: query,
        timestamp: new Date().toISOString()
    };
}

// Função com cache
async function searchWithCache(query) {
    // Gerar chave de cache
    const cacheKey = `search_${query}`;
    
    // Verificar se existe no cache
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
        console.log(`🔄 Usando resultado em cache para: "${query}"`);
        return { ...cachedResult, fromCache: true };
    }
    
    // Se não existe no cache, chamar a API
    console.time('API Call');
    const result = await simulateAPICall(query);
    console.timeEnd('API Call');
    
    // Armazenar no cache
    cache.set(cacheKey, result);
    console.log(`💾 Resultado armazenado em cache para: "${query}"`);
    
    return { ...result, fromCache: false };
}

// Função para obter estatísticas do cache
function getCacheStats() {
    return {
        keys: cache.keys(),
        stats: cache.getStats(),
        itemCount: cache.keys().length
    };
}

// Função para limpar o cache
function clearCache() {
    const keysCount = cache.keys().length;
    cache.flushAll();
    console.log(`🧹 Cache limpo: ${keysCount} itens removidos`);
    return keysCount;
}

// Função de teste principal
async function runCacheTest() {
    console.log('🧪 TESTE DE SIMULAÇÃO DO CACHE');
    console.log('==============================');
    
    // Primeira busca - deve acessar a API
    console.log('\n📊 TESTE #1: Primeira busca (sem cache)');
    const query1 = 'presentes para aniversário';
    const result1 = await searchWithCache(query1);
    console.log(`✅ Resultados: ${result1.items.length}, De cache: ${result1.fromCache}`);
    
    // Segunda busca - deve usar cache
    console.log('\n📊 TESTE #2: Segunda busca (deve usar cache)');
    const result2 = await searchWithCache(query1);
    console.log(`✅ Resultados: ${result2.items.length}, De cache: ${result2.fromCache}`);
    
    // Estatísticas do cache
    console.log('\n📊 ESTATÍSTICAS DO CACHE:');
    const stats = getCacheStats();
    console.log(`📦 Total de itens em cache: ${stats.itemCount}`);
    console.log(`🔑 Chaves em cache: ${stats.keys.join(', ')}`);
    console.log(`📈 Estatísticas: ${JSON.stringify(stats.stats)}`);
    
    // Busca diferente - nova entrada no cache
    console.log('\n📊 TESTE #3: Busca com query diferente');
    const query2 = 'presentes para crianças';
    const result3 = await searchWithCache(query2);
    console.log(`✅ Resultados: ${result3.items.length}, De cache: ${result3.fromCache}`);
    
    // Estatísticas atualizadas
    const updatedStats = getCacheStats();
    console.log(`📦 Total de itens em cache atualizado: ${updatedStats.itemCount}`);
    
    // Repetir a segunda busca - deve continuar usando cache
    console.log('\n📊 TESTE #4: Repetir busca anterior (deve usar cache)');
    const result4 = await searchWithCache(query2);
    console.log(`✅ Resultados: ${result4.items.length}, De cache: ${result4.fromCache}`);
    
    // Limpar cache
    console.log('\n🧹 LIMPANDO CACHE...');
    const removedItems = clearCache();
    console.log(`✅ Items removidos do cache: ${removedItems}`);
    
    // Verificar após limpeza
    console.log('\n📊 TESTE #5: Busca após limpar cache (deve acessar API)');
    const result5 = await searchWithCache(query1);
    console.log(`✅ Resultados: ${result5.items.length}, De cache: ${result5.fromCache}`);
    
    // Verificar TTL do cache
    console.log('\n📊 TESTE #6: Teste de expiração do cache (TTL = 60s)');
    console.log('⏳ Armazenando item no cache...');
    
    // Armazenar um item no cache
    await searchWithCache('item para expirar');
    
    console.log('⏳ Aguardando 10 segundos...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Verificar se ainda está no cache (deve estar)
    const beforeExpire = await searchWithCache('item para expirar');
    console.log(`✅ Após 10s - De cache: ${beforeExpire.fromCache}`);
    
    // Não vamos esperar 60 segundos completos para o teste, então simulamos a limpeza
    console.log('\n⚠️ Em um caso real, o item expiraria após 60 segundos');
    console.log('⚠️ Para fins de demonstração, estamos limpando o cache manualmente');
    clearCache();
    
    console.log('\n==============================');
    console.log('🏁 TESTE DE CACHE FINALIZADO');
    console.log('==============================');
}

// Executar o teste
runCacheTest();
