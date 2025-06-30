// Ferramenta de benchmark para comparar todos os motores de busca
const googleSearchService = require('./services/googleSearchService');
const customSearchService = require('./services/customSearchService');
const customSearchServiceV2 = require('./services/customSearchServiceV2');
const hybridSearchService = require('./services/hybridSearchService');
const fs = require('fs');
const path = require('path');

// Configuração do benchmark
const CONSULTAS_TESTE = [
  { query: 'fone de ouvido', precoMax: 150, num: 5 },
  { query: 'smartphone', precoMax: 1500, num: 5 },
  { query: 'mouse gamer', precoMax: 200, num: 5 },
  { query: 'teclado bluetooth', precoMax: 250, num: 5 },
  { query: 'relógio inteligente', precoMax: 500, num: 5 }
];

// Função para medir o tempo de execução
async function medirTempo(funcao) {
  const inicio = Date.now();
  const resultado = await funcao();
  const tempoTotal = Date.now() - inicio;
  return { resultado, tempoTotal };
}

// Função para salvar os resultados em um arquivo
function salvarResultados(resultados, nomeArquivo) {
  const caminhoArquivo = path.join(__dirname, nomeArquivo);
  fs.writeFileSync(
    caminhoArquivo,
    JSON.stringify(resultados, null, 2),
    'utf8'
  );
  console.log(`✅ Resultados salvos em ${nomeArquivo}`);
}

// Função para executar o benchmark
async function executarBenchmark() {
  console.log('🔍 INICIANDO BENCHMARK DE MOTORES DE BUSCA');
  console.log('==========================================');
  
  const resultados = {
    timestamp: new Date().toISOString(),
    consultas: CONSULTAS_TESTE,
    resultadosDetalhados: [],
    resumo: {
      google: { tempoMedio: 0, produtosMedio: 0, sucessos: 0 },
      custom: { tempoMedio: 0, produtosMedio: 0, sucessos: 0 },
      customV2: { tempoMedio: 0, produtosMedio: 0, sucessos: 0 },
      hybrid: { tempoMedio: 0, produtosMedio: 0, sucessos: 0 }
    }
  };

  // Para cada consulta de teste
  for (const [index, consulta] of CONSULTAS_TESTE.entries()) {
    console.log(`\n📊 TESTE ${index + 1}: "${consulta.query}" (Preço máx: R$${consulta.precoMax})`);
    
    const resultadoConsulta = {
      consulta,
      resultados: {
        google: { sucesso: false, tempoExecucao: 0, totalProdutos: 0, produtos: [] },
        custom: { sucesso: false, tempoExecucao: 0, totalProdutos: 0, produtos: [] },
        customV2: { sucesso: false, tempoExecucao: 0, totalProdutos: 0, produtos: [] },
        hybrid: { sucesso: false, tempoExecucao: 0, totalProdutos: 0, produtos: [] }
      }
    };

    // Testar Google Search
    try {
      console.log('⏳ Testando Google Search API...');
      const { resultado: resultadoGoogle, tempoTotal: tempoGoogle } = await medirTempo(async () => {
        return await googleSearchService.searchProducts(consulta);
      });
      
      resultadoConsulta.resultados.google = {
        sucesso: true,
        tempoExecucao: tempoGoogle,
        totalProdutos: resultadoGoogle.length,
        produtos: resultadoGoogle
      };
      
      resultados.resumo.google.tempoMedio += tempoGoogle;
      resultados.resumo.google.produtosMedio += resultadoGoogle.length;
      resultados.resumo.google.sucessos++;
      
      console.log(`✅ Google Search: ${resultadoGoogle.length} produtos em ${tempoGoogle}ms`);
    } catch (error) {
      console.error(`❌ Erro no Google Search: ${error.message}`);
      resultadoConsulta.resultados.google.erro = error.message;
    }

    // Testar Custom Search
    try {
      console.log('⏳ Testando Custom Search...');
      const { resultado: resultadoCustom, tempoTotal: tempoCustom } = await medirTempo(async () => {
        return await customSearchService.buscarProdutos(consulta);
      });
      
      resultadoConsulta.resultados.custom = {
        sucesso: true,
        tempoExecucao: tempoCustom,
        totalProdutos: resultadoCustom.length,
        produtos: resultadoCustom
      };
      
      resultados.resumo.custom.tempoMedio += tempoCustom;
      resultados.resumo.custom.produtosMedio += resultadoCustom.length;
      resultados.resumo.custom.sucessos++;
      
      console.log(`✅ Custom Search: ${resultadoCustom.length} produtos em ${tempoCustom}ms`);
    } catch (error) {
      console.error(`❌ Erro no Custom Search: ${error.message}`);
      resultadoConsulta.resultados.custom.erro = error.message;
    }

    // Testar Custom Search V2
    try {
      console.log('⏳ Testando Custom Search V2...');
      const { resultado: resultadoCustomV2, tempoTotal: tempoCustomV2 } = await medirTempo(async () => {
        return await customSearchServiceV2.buscarProdutos(consulta);
      });
      
      resultadoConsulta.resultados.customV2 = {
        sucesso: true,
        tempoExecucao: tempoCustomV2,
        totalProdutos: resultadoCustomV2.length,
        produtos: resultadoCustomV2
      };
      
      resultados.resumo.customV2.tempoMedio += tempoCustomV2;
      resultados.resumo.customV2.produtosMedio += resultadoCustomV2.length;
      resultados.resumo.customV2.sucessos++;
      
      console.log(`✅ Custom Search V2: ${resultadoCustomV2.length} produtos em ${tempoCustomV2}ms`);
    } catch (error) {
      console.error(`❌ Erro no Custom Search V2: ${error.message}`);
      resultadoConsulta.resultados.customV2.erro = error.message;
    }

    // Testar Hybrid Search
    try {
      console.log('⏳ Testando Hybrid Search...');
      const { resultado: resultadoHybrid, tempoTotal: tempoHybrid } = await medirTempo(async () => {
        return await hybridSearchService.buscarProdutos(consulta);
      });
      
      resultadoConsulta.resultados.hybrid = {
        sucesso: true,
        tempoExecucao: tempoHybrid,
        totalProdutos: resultadoHybrid.length,
        produtos: resultadoHybrid
      };
      
      resultados.resumo.hybrid.tempoMedio += tempoHybrid;
      resultados.resumo.hybrid.produtosMedio += resultadoHybrid.length;
      resultados.resumo.hybrid.sucessos++;
      
      console.log(`✅ Hybrid Search: ${resultadoHybrid.length} produtos em ${tempoHybrid}ms`);
    } catch (error) {
      console.error(`❌ Erro no Hybrid Search: ${error.message}`);
      resultadoConsulta.resultados.hybrid.erro = error.message;
    }

    // Adicionar resultados dessa consulta ao array de resultados
    resultados.resultadosDetalhados.push(resultadoConsulta);
  }

  // Calcular médias finais
  const quantidadeConsultas = CONSULTAS_TESTE.length;
  
  if (resultados.resumo.google.sucessos > 0) {
    resultados.resumo.google.tempoMedio = Math.round(resultados.resumo.google.tempoMedio / resultados.resumo.google.sucessos);
    resultados.resumo.google.produtosMedio = Math.round(resultados.resumo.google.produtosMedio / resultados.resumo.google.sucessos);
  }
  
  if (resultados.resumo.custom.sucessos > 0) {
    resultados.resumo.custom.tempoMedio = Math.round(resultados.resumo.custom.tempoMedio / resultados.resumo.custom.sucessos);
    resultados.resumo.custom.produtosMedio = Math.round(resultados.resumo.custom.produtosMedio / resultados.resumo.custom.sucessos);
  }
  
  if (resultados.resumo.customV2.sucessos > 0) {
    resultados.resumo.customV2.tempoMedio = Math.round(resultados.resumo.customV2.tempoMedio / resultados.resumo.customV2.sucessos);
    resultados.resumo.customV2.produtosMedio = Math.round(resultados.resumo.customV2.produtosMedio / resultados.resumo.customV2.sucessos);
  }
  
  if (resultados.resumo.hybrid.sucessos > 0) {
    resultados.resumo.hybrid.tempoMedio = Math.round(resultados.resumo.hybrid.tempoMedio / resultados.resumo.hybrid.sucessos);
    resultados.resumo.hybrid.produtosMedio = Math.round(resultados.resumo.hybrid.produtosMedio / resultados.resumo.hybrid.sucessos);
  }

  // Exibir relatório final
  console.log('\n📊 RESUMO DO BENCHMARK:');
  console.log('==========================================');
  console.log(`Google Search: ${resultados.resumo.google.produtosMedio} produtos em média, ${resultados.resumo.google.tempoMedio}ms por consulta, ${resultados.resumo.google.sucessos}/${quantidadeConsultas} consultas bem-sucedidas`);
  console.log(`Custom Search: ${resultados.resumo.custom.produtosMedio} produtos em média, ${resultados.resumo.custom.tempoMedio}ms por consulta, ${resultados.resumo.custom.sucessos}/${quantidadeConsultas} consultas bem-sucedidas`);
  console.log(`Custom Search V2: ${resultados.resumo.customV2.produtosMedio} produtos em média, ${resultados.resumo.customV2.tempoMedio}ms por consulta, ${resultados.resumo.customV2.sucessos}/${quantidadeConsultas} consultas bem-sucedidas`);
  console.log(`Hybrid Search: ${resultados.resumo.hybrid.produtosMedio} produtos em média, ${resultados.resumo.hybrid.tempoMedio}ms por consulta, ${resultados.resumo.hybrid.sucessos}/${quantidadeConsultas} consultas bem-sucedidas`);
  
  // Identificar o "vencedor" baseado em velocidade e resultados
  const avaliacoes = [
    { motor: 'Google Search', pontuacao: calcularPontuacao(resultados.resumo.google) },
    { motor: 'Custom Search', pontuacao: calcularPontuacao(resultados.resumo.custom) },
    { motor: 'Custom Search V2', pontuacao: calcularPontuacao(resultados.resumo.customV2) },
    { motor: 'Hybrid Search', pontuacao: calcularPontuacao(resultados.resumo.hybrid) }
  ].sort((a, b) => b.pontuacao - a.pontuacao);
  
  console.log('\n🏆 RANKING DE MOTORES:');
  avaliacoes.forEach((avaliacao, index) => {
    console.log(`${index + 1}º lugar: ${avaliacao.motor} - Pontuação: ${avaliacao.pontuacao}`);
  });
  
  // Gerar arquivo HTML com visualização
  gerarRelatorioHTML(resultados);
  
  // Salvar resultados para análise posterior
  salvarResultados(resultados, 'benchmark-resultados.json');
  
  return resultados;
}

// Função para calcular a pontuação de cada motor (maior é melhor)
function calcularPontuacao(resumoMotor) {
  if (resumoMotor.sucessos === 0) return 0;
  
  // Fórmula: (produtos * 10) / tempo * (sucessos / total_consultas)
  // Favorece motores que retornam mais produtos, são mais rápidos e mais confiáveis
  const pontuacaoProdutos = resumoMotor.produtosMedio * 10;
  const pontuacaoTempo = Math.max(1, resumoMotor.tempoMedio); // Evitar divisão por zero
  const taxaSucesso = resumoMotor.sucessos / CONSULTAS_TESTE.length;
  
  return Math.round((pontuacaoProdutos / pontuacaoTempo) * taxaSucesso * 100);
}

// Função para gerar relatório HTML
function gerarRelatorioHTML(resultados) {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Benchmark de Motores de Busca - Easy Gift Search</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .card {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .engine-card {
      background: white;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-top: 4px solid;
    }
    .google { border-color: #4285F4; }
    .custom { border-color: #EA4335; }
    .customv2 { border-color: #FBBC05; }
    .hybrid { border-color: #34A853; }
    
    .metric {
      font-size: 24px;
      font-weight: bold;
      margin: 10px 0;
    }
    .metric-label {
      font-size: 12px;
      text-transform: uppercase;
      color: #7f8c8d;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .winner {
      background-color: #e7f5e7;
    }
    .chart-container {
      height: 400px;
      margin: 30px 0;
    }
    .detail-table {
      margin-top: 30px;
    }
    .timestamp {
      color: #7f8c8d;
      font-style: italic;
    }
    .query-item {
      margin-bottom: 40px;
      border-left: 4px solid #3498db;
      padding-left: 15px;
    }
  </style>
</head>
<body>
  <h1>Benchmark de Motores de Busca - Easy Gift Search</h1>
  <p class="timestamp">Executado em: ${resultados.timestamp}</p>
  
  <div class="card">
    <h2>Resumo dos Resultados</h2>
    <div class="summary-grid">
      <div class="engine-card google">
        <h3>Google Search API</h3>
        <div class="metric">${resultados.resumo.google.produtosMedio}</div>
        <div class="metric-label">Produtos (média)</div>
        <div class="metric">${resultados.resumo.google.tempoMedio}ms</div>
        <div class="metric-label">Tempo de resposta</div>
        <div class="metric">${resultados.resumo.google.sucessos}/${CONSULTAS_TESTE.length}</div>
        <div class="metric-label">Consultas bem-sucedidas</div>
      </div>
      
      <div class="engine-card custom">
        <h3>Custom Search</h3>
        <div class="metric">${resultados.resumo.custom.produtosMedio}</div>
        <div class="metric-label">Produtos (média)</div>
        <div class="metric">${resultados.resumo.custom.tempoMedio}ms</div>
        <div class="metric-label">Tempo de resposta</div>
        <div class="metric">${resultados.resumo.custom.sucessos}/${CONSULTAS_TESTE.length}</div>
        <div class="metric-label">Consultas bem-sucedidas</div>
      </div>
      
      <div class="engine-card customv2">
        <h3>Custom Search V2</h3>
        <div class="metric">${resultados.resumo.customV2.produtosMedio}</div>
        <div class="metric-label">Produtos (média)</div>
        <div class="metric">${resultados.resumo.customV2.tempoMedio}ms</div>
        <div class="metric-label">Tempo de resposta</div>
        <div class="metric">${resultados.resumo.customV2.sucessos}/${CONSULTAS_TESTE.length}</div>
        <div class="metric-label">Consultas bem-sucedidas</div>
      </div>
      
      <div class="engine-card hybrid">
        <h3>Hybrid Search</h3>
        <div class="metric">${resultados.resumo.hybrid.produtosMedio}</div>
        <div class="metric-label">Produtos (média)</div>
        <div class="metric">${resultados.resumo.hybrid.tempoMedio}ms</div>
        <div class="metric-label">Tempo de resposta</div>
        <div class="metric">${resultados.resumo.hybrid.sucessos}/${CONSULTAS_TESTE.length}</div>
        <div class="metric-label">Consultas bem-sucedidas</div>
      </div>
    </div>
    
    <h3>Ranking por Pontuação</h3>
    <table>
      <thead>
        <tr>
          <th>Posição</th>
          <th>Motor</th>
          <th>Pontuação</th>
          <th>Produtos (média)</th>
          <th>Tempo (ms)</th>
          <th>Taxa de Sucesso</th>
        </tr>
      </thead>
      <tbody>
        ${[
          { motor: 'Google Search', resumo: resultados.resumo.google },
          { motor: 'Custom Search', resumo: resultados.resumo.custom },
          { motor: 'Custom Search V2', resumo: resultados.resumo.customV2 },
          { motor: 'Hybrid Search', resumo: resultados.resumo.hybrid }
        ]
        .map(item => ({ ...item, pontuacao: calcularPontuacao(item.resumo) }))
        .sort((a, b) => b.pontuacao - a.pontuacao)
        .map((item, index) => `
        <tr class="${index === 0 ? 'winner' : ''}">
          <td>${index + 1}º</td>
          <td>${item.motor}</td>
          <td>${item.pontuacao}</td>
          <td>${item.resumo.produtosMedio}</td>
          <td>${item.resumo.tempoMedio}ms</td>
          <td>${item.resumo.sucessos}/${CONSULTAS_TESTE.length} (${Math.round(item.resumo.sucessos/CONSULTAS_TESTE.length*100)}%)</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="card">
    <h2>Resultados Detalhados por Consulta</h2>
    
    ${resultados.resultadosDetalhados.map((resultado, index) => `
    <div class="query-item">
      <h3>Consulta ${index + 1}: "${resultado.consulta.query}" (Preço máx: R$${resultado.consulta.precoMax})</h3>
      
      <table>
        <thead>
          <tr>
            <th>Motor</th>
            <th>Status</th>
            <th>Tempo (ms)</th>
            <th>Produtos</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Google Search</td>
            <td>${resultado.resultados.google.sucesso ? '✅ Sucesso' : '❌ Falha'}</td>
            <td>${resultado.resultados.google.tempoExecucao}</td>
            <td>${resultado.resultados.google.totalProdutos}</td>
          </tr>
          <tr>
            <td>Custom Search</td>
            <td>${resultado.resultados.custom.sucesso ? '✅ Sucesso' : '❌ Falha'}</td>
            <td>${resultado.resultados.custom.tempoExecucao}</td>
            <td>${resultado.resultados.custom.totalProdutos}</td>
          </tr>
          <tr>
            <td>Custom Search V2</td>
            <td>${resultado.resultados.customV2.sucesso ? '✅ Sucesso' : '❌ Falha'}</td>
            <td>${resultado.resultados.customV2.tempoExecucao}</td>
            <td>${resultado.resultados.customV2.totalProdutos}</td>
          </tr>
          <tr>
            <td>Hybrid Search</td>
            <td>${resultado.resultados.hybrid.sucesso ? '✅ Sucesso' : '❌ Falha'}</td>
            <td>${resultado.resultados.hybrid.tempoExecucao}</td>
            <td>${resultado.resultados.hybrid.totalProdutos}</td>
          </tr>
        </tbody>
      </table>
    </div>
    `).join('')}
  </div>
  
  <footer>
    <p>Easy Gift Search - Benchmark de Motores de Busca</p>
    <p>Gerado automaticamente em ${new Date().toLocaleString()}</p>
  </footer>
</body>
</html>`;

  fs.writeFileSync(
    path.join(__dirname, 'benchmark-report.html'),
    html,
    'utf8'
  );
  console.log('✅ Relatório HTML gerado em benchmark-report.html');
}

// Executar o benchmark
executarBenchmark()
  .then(() => {
    console.log('\n✅ BENCHMARK CONCLUÍDO!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 ERRO AO EXECUTAR BENCHMARK:', err);
    process.exit(1);
  });
