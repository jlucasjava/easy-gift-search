/**
 * 🚀 BENCHMARK COMPLETO DE PERFORMANCE
 * Easy Gift Search - Iteration 2 Performance Test
 */

const axios = require('axios');
const colors = require('colors');

class PerformanceBenchmark {
  constructor() {
    this.baseURL = process.env.BASE_URL || 'http://localhost:3000';
    this.results = {
      endpoints: {},
      summary: {},
      timestamp: new Date().toISOString()
    };
  }

  async testEndpoint(name, endpoint, concurrent = 10, total = 100) {
    console.log(`\n🧪 Testing ${name}...`.cyan);
    
    const promises = [];
    const times = [];
    let successes = 0;
    let errors = 0;

    const startTime = Date.now();

    // Criar requests concorrentes
    for (let i = 0; i < total; i++) {
      const promise = this.makeRequest(endpoint)
        .then((time) => {
          times.push(time);
          successes++;
        })
        .catch(() => {
          errors++;
        });
      
      promises.push(promise);

      // Controlar concorrência
      if (promises.length >= concurrent) {
        await Promise.allSettled(promises.splice(0, concurrent));
      }
    }

    // Aguardar requests restantes
    await Promise.allSettled(promises);

    const totalTime = Date.now() - startTime;
    const avgTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    const minTime = times.length > 0 ? Math.min(...times) : 0;
    const maxTime = times.length > 0 ? Math.max(...times) : 0;
    const rps = (successes / (totalTime / 1000)).toFixed(2);

    const result = {
      endpoint,
      total,
      successes,
      errors,
      successRate: ((successes / total) * 100).toFixed(2) + '%',
      avgResponseTime: avgTime.toFixed(2) + 'ms',
      minResponseTime: minTime.toFixed(2) + 'ms',
      maxResponseTime: maxTime.toFixed(2) + 'ms',
      requestsPerSecond: rps,
      totalTime: totalTime + 'ms'
    };

    this.results.endpoints[name] = result;

    console.log(`✅ ${name}: ${successes}/${total} success (${result.successRate})`.green);
    console.log(`⚡ Avg: ${result.avgResponseTime}, RPS: ${rps}`.yellow);

    return result;
  }

  async makeRequest(endpoint) {
    const startTime = Date.now();
    try {
      await axios.get(`${this.baseURL}${endpoint}`, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Performance-Benchmark/1.0'
        }
      });
      return Date.now() - startTime;
    } catch (error) {
      throw error;
    }
  }

  async runFullBenchmark() {
    console.log('🚀 INICIANDO BENCHMARK COMPLETO DE PERFORMANCE'.cyan.bold);
    console.log(`🎯 Base URL: ${this.baseURL}`.yellow);
    console.log(`⏰ Timestamp: ${this.results.timestamp}`.gray);

    try {
      // 1. Health check
      await this.testEndpoint('Health Check', '/api/health', 5, 20);

      // 2. Metrics
      await this.testEndpoint('Metrics', '/api/metrics', 3, 10);

      // 3. Search endpoints
      await this.testEndpoint('Search - iPhone', '/api/search?q=iphone&limit=5', 5, 30);
      await this.testEndpoint('Search - Laptop', '/api/search?q=laptop&limit=10', 5, 30);
      await this.testEndpoint('Search - Books', '/api/search?q=livros&limit=8', 5, 20);

      // 4. Cache test
      console.log('\n🗄️ Testing cache performance...'.cyan);
      await this.testEndpoint('Cache Test 1', '/api/search?q=smartphone&limit=5', 10, 50);
      await this.testEndpoint('Cache Test 2', '/api/search?q=smartphone&limit=5', 10, 50);

      // 5. Load test
      console.log('\n🔥 Load testing...'.cyan);
      await this.testEndpoint('Load Test', '/api/search?q=test&limit=3', 20, 100);

      this.generateSummary();
      this.printResults();

    } catch (error) {
      console.error('❌ Benchmark failed:', error.message);
    }
  }

  generateSummary() {
    const endpoints = Object.values(this.results.endpoints);
    
    const totalRequests = endpoints.reduce((sum, ep) => sum + ep.total, 0);
    const totalSuccesses = endpoints.reduce((sum, ep) => sum + ep.successes, 0);
    const totalErrors = endpoints.reduce((sum, ep) => sum + ep.errors, 0);
    
    const avgResponseTimes = endpoints.map(ep => parseFloat(ep.avgResponseTime));
    const overallAvgTime = avgResponseTimes.reduce((a, b) => a + b, 0) / avgResponseTimes.length;
    
    const rpsValues = endpoints.map(ep => parseFloat(ep.requestsPerSecond));
    const maxRps = Math.max(...rpsValues);

    this.results.summary = {
      totalRequests,
      totalSuccesses,
      totalErrors,
      overallSuccessRate: ((totalSuccesses / totalRequests) * 100).toFixed(2) + '%',
      overallAvgResponseTime: overallAvgTime.toFixed(2) + 'ms',
      maxRequestsPerSecond: maxRps.toFixed(2),
      endpointsTested: endpoints.length
    };
  }

  printResults() {
    console.log('\n📊 RESULTADOS DO BENCHMARK'.rainbow.bold);
    console.log('='.repeat(60).gray);

    // Summary
    const s = this.results.summary;
    console.log(`\n📈 RESUMO GERAL:`.cyan.bold);
    console.log(`   Total de requests: ${s.totalRequests}`);
    console.log(`   Sucessos: ${s.totalSuccesses}`);
    console.log(`   Erros: ${s.totalErrors}`);
    console.log(`   Taxa de sucesso: ${s.overallSuccessRate}`.green);
    console.log(`   Tempo médio: ${s.overallAvgResponseTime}`.yellow);
    console.log(`   RPS máximo: ${s.maxRequestsPerSecond}`.magenta);

    // Endpoints detalhados
    console.log(`\n🎯 DETALHES POR ENDPOINT:`.cyan.bold);
    for (const [name, result] of Object.entries(this.results.endpoints)) {
      console.log(`\n  📍 ${name}:`);
      console.log(`     Success Rate: ${result.successRate}`);
      console.log(`     Avg Time: ${result.avgResponseTime}`);
      console.log(`     RPS: ${result.requestsPerSecond}`);
    }

    // Performance Score
    const score = this.calculatePerformanceScore();
    console.log(`\n🏆 PERFORMANCE SCORE: ${score}/100`.rainbow.bold);
    
    this.giveRecommendations(score);
  }

  calculatePerformanceScore() {
    const s = this.results.summary;
    const successRate = parseFloat(s.overallSuccessRate);
    const avgTime = parseFloat(s.overallAvgResponseTime);
    const maxRps = parseFloat(s.maxRequestsPerSecond);

    let score = 0;
    
    // Success rate (40 points)
    score += (successRate / 100) * 40;
    
    // Response time (30 points) - quanto menor, melhor
    if (avgTime < 500) score += 30;
    else if (avgTime < 1000) score += 25;
    else if (avgTime < 2000) score += 20;
    else if (avgTime < 5000) score += 10;
    else score += 5;
    
    // RPS (30 points)
    if (maxRps > 50) score += 30;
    else if (maxRps > 30) score += 25;
    else if (maxRps > 20) score += 20;
    else if (maxRps > 10) score += 15;
    else if (maxRps > 5) score += 10;
    else score += 5;

    return Math.round(score);
  }

  giveRecommendations(score) {
    console.log(`\n💡 RECOMENDAÇÕES:`.cyan.bold);
    
    if (score >= 90) {
      console.log('🏆 Excelente! Performance otimizada.'.green);
    } else if (score >= 80) {
      console.log('✅ Boa performance, pequenos ajustes podem ajudar.'.yellow);
    } else if (score >= 70) {
      console.log('⚠️ Performance aceitável, considere otimizações.'.yellow);
      console.log('   - Verificar cache Redis');
      console.log('   - Otimizar queries de APIs');
    } else {
      console.log('❌ Performance precisa de melhorias urgentes.'.red);
      console.log('   - Verificar configuração do servidor');
      console.log('   - Implementar cache agressivo');
      console.log('   - Considerar CDN');
    }
  }

  async saveResults() {
    const fs = require('fs');
    const filename = `benchmark-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Resultados salvos em: ${filename}`.green);
  }
}

// Executar benchmark se chamado diretamente
if (require.main === module) {
  const benchmark = new PerformanceBenchmark();
  benchmark.runFullBenchmark()
    .then(() => benchmark.saveResults())
    .catch(console.error);
}

module.exports = PerformanceBenchmark;
