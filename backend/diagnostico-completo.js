// Script para teste completo e diagnóstico de todos os motores de busca
const googleSearchService = require('./services/googleSearchService');
const customSearchService = require('./services/customSearchService');
const customSearchServiceV2 = require('./services/customSearchServiceV2');
const hybridSearchService = require('./services/hybridSearchService');
const monitoringService = require('./services/monitoringService');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Configurações do teste
const CONSULTAS_TESTE = [
  { query: 'fone de ouvido bluetooth', precoMax: 200, num: 6 },
  { query: 'smartwatch', precoMax: 500, num: 6 },
  { query: 'aspirador de pó robô', precoMax: 1000, num: 6 },
  { query: 'cafeteira expresso', precoMax: 800, num: 6 },
  { query: 'kit ferramentas', precoMax: 300, num: 6 },
  { query: 'mochila notebook', precoMax: 250, num: 6 },
  { query: 'air fryer', precoMax: 400, num: 6 },
  { query: 'panela elétrica', precoMax: 200, num: 6 },
  { query: 'secador de cabelo', precoMax: 150, num: 6 },
  { query: 'caixa de som bluetooth', precoMax: 300, num: 6 }
];

// Armazena todos os resultados para análise
const resultadosTeste = {
  timestamp: new Date().toISOString(),
  motores: {
    google: { consultas: [] },
    custom: { consultas: [] },
    customV2: { consultas: [] },
    hybrid: { consultas: [] }
  },
  resumo: {}
};

// Configurar saída de log em arquivo
const logFile = path.join(__dirname, 'diagnostico-motores.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Função para logar no console e no arquivo
function log(mensagem, nivel = 'info') {
  const timestamp = new Date().toISOString();
  const prefixos = {
    info: '📝 INFO',
    warn: '⚠️ AVISO',
    error: '❌ ERRO',
    success: '✅ SUCESSO'
  };
  
  const prefixo = prefixos[nivel] || prefixos.info;
  const mensagemFormatada = `[${timestamp}] ${prefixo}: ${mensagem}`;
  
  // Logar no console
  console.log(mensagemFormatada);
  
  // Logar no arquivo
  logStream.write(mensagemFormatada + '\n');
}

// Função para testar um motor de busca
async function testarMotor(nome, servico, funcao, consultas) {
  log(`Iniciando teste do motor: ${nome}`, 'info');
  
  const resultadosMotor = [];
  
  for (const [index, consulta] of consultas.entries()) {
    log(`Consulta ${index + 1}/${consultas.length}: "${consulta.query}" (Preço máx: R$${consulta.precoMax})`, 'info');
    
    try {
      // Iniciar monitoramento
      const { concluirConsulta } = monitoringService.iniciarConsulta(nome.toLowerCase().replace(' ', ''), consulta);
      
      // Medir tempo
      const inicio = Date.now();
      const resultados = await funcao.call(servico, consulta);
      const tempoExecucao = Date.now() - inicio;
      
      // Concluir monitoramento
      concluirConsulta(true, resultados);
      
      log(`✅ ${nome}: ${resultados.length} produtos em ${tempoExecucao}ms`, 'success');
      
      // Armazenar resultados para análise
      resultadosMotor.push({
        consulta,
        sucesso: true,
        tempoExecucao,
        resultados
      });
      
      // Validar resultados
      validarResultados(nome, resultados, consulta);
      
    } catch (erro) {
      log(`❌ ${nome} falhou: ${erro.message}`, 'error');
      
      // Iniciar monitoramento (caso ainda não tenha sido iniciado)
      const { concluirConsulta } = monitoringService.iniciarConsulta(nome.toLowerCase().replace(' ', ''), consulta);
      
      // Concluir monitoramento com falha
      concluirConsulta(false, [], erro);
      
      resultadosMotor.push({
        consulta,
        sucesso: false,
        erro: erro.message
      });
    }
  }
  
  // Calcular estatísticas do motor
  const sucessos = resultadosMotor.filter(r => r.sucesso).length;
  const taxaSucesso = sucessos / consultas.length;
  const tempoMedio = resultadosMotor
    .filter(r => r.sucesso)
    .reduce((acc, curr) => acc + curr.tempoExecucao, 0) / Math.max(1, sucessos);
  const produtosMedio = resultadosMotor
    .filter(r => r.sucesso)
    .reduce((acc, curr) => acc + curr.resultados.length, 0) / Math.max(1, sucessos);
  
  log(`📊 Resumo ${nome}: ${sucessos}/${consultas.length} consultas bem-sucedidas, tempo médio: ${tempoMedio.toFixed(0)}ms, produtos: ${produtosMedio.toFixed(1)}`, 'info');
  
  // Armazenar resultados completos
  resultadosTeste.motores[nome.toLowerCase().replace(' ', '')].consultas = resultadosMotor;
  resultadosTeste.motores[nome.toLowerCase().replace(' ', '')].resumo = {
    taxaSucesso,
    tempoMedio,
    produtosMedio,
    consultas: consultas.length,
    sucessos
  };
  
  return resultadosMotor;
}

// Função para validar os resultados
function validarResultados(motor, resultados, consulta) {
  // Verificar se há resultados
  if (!resultados || resultados.length === 0) {
    log(`⚠️ ${motor}: Nenhum resultado encontrado para "${consulta.query}"`, 'warn');
    return;
  }
  
  // Verificar preços (se estão dentro do limite)
  const produtosAcimaPreco = resultados.filter(p => p.price > consulta.precoMax);
  if (produtosAcimaPreco.length > 0) {
    log(`⚠️ ${motor}: ${produtosAcimaPreco.length} produtos acima do preço máximo para "${consulta.query}"`, 'warn');
  }
  
  // Verificar URLs válidas
  const produtosSemURL = resultados.filter(p => !p.link || !p.link.startsWith('http'));
  if (produtosSemURL.length > 0) {
    log(`⚠️ ${motor}: ${produtosSemURL.length} produtos sem URL válida para "${consulta.query}"`, 'warn');
  }
  
  // Verificar títulos válidos
  const produtosSemTitulo = resultados.filter(p => !p.title || p.title.trim() === '');
  if (produtosSemTitulo.length > 0) {
    log(`⚠️ ${motor}: ${produtosSemTitulo.length} produtos sem título para "${consulta.query}"`, 'warn');
  }
  
  // Verificar duplicidades por URL
  const urlsUnicas = new Set();
  const produtosDuplicados = resultados.filter(p => {
    if (!p.link) return false;
    if (urlsUnicas.has(p.link)) return true;
    urlsUnicas.add(p.link);
    return false;
  });
  
  if (produtosDuplicados.length > 0) {
    log(`⚠️ ${motor}: ${produtosDuplicados.length} produtos duplicados para "${consulta.query}"`, 'warn');
  }
}

// Função para analisar resultados de todos os motores
function analisarResultados() {
  // Análise de sobreposição de resultados
  log('\n📊 ANÁLISE DE SOBREPOSIÇÃO DE RESULTADOS', 'info');
  
  // Para cada consulta, verificar quantos resultados são compartilhados entre motores
  const todasConsultas = CONSULTAS_TESTE.map(c => c.query);
  
  for (const query of todasConsultas) {
    // Obter resultados de todos os motores para esta consulta
    const resultadosPorMotor = {};
    let totalLinks = 0;
    let linksUnicos = new Set();
    
    for (const [motor, dados] of Object.entries(resultadosTeste.motores)) {
      const resultadosConsulta = dados.consultas.find(c => c.consulta.query === query);
      
      if (resultadosConsulta && resultadosConsulta.sucesso) {
        const links = resultadosConsulta.resultados.map(r => r.link).filter(Boolean);
        resultadosPorMotor[motor] = links;
        totalLinks += links.length;
        links.forEach(link => linksUnicos.add(link));
      }
    }
    
    // Calcular sobreposição
    const sobreposicao = 1 - (linksUnicos.size / totalLinks);
    log(`Consulta "${query}": ${Math.round(sobreposicao * 100)}% de sobreposição entre motores`, 'info');
  }
  
  // Analisar desempenho geral
  log('\n📊 ANÁLISE DE DESEMPENHO', 'info');
  
  // Classificar motores por taxa de sucesso, tempo médio e produtos médios
  const classificacao = Object.entries(resultadosTeste.motores)
    .map(([motor, dados]) => ({
      motor,
      pontuacao: calcularPontuacao(dados.resumo)
    }))
    .sort((a, b) => b.pontuacao - a.pontuacao);
  
  // Exibir classificação
  classificacao.forEach((item, index) => {
    log(`${index + 1}º lugar: ${formatarNomeMotor(item.motor)} - Pontuação: ${item.pontuacao}`, 'info');
  });
  
  // Armazenar resumo
  resultadosTeste.resumo = {
    melhorMotor: classificacao[0].motor,
    classificacao,
    totalConsultas: CONSULTAS_TESTE.length
  };
}

// Função para calcular pontuação
function calcularPontuacao(resumo) {
  if (!resumo || resumo.sucessos === 0) return 0;
  
  // Fórmula: (produtos * 10) / tempo * (taxa de sucesso)
  const pontuacaoProdutos = resumo.produtosMedio * 10;
  const pontuacaoTempo = Math.max(1, resumo.tempoMedio);
  
  return Math.round((pontuacaoProdutos / pontuacaoTempo) * resumo.taxaSucesso * 100);
}

// Função para formatar nome do motor
function formatarNomeMotor(motor) {
  const nomes = {
    google: 'Google Search API',
    custom: 'Custom Search',
    customv2: 'Custom Search V2',
    hybrid: 'Hybrid Search'
  };
  
  return nomes[motor] || motor;
}

// Função para salvar resultados em arquivo
function salvarResultados() {
  const arquivoResultados = path.join(__dirname, 'diagnostico-resultados.json');
  fs.writeFileSync(
    arquivoResultados,
    JSON.stringify(resultadosTeste, null, 2),
    'utf8'
  );
  log(`Resultados salvos em ${arquivoResultados}`, 'info');
  
  // Gerar relatório HTML
  gerarRelatorioHTML();
}

// Função para gerar relatório HTML
function gerarRelatorioHTML() {
  const arquivoHTML = path.join(__dirname, 'diagnostico-report.html');
  
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diagnóstico de Motores de Busca - Easy Gift Search</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f7fa;
    }
    
    h1, h2, h3, h4 {
      color: #2c3e50;
    }
    
    .card {
      background: white;
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
    
    .timestamp {
      color: #7f8c8d;
      font-style: italic;
    }
    
    .success-rate {
      display: flex;
      align-items: center;
      margin: 10px 0;
    }
    
    .progress-bar {
      flex-grow: 1;
      height: 8px;
      background: #ecf0f1;
      border-radius: 4px;
      overflow: hidden;
      margin: 0 10px;
    }
    
    .progress-value {
      height: 100%;
      background: #2ecc71;
    }
    
    .danger { background: #e74c3c; }
    .warning { background: #f39c12; }
    .good { background: #2ecc71; }
    
    .progress-percent {
      font-weight: bold;
      min-width: 50px;
      text-align: right;
    }
    
    .query-details {
      margin-top: 40px;
    }
    
    .query-item {
      margin-bottom: 40px;
      border-left: 4px solid #3498db;
      padding-left: 15px;
    }
    
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    
    .badge-success { 
      background-color: #e6f4ea; 
      color: #34A853;
    }
    
    .badge-error { 
      background-color: #fce8e6; 
      color: #EA4335;
    }
    
    .recommendation {
      background-color: #e7f5e7;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #2ecc71;
    }
  </style>
</head>
<body>
  <h1>Diagnóstico de Motores de Busca - Easy Gift Search</h1>
  <p class="timestamp">Executado em: ${resultadosTeste.timestamp}</p>
  
  <div class="card">
    <h2>Resumo dos Resultados</h2>
    
    <div class="recommendation">
      <h3>Recomendação</h3>
      <p>Com base nos testes realizados, o motor <strong>${formatarNomeMotor(resultadosTeste.resumo.melhorMotor)}</strong> apresentou o melhor desempenho geral, considerando taxa de sucesso, tempo de resposta e quantidade de resultados.</p>
    </div>
    
    <div class="summary-grid">
      ${Object.entries(resultadosTeste.motores).map(([motor, dados]) => {
        if (!dados.resumo) return '';
        
        return `
        <div class="engine-card ${motor}">
          <h3>${formatarNomeMotor(motor)}</h3>
          <div class="metric">${dados.resumo.sucessos}/${dados.resumo.consultas}</div>
          <div class="metric-label">Consultas bem-sucedidas</div>
          
          <div class="success-rate">
            <span>Taxa de sucesso:</span>
            <div class="progress-bar">
              <div class="progress-value ${getProgressClass(dados.resumo.taxaSucesso)}" style="width: ${dados.resumo.taxaSucesso * 100}%"></div>
            </div>
            <div class="progress-percent">${(dados.resumo.taxaSucesso * 100).toFixed(1)}%</div>
          </div>
          
          <div class="metric">${dados.resumo.tempoMedio.toFixed(0)}ms</div>
          <div class="metric-label">Tempo médio</div>
          
          <div class="metric">${dados.resumo.produtosMedio.toFixed(1)}</div>
          <div class="metric-label">Produtos por consulta</div>
        </div>
        `;
      }).join('')}
    </div>
    
    <h3>Ranking por Pontuação</h3>
    <table>
      <thead>
        <tr>
          <th>Posição</th>
          <th>Motor</th>
          <th>Pontuação</th>
          <th>Taxa de Sucesso</th>
          <th>Tempo Médio</th>
          <th>Produtos por Consulta</th>
        </tr>
      </thead>
      <tbody>
        ${resultadosTeste.resumo.classificacao.map((item, index) => {
          const dados = resultadosTeste.motores[item.motor].resumo;
          return `
          <tr class="${index === 0 ? 'winner' : ''}">
            <td>${index + 1}º</td>
            <td>${formatarNomeMotor(item.motor)}</td>
            <td>${item.pontuacao}</td>
            <td>${(dados.taxaSucesso * 100).toFixed(1)}%</td>
            <td>${dados.tempoMedio.toFixed(0)}ms</td>
            <td>${dados.produtosMedio.toFixed(1)}</td>
          </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="query-details">
    <h2>Detalhes por Consulta</h2>
    
    ${CONSULTAS_TESTE.map(consulta => {
      const resultadosPorMotor = {};
      
      // Coletar resultados de todos os motores para esta consulta
      Object.entries(resultadosTeste.motores).forEach(([motor, dados]) => {
        const resultadoConsulta = dados.consultas.find(c => c.consulta.query === consulta.query);
        if (resultadoConsulta) {
          resultadosPorMotor[motor] = resultadoConsulta;
        }
      });
      
      return `
      <div class="card query-item">
        <h3>Consulta: "${consulta.query}" (Preço máx: R$${consulta.precoMax})</h3>
        
        <table>
          <thead>
            <tr>
              <th>Motor</th>
              <th>Status</th>
              <th>Tempo</th>
              <th>Resultados</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(resultadosPorMotor).map(([motor, resultado]) => `
            <tr>
              <td>${formatarNomeMotor(motor)}</td>
              <td>
                ${resultado.sucesso 
                  ? `<span class="badge badge-success">Sucesso</span>` 
                  : `<span class="badge badge-error">Falha</span>`
                }
              </td>
              <td>${resultado.sucesso ? `${resultado.tempoExecucao}ms` : '-'}</td>
              <td>${resultado.sucesso ? resultado.resultados.length : '-'}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      `;
    }).join('')}
  </div>
  
  <footer>
    <p>Easy Gift Search - Diagnóstico de Motores de Busca</p>
    <p>Gerado automaticamente em ${new Date().toLocaleString()}</p>
  </footer>
</body>
</html>`;

  fs.writeFileSync(arquivoHTML, html, 'utf8');
  log(`Relatório HTML gerado em ${arquivoHTML}`, 'info');
  
  function getProgressClass(rate) {
    if (rate < 0.7) return 'danger';
    if (rate < 0.9) return 'warning';
    return 'good';
  }
}

// Função principal para executar todos os testes
async function executarDiagnosticoCompleto() {
  log('🔍 INICIANDO DIAGNÓSTICO COMPLETO DE MOTORES DE BUSCA', 'info');
  log('=================================================', 'info');
  
  try {
    // Testar Google Search API
    await testarMotor('Google Search API', googleSearchService, googleSearchService.searchProducts, CONSULTAS_TESTE);
    
    // Testar Custom Search
    await testarMotor('Custom Search', customSearchService, customSearchService.buscarProdutos, CONSULTAS_TESTE);
    
    // Testar Custom Search V2
    await testarMotor('Custom Search V2', customSearchServiceV2, customSearchServiceV2.buscarProdutos, CONSULTAS_TESTE);
    
    // Testar Hybrid Search
    await testarMotor('Hybrid Search', hybridSearchService, hybridSearchService.buscarProdutos, CONSULTAS_TESTE);
    
    // Analisar resultados
    analisarResultados();
    
    // Salvar resultados
    salvarResultados();
    
    log('✅ DIAGNÓSTICO CONCLUÍDO COM SUCESSO!', 'success');
  } catch (erro) {
    log(`❌ ERRO AO EXECUTAR DIAGNÓSTICO: ${erro.message}`, 'error');
    console.error(erro);
  } finally {
    // Fechar stream de log
    logStream.end();
  }
}

// Executar diagnóstico
executarDiagnosticoCompleto();
