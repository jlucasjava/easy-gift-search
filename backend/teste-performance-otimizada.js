#!/usr/bin/env node
/**
 * 🚀 PERFORMANCE BENCHMARK TOOL
 * Easy Gift Search - Iteration 2 Testing
 * Script para testar melhorias de performance implementadas
 */

const axios = require('axios');
const colors = require('colors');

class PerformanceBenchmark {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.results = [];
    this.totalRequests = 0;
    this.errors = 0;
  }

  async benchmark() {
    console.log('🚀 EASY GIFT SEARCH - PERFORMANCE BENCHMARK'.green.bold);
    console.log('='.repeat(70).gray);
    console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
    console.log(`🌐 Base URL: ${this.baseURL}`);
    console.log('');

    // Aguardar servidor estar online
    await this.waitForServer();

    console.log('🔥 INICIANDO TESTES DE PERFORMANCE...'.yellow.bold);
    console.log('='.repeat(70).gray);

    // Testes sequenciais
    await this.testCachePerformance();
    await this.testDeduplicationPerformance();
    await this.testCompressionPerformance();
    await this.testResponseTimeConsistency();
    await this.testConcurrentRequests();

    // Relatório final
    this.generateReport();
  }

  async waitForServer() {
    console.log('🔍 Verificando se servidor está online...'.cyan);
    
    for (let i = 0; i < 30; i++) {
      try {
        await axios.get(`${this.baseURL}/api/status`, { timeout: 2000 });
        console.log('✅ Servidor online!'.green);
        return;
      } catch (error) {
        if (i === 0) {
          console.log('⏳ Aguardando servidor iniciar...'.yellow);
        }
        await this.sleep(1000);
      }
    }
    
    throw new Error('❌ Servidor não respondeu em 30 segundos');
  }

  async testCachePerformance() {
    console.log('\n📊 TESTE 1: PERFORMANCE DO CACHE'.cyan.bold);
    console.log('-'.repeat(50).gray);

    const query = 'smartphone samsung';
    const endpoint = `/api/products?q=${encodeURIComponent(query)}&age=adulto&maxPrice=1000`;

    // Primeira request (cache miss)
    console.log('🔍 Request 1 (Cache Miss):');
    const first = await this.timeRequest(endpoint);
    
    // Segunda request (cache hit)
    console.log('🔍 Request 2 (Cache Hit):');
    const second = await this.timeRequest(endpoint);
    
    // Terceira request (cache hit)
    console.log('🔍 Request 3 (Cache Hit):');
    const third = await this.timeRequest(endpoint);

    const improvement = ((first.time - second.time) / first.time * 100).toFixed(2);
    
    console.log(`\n📈 RESULTADOS:`);
    console.log(`   Cache Miss:  ${first.time}ms`);
    console.log(`   Cache Hit 1: ${second.time}ms`);
    console.log(`   Cache Hit 2: ${third.time}ms`);
    console.log(`   Melhoria:    ${improvement}% mais rápido com cache`);

    if (improvement > 50) {
      console.log(`✅ EXCELENTE: Cache oferece ${improvement}% de melhoria!`.green);
    } else if (improvement > 20) {
      console.log(`👍 BOM: Cache oferece ${improvement}% de melhoria`.yellow);
    } else {
      console.log(`⚠️  VERIFICAR: Cache só oferece ${improvement}% de melhoria`.red);
    }
  }

  async testDeduplicationPerformance() {
    console.log('\n🔄 TESTE 2: DEDUPLICAÇÃO DE REQUESTS'.cyan.bold);
    console.log('-'.repeat(50).gray);

    const query = 'notebook gamer';
    const endpoint = `/api/products?q=${encodeURIComponent(query)}&age=adulto`;

    console.log('🔍 Enviando 5 requests simultâneos idênticos...');
    
    const startTime = Date.now();
    const promises = Array(5).fill().map((_, i) => 
      this.timeRequest(endpoint, `Request ${i + 1}`)
    );

    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
    const maxTime = Math.max(...results.map(r => r.time));
    const minTime = Math.min(...results.map(r => r.time));

    console.log(`\n📈 RESULTADOS:`);
    console.log(`   Tempo Total:  ${totalTime}ms`);
    console.log(`   Tempo Médio:  ${avgTime.toFixed(2)}ms`);
    console.log(`   Tempo Máximo: ${maxTime}ms`);
    console.log(`   Tempo Mínimo: ${minTime}ms`);

    // Verificar estatísticas de deduplicação
    try {
      const dedupStats = await axios.get(`${this.baseURL}/api/deduplication/stats`);
      console.log(`   Deduplicados: ${dedupStats.data.deduplicated}`);
      console.log(`   Taxa:         ${dedupStats.data.deduplicationRate}%`);
    } catch (error) {
      console.log(`   ⚠️ Não foi possível obter estatísticas de deduplicação`);
    }

    if (maxTime - minTime < 100) {
      console.log(`✅ EXCELENTE: Tempos consistentes (variação: ${maxTime - minTime}ms)`.green);
    } else {
      console.log(`⚠️  VERIFICAR: Alta variação nos tempos (${maxTime - minTime}ms)`.yellow);
    }
  }

  async testCompressionPerformance() {
    console.log('\n📦 TESTE 3: COMPRESSÃO DE RESPOSTAS'.cyan.bold);
    console.log('-'.repeat(50).gray);

    const endpoint = '/api/products?q=presente%20natal&num=10';

    console.log('🔍 Request com compressão:');
    const compressed = await this.timeRequest(endpoint, 'Compressed', {
      'Accept-Encoding': 'gzip, deflate, br'
    });

    console.log('🔍 Request sem compressão:');
    const uncompressed = await this.timeRequest(endpoint, 'Uncompressed', {
      'Accept-Encoding': 'identity'
    });

    const sizeDiff = ((uncompressed.size - compressed.size) / uncompressed.size * 100).toFixed(2);
    const timeDiff = ((uncompressed.time - compressed.time) / uncompressed.time * 100).toFixed(2);

    console.log(`\n📈 RESULTADOS:`);
    console.log(`   Com compressão:    ${compressed.time}ms, ${compressed.size} bytes`);
    console.log(`   Sem compressão:    ${uncompressed.time}ms, ${uncompressed.size} bytes`);
    console.log(`   Redução tamanho:   ${sizeDiff}%`);
    console.log(`   Redução tempo:     ${timeDiff}%`);

    if (sizeDiff > 60) {
      console.log(`✅ EXCELENTE: Compressão reduz ${sizeDiff}% do tamanho!`.green);
    } else if (sizeDiff > 30) {
      console.log(`👍 BOM: Compressão reduz ${sizeDiff}% do tamanho`.yellow);
    } else {
      console.log(`⚠️  VERIFICAR: Compressão só reduz ${sizeDiff}% do tamanho`.red);
    }
  }

  async testResponseTimeConsistency() {
    console.log('\n⏱️  TESTE 4: CONSISTÊNCIA DE TEMPO DE RESPOSTA'.cyan.bold);
    console.log('-'.repeat(50).gray);

    const endpoints = [
      '/api/status',
      '/api/products?q=livro&age=adulto',
      '/api/recommend?budget=200&interests=tecnologia'
    ];

    for (const endpoint of endpoints) {
      console.log(`\n🔍 Testando: ${endpoint}`);
      const times = [];
      
      for (let i = 0; i < 5; i++) {
        const result = await this.timeRequest(endpoint, null, {}, false);
        times.push(result.time);
        await this.sleep(200); // Pequeno delay entre requests
      }

      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const max = Math.max(...times);
      const min = Math.min(...times);
      const stdDev = Math.sqrt(times.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / times.length);

      console.log(`   Médio: ${avg.toFixed(2)}ms`);
      console.log(`   Min/Max: ${min}ms / ${max}ms`);
      console.log(`   Desvio: ±${stdDev.toFixed(2)}ms`);

      if (stdDev < 100) {
        console.log(`   ✅ CONSISTENTE: Baixa variação`.green);
      } else if (stdDev < 300) {
        console.log(`   👍 RAZOÁVEL: Variação moderada`.yellow);
      } else {
        console.log(`   ⚠️  INSTÁVEL: Alta variação`.red);
      }
    }
  }

  async testConcurrentRequests() {
    console.log('\n🚀 TESTE 5: REQUESTS CONCORRENTES'.cyan.bold);
    console.log('-'.repeat(50).gray);

    const queries = [
      'smartphone',
      'notebook',
      'fone de ouvido',
      'tablet',
      'smartwatch'
    ];

    console.log('🔍 Enviando 5 requests diferentes simultaneamente...');
    
    const startTime = Date.now();
    const promises = queries.map((query, i) => 
      this.timeRequest(`/api/products?q=${encodeURIComponent(query)}&age=adulto`, `Query ${i + 1}: ${query}`)
    );

    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
    const successRate = (results.filter(r => r.success).length / results.length * 100).toFixed(2);

    console.log(`\n📈 RESULTADOS:`);
    console.log(`   Tempo Total:     ${totalTime}ms`);
    console.log(`   Tempo Médio:     ${avgTime.toFixed(2)}ms`);
    console.log(`   Taxa de Sucesso: ${successRate}%`);
    console.log(`   Throughput:      ${(results.length / (totalTime / 1000)).toFixed(2)} req/seg`);

    if (successRate >= 100) {
      console.log(`✅ EXCELENTE: Todas as requests foram bem-sucedidas!`.green);
    } else if (successRate >= 80) {
      console.log(`👍 BOM: ${successRate}% de sucesso`.yellow);
    } else {
      console.log(`⚠️  PROBLEMA: Apenas ${successRate}% de sucesso`.red);
    }
  }

  async timeRequest(endpoint, label = null, headers = {}, logResult = true) {
    const fullURL = `${this.baseURL}${endpoint}`;
    const startTime = Date.now();
    
    try {
      const response = await axios.get(fullURL, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Performance-Benchmark-Tool/1.0',
          ...headers
        },
        timeout: 10000
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      const size = JSON.stringify(response.data).length;

      this.totalRequests++;
      this.results.push({
        endpoint,
        time: duration,
        size,
        status: response.status,
        success: true
      });

      if (logResult) {
        const statusColor = response.status === 200 ? 'green' : 'yellow';
        const timeColor = duration < 500 ? 'green' : duration < 1000 ? 'yellow' : 'red';
        console.log(`   ${label || 'Request'}: ${duration}ms (${response.status}) ${size} bytes`[timeColor]);
      }

      return {
        time: duration,
        size,
        status: response.status,
        success: true,
        data: response.data
      };

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.errors++;
      this.results.push({
        endpoint,
        time: duration,
        size: 0,
        status: error.response?.status || 0,
        success: false,
        error: error.message
      });

      if (logResult) {
        console.log(`   ${label || 'Request'}: ERRO (${duration}ms) - ${error.message}`.red);
      }

      return {
        time: duration,
        size: 0,
        status: error.response?.status || 0,
        success: false,
        error: error.message
      };
    }
  }

  generateReport() {
    console.log('\n📋 RELATÓRIO FINAL DE PERFORMANCE'.green.bold);
    console.log('='.repeat(70).gray);

    const successfulRequests = this.results.filter(r => r.success);
    const avgTime = successfulRequests.reduce((sum, r) => sum + r.time, 0) / successfulRequests.length;
    const minTime = Math.min(...successfulRequests.map(r => r.time));
    const maxTime = Math.max(...successfulRequests.map(r => r.time));
    const avgSize = successfulRequests.reduce((sum, r) => sum + r.size, 0) / successfulRequests.length;
    const successRate = (successfulRequests.length / this.totalRequests * 100).toFixed(2);

    console.log(`📊 ESTATÍSTICAS GERAIS:`);
    console.log(`   Total de Requests:    ${this.totalRequests}`);
    console.log(`   Requests Bem-sucedidas: ${successfulRequests.length}`);
    console.log(`   Taxa de Sucesso:      ${successRate}%`);
    console.log(`   Tempo Médio:          ${avgTime.toFixed(2)}ms`);
    console.log(`   Tempo Mínimo:         ${minTime}ms`);
    console.log(`   Tempo Máximo:         ${maxTime}ms`);
    console.log(`   Tamanho Médio:        ${avgSize.toFixed(0)} bytes`);

    console.log(`\n🎯 AVALIAÇÃO GERAL:`);
    
    if (avgTime < 500 && successRate >= 95) {
      console.log(`✅ EXCELENTE: Performance otimizada com sucesso!`.green.bold);
    } else if (avgTime < 1000 && successRate >= 90) {
      console.log(`👍 BOA: Performance satisfatória`.yellow.bold);
    } else {
      console.log(`⚠️  PRECISA MELHORAR: Performance abaixo do esperado`.red.bold);
    }

    console.log(`\n📈 PRÓXIMOS PASSOS:`);
    if (avgTime > 1000) {
      console.log(`   🔧 Otimizar tempo de resposta (atual: ${avgTime.toFixed(2)}ms)`);
    }
    if (successRate < 95) {
      console.log(`   🐛 Investigar falhas (${(100 - successRate).toFixed(2)}% de erro)`);
    }
    if (avgTime < 500 && successRate >= 95) {
      console.log(`   🚀 Pronto para Iteration 3: Analytics & Insights!`);
    }

    console.log(`\n⏰ Teste concluído em: ${new Date().toLocaleString('pt-BR')}`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Executar benchmark
async function runBenchmark() {
  const benchmark = new PerformanceBenchmark();
  
  try {
    await benchmark.benchmark();
  } catch (error) {
    console.error('❌ Erro durante benchmark:', error.message);
    process.exit(1);
  }
}

// Verificar se foi chamado diretamente
if (require.main === module) {
  runBenchmark();
}

module.exports = PerformanceBenchmark;
