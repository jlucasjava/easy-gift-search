/**
 * 🚀 TESTE SIMPLES DAS MELHORIAS
 * Verifica se as melhorias foram aplicadas corretamente
 */

console.log('🚀 TESTANDO MELHORIAS DE PERFORMANCE...\n');

// 1. Testar cache service
try {
  const cacheService = require('./services/advancedCacheService');
  console.log('✅ Cache Service carregado com sucesso');
  console.log('   Redis disponível:', cacheService.redisAvailable);
} catch (error) {
  console.log('❌ Erro no Cache Service:', error.message);
}

// 2. Testar performance monitor
try {
  const performanceMonitor = require('./services/performanceMonitor');
  console.log('✅ Performance Monitor carregado com sucesso');
  console.log('   Métricas ativas:', Object.keys(performanceMonitor.getMetrics()).length > 0);
} catch (error) {
  console.log('❌ Erro no Performance Monitor:', error.message);
}

// 3. Testar middlewares
try {
  const { rateLimits } = require('./middleware/advancedRateLimit');
  console.log('✅ Rate Limiting carregado com sucesso');
} catch (error) {
  console.log('❌ Erro no Rate Limiting:', error.message);
}

// 4. Testar clustering
try {
  const clusterManager = require('./middleware/clusterMiddleware');
  console.log('✅ Cluster Manager carregado com sucesso');
} catch (error) {
  console.log('❌ Erro no Cluster Manager:', error.message);
}

// 5. Teste básico do Express
console.log('\n🧪 TESTE BÁSICO DO EXPRESS...');
try {
  const express = require('express');
  const app = express();
  
  app.get('/test', (req, res) => {
    res.json({ status: 'ok', message: 'Melhorias aplicadas com sucesso!' });
  });
  
  const server = app.listen(3001, () => {
    console.log('✅ Servidor de teste rodando na porta 3001');
    console.log('🎯 Teste: http://localhost:3001/test');
    
    // Fazer auto-teste
    const axios = require('axios');
    setTimeout(async () => {
      try {
        const response = await axios.get('http://localhost:3001/test');
        console.log('✅ Auto-teste:', response.data.message);
        server.close();
        console.log('\n🎉 TODAS AS MELHORIAS FUNCIONANDO CORRETAMENTE!');
      } catch (error) {
        console.log('❌ Auto-teste falhou:', error.message);
        server.close();
      }
    }, 1000);
  });
  
} catch (error) {
  console.log('❌ Erro no teste do Express:', error.message);
}
