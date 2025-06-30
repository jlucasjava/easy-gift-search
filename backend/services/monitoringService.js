// Sistema de monitoramento para os motores de busca
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

/**
 * @typedef {Object} MetricaMotor
 * @property {number} tempoTotal - Tempo total de execução em ms
 * @property {number} chamadas - Número total de chamadas
 * @property {number} sucessos - Número de chamadas bem-sucedidas
 * @property {number} falhas - Número de chamadas com falha
 * @property {number} resultadosTotal - Número total de produtos retornados
 * @property {number} tempoMedio - Tempo médio de execução em ms
 * @property {number} resultadosMedio - Média de produtos por consulta
 * @property {number} taxaSucesso - Taxa de sucesso (0-1)
 */

class MonitorMotoresBusca {
  constructor() {
    this.arquivoMetricas = path.join(__dirname, 'metricas-motores.json');
    this.arquivoLogDetalhado = path.join(__dirname, 'logs', 'busca-detalhado.log');
    
    // Garantir que o diretório de logs existe
    if (!fs.existsSync(path.join(__dirname, 'logs'))) {
      fs.mkdirSync(path.join(__dirname, 'logs'));
    }
    
    // Inicializar ou carregar métricas existentes
    this.metricas = this.carregarMetricas();
    
    // Registrar horário de inicialização
    this.inicializacao = Date.now();
    
    this.log('Monitor de motores inicializado', 'info');
  }
  
  /**
   * Carrega as métricas do arquivo ou inicializa novas métricas
   * @returns {Object} Métricas carregadas ou novas
   */
  carregarMetricas() {
    try {
      if (fs.existsSync(this.arquivoMetricas)) {
        const dados = fs.readFileSync(this.arquivoMetricas, 'utf8');
        return JSON.parse(dados);
      }
    } catch (erro) {
      console.error('Erro ao carregar métricas:', erro);
    }
    
    // Se não existir ou falhar, retorna estrutura inicial
    return {
      ultimaAtualizacao: new Date().toISOString(),
      tempoAtivo: 0,
      totalConsultas: 0,
      consultas: {},
      motores: {
        google: this.inicializarMetricasMotor(),
        custom: this.inicializarMetricasMotor(),
        customV2: this.inicializarMetricasMotor(),
        hybrid: this.inicializarMetricasMotor()
      },
      historico: []
    };
  }
  
  /**
   * Inicializa métricas para um motor
   * @returns {MetricaMotor} Métricas inicializadas
   */
  inicializarMetricasMotor() {
    return {
      tempoTotal: 0,
      chamadas: 0,
      sucessos: 0,
      falhas: 0,
      resultadosTotal: 0,
      tempoMedio: 0,
      resultadosMedio: 0,
      taxaSucesso: 1
    };
  }
  
  /**
   * Registra um log detalhado
   * @param {string} mensagem - Mensagem a ser logada
   * @param {string} nivel - Nível do log (info, warn, error)
   * @param {Object} dados - Dados adicionais
   */
  log(mensagem, nivel = 'info', dados = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      nivel,
      mensagem,
      ...dados
    };
    
    // Adicionar ao arquivo de log
    fs.appendFileSync(
      this.arquivoLogDetalhado,
      JSON.stringify(logEntry) + '\n',
      'utf8'
    );
    
    // Log no console também, se for warn ou error
    if (nivel === 'warn' || nivel === 'error') {
      console[nivel](mensagem, dados);
    }
  }
  
  /**
   * Registra o início de uma consulta
   * @param {string} motor - Nome do motor de busca
   * @param {Object} parametros - Parâmetros da consulta
   * @returns {Object} Objeto com função para registrar a conclusão da consulta
   */
  iniciarConsulta(motor, parametros) {
    const inicioConsulta = performance.now();
    const idConsulta = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.log('Consulta iniciada', 'info', {
      motor,
      idConsulta,
      parametros
    });
    
    // Atualizar contagem total
    this.metricas.totalConsultas++;
    
    // Atualizar contagem para esta consulta específica
    const consultaKey = parametros.query.toLowerCase();
    if (!this.metricas.consultas[consultaKey]) {
      this.metricas.consultas[consultaKey] = {
        query: parametros.query,
        contador: 0,
        sucessos: 0
      };
    }
    this.metricas.consultas[consultaKey].contador++;
    
    // Incrementar contador do motor
    this.metricas.motores[motor].chamadas++;
    
    /**
     * Registra a conclusão de uma consulta
     * @param {boolean} sucesso - Se a consulta foi bem-sucedida
     * @param {Array} resultados - Resultados retornados
     * @param {Error} erro - Erro, se houver
     */
    const concluirConsulta = (sucesso, resultados = [], erro = null) => {
      const tempoConsulta = performance.now() - inicioConsulta;
      
      // Atualizar métricas do motor
      const metricasMotor = this.metricas.motores[motor];
      metricasMotor.tempoTotal += tempoConsulta;
      
      if (sucesso) {
        metricasMotor.sucessos++;
        metricasMotor.resultadosTotal += resultados.length;
        this.metricas.consultas[consultaKey].sucessos++;
      } else {
        metricasMotor.falhas++;
      }
      
      // Calcular médias
      metricasMotor.tempoMedio = metricasMotor.tempoTotal / metricasMotor.chamadas;
      metricasMotor.resultadosMedio = metricasMotor.sucessos > 0 
        ? metricasMotor.resultadosTotal / metricasMotor.sucessos 
        : 0;
      metricasMotor.taxaSucesso = metricasMotor.chamadas > 0 
        ? metricasMotor.sucessos / metricasMotor.chamadas 
        : 1;
      
      // Atualizar tempo ativo
      this.metricas.tempoAtivo = Date.now() - this.inicializacao;
      this.metricas.ultimaAtualizacao = new Date().toISOString();
      
      // Adicionar ao histórico (manter apenas os últimos 100)
      this.metricas.historico.unshift({
        timestamp: new Date().toISOString(),
        motor,
        query: parametros.query,
        sucesso,
        tempo: tempoConsulta,
        resultados: resultados.length
      });
      
      if (this.metricas.historico.length > 100) {
        this.metricas.historico = this.metricas.historico.slice(0, 100);
      }
      
      // Salvar métricas
      this.salvarMetricas();
      
      // Logar conclusão
      this.log('Consulta concluída', sucesso ? 'info' : 'error', {
        motor,
        idConsulta,
        sucesso,
        tempoConsulta,
        totalResultados: resultados.length,
        erro: erro ? erro.message : null
      });
      
      // Verificar se o tempo de resposta está muito alto
      if (tempoConsulta > 5000) {
        this.log('Tempo de resposta alto', 'warn', {
          motor,
          idConsulta,
          tempoConsulta
        });
      }
      
      // Verificar se a taxa de sucesso está abaixo do limiar (80%)
      if (metricasMotor.taxaSucesso < 0.8 && metricasMotor.chamadas >= 10) {
        this.log('Taxa de sucesso baixa', 'warn', {
          motor,
          taxaSucesso: metricasMotor.taxaSucesso,
          chamadas: metricasMotor.chamadas
        });
      }
      
      return {
        idConsulta,
        tempoConsulta,
        sucesso
      };
    };
    
    return { concluirConsulta };
  }
  
  /**
   * Salva as métricas no arquivo
   */
  salvarMetricas() {
    try {
      fs.writeFileSync(
        this.arquivoMetricas,
        JSON.stringify(this.metricas, null, 2),
        'utf8'
      );
    } catch (erro) {
      console.error('Erro ao salvar métricas:', erro);
    }
  }
  
  /**
   * Retorna um relatório das métricas atuais
   * @returns {Object} Relatório de métricas
   */
  gerarRelatorio() {
    // Calcular quais consultas são mais populares
    const consultasPopulares = Object.entries(this.metricas.consultas)
      .map(([key, value]) => ({ ...value, key }))
      .sort((a, b) => b.contador - a.contador)
      .slice(0, 10);
    
    // Calcular taxa de sucesso geral
    let totalSucessos = 0;
    let totalChamadas = 0;
    
    Object.values(this.metricas.motores).forEach(motor => {
      totalSucessos += motor.sucessos;
      totalChamadas += motor.chamadas;
    });
    
    const taxaSucessoGeral = totalChamadas > 0 ? totalSucessos / totalChamadas : 1;
    
    // Formatando tempo ativo
    const tempoAtivoMs = this.metricas.tempoAtivo;
    const segundos = Math.floor(tempoAtivoMs / 1000) % 60;
    const minutos = Math.floor(tempoAtivoMs / (1000 * 60)) % 60;
    const horas = Math.floor(tempoAtivoMs / (1000 * 60 * 60)) % 24;
    const dias = Math.floor(tempoAtivoMs / (1000 * 60 * 60 * 24));
    
    const tempoAtivoFormatado = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
    
    return {
      tempoAtivo: tempoAtivoFormatado,
      totalConsultas: this.metricas.totalConsultas,
      taxaSucessoGeral,
      motores: this.metricas.motores,
      consultasPopulares,
      ultimaAtualizacao: this.metricas.ultimaAtualizacao,
      historicoRecente: this.metricas.historico.slice(0, 10)
    };
  }
  
  /**
   * Gera um relatório HTML com as métricas
   * @returns {string} HTML do relatório
   */
  gerarRelatorioHTML() {
    const relatorio = this.gerarRelatorio();
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monitoramento de Motores de Busca - Easy Gift Search</title>
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
    
    h1, h2, h3 {
      color: #2c3e50;
    }
    
    .dashboard {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .metric-value {
      font-size: 28px;
      font-weight: bold;
      margin: 10px 0;
    }
    
    .metric-label {
      color: #7f8c8d;
      font-size: 14px;
      text-transform: uppercase;
    }
    
    .success-rate {
      display: flex;
      align-items: center;
      margin: 15px 0;
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
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
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
    
    .timestamp {
      color: #7f8c8d;
      font-size: 14px;
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
  </style>
</head>
<body>
  <h1>Monitoramento de Motores de Busca</h1>
  <p class="timestamp">Atualizado em: ${new Date(relatorio.ultimaAtualizacao).toLocaleString()}</p>
  
  <div class="dashboard">
    <div class="card">
      <div class="metric-label">Tempo Ativo</div>
      <div class="metric-value">${relatorio.tempoAtivo}</div>
    </div>
    
    <div class="card">
      <div class="metric-label">Total de Consultas</div>
      <div class="metric-value">${relatorio.totalConsultas.toLocaleString()}</div>
    </div>
    
    <div class="card">
      <div class="metric-label">Taxa de Sucesso Geral</div>
      <div class="metric-value">${(relatorio.taxaSucessoGeral * 100).toFixed(1)}%</div>
      <div class="success-rate">
        <div class="progress-bar">
          <div class="progress-value ${getProgressClass(relatorio.taxaSucessoGeral)}" style="width: ${relatorio.taxaSucessoGeral * 100}%"></div>
        </div>
      </div>
    </div>
  </div>
  
  <h2>Desempenho por Motor</h2>
  <div class="card">
    <table>
      <thead>
        <tr>
          <th>Motor</th>
          <th>Chamadas</th>
          <th>Taxa de Sucesso</th>
          <th>Tempo Médio</th>
          <th>Resultados Médios</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(relatorio.motores).map(([motor, metricas]) => `
        <tr>
          <td>${formatMotorName(motor)}</td>
          <td>${metricas.chamadas.toLocaleString()}</td>
          <td>
            <div class="success-rate">
              <div class="progress-bar">
                <div class="progress-value ${getProgressClass(metricas.taxaSucesso)}" style="width: ${metricas.taxaSucesso * 100}%"></div>
              </div>
              <div class="progress-percent">${(metricas.taxaSucesso * 100).toFixed(1)}%</div>
            </div>
          </td>
          <td>${metricas.tempoMedio.toFixed(0)} ms</td>
          <td>${metricas.resultadosMedio.toFixed(1)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <h2>Consultas Mais Populares</h2>
  <div class="card">
    <table>
      <thead>
        <tr>
          <th>Consulta</th>
          <th>Contagem</th>
          <th>Taxa de Sucesso</th>
        </tr>
      </thead>
      <tbody>
        ${relatorio.consultasPopulares.map(consulta => `
        <tr>
          <td>${consulta.query}</td>
          <td>${consulta.contador.toLocaleString()}</td>
          <td>
            <div class="success-rate">
              <div class="progress-bar">
                <div class="progress-value ${getProgressClass(consulta.sucessos / consulta.contador)}" style="width: ${(consulta.sucessos / consulta.contador) * 100}%"></div>
              </div>
              <div class="progress-percent">${((consulta.sucessos / consulta.contador) * 100).toFixed(1)}%</div>
            </div>
          </td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <h2>Histórico Recente</h2>
  <div class="card">
    <table>
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Motor</th>
          <th>Consulta</th>
          <th>Status</th>
          <th>Tempo</th>
          <th>Resultados</th>
        </tr>
      </thead>
      <tbody>
        ${relatorio.historicoRecente.map(item => `
        <tr>
          <td>${new Date(item.timestamp).toLocaleString()}</td>
          <td>${formatMotorName(item.motor)}</td>
          <td>${item.query}</td>
          <td><span class="badge ${item.sucesso ? 'badge-success' : 'badge-error'}">${item.sucesso ? 'Sucesso' : 'Falha'}</span></td>
          <td>${item.tempo.toFixed(0)} ms</td>
          <td>${item.resultados}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <footer>
    <p>Easy Gift Search - Sistema de Monitoramento</p>
    <p>Gerado automaticamente em ${new Date().toLocaleString()}</p>
  </footer>
  
  <script>
    // Função para atualizar a página a cada 30 segundos
    setTimeout(() => {
      location.reload();
    }, 30000);
  </script>
</body>
</html>`;

    function getProgressClass(rate) {
      if (rate < 0.7) return 'danger';
      if (rate < 0.9) return 'warning';
      return 'good';
    }
    
    function formatMotorName(motor) {
      const names = {
        google: 'Google Search API',
        custom: 'Custom Search',
        customV2: 'Custom Search V2',
        hybrid: 'Hybrid Search'
      };
      return names[motor] || motor;
    }
  }
  
  /**
   * Gera uma página HTML de monitoramento
   */
  gerarPaginaMonitoramento() {
    const html = this.gerarRelatorioHTML();
    const arquivoHTML = path.join(__dirname, 'monitoramento.html');
    
    fs.writeFileSync(arquivoHTML, html, 'utf8');
    this.log('Página de monitoramento gerada', 'info');
    
    return arquivoHTML;
  }
}

module.exports = new MonitorMotoresBusca();
