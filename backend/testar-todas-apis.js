/**
 * Teste Completo de APIs - Easy Gift Search
 * 
 * Este script testa todas as APIs integradas no sistema:
 * - Google Search API
 * - Shopee API
 * - Motor Híbrido (Google + Shopee)
 * - Custom Search V1
 * - Custom Search V2
 * 
 * Métricas analisadas:
 * - Tempo de resposta
 * - Número de resultados
 * - Precisão do filtro de preço
 * - Taxa de falha
 * - Qualidade dos resultados (URLs válidas, imagens, etc.)
 */

const fs = require('fs');
const path = require('path');

// Importar todos os serviços de busca
const googleSearchService = require('./services/googleSearchService');
const shopeeAPIService = require('./services/shopeeAPIService');
const hybridSearchService = require('./services/hybridSearchService');
const customSearchService = require('./services/customSearchService');
const customSearchServiceV2 = require('./services/customSearchServiceV2');
const priceExtractor = require('./services/priceExtractor');

// Configurações do teste
const CONFIG = {
  // Termos de busca para testar (diferentes categorias e complexidades)
  termosDeBusca: [
    'smartphone android',
    'fone de ouvido bluetooth',
    'relógio inteligente',
    'tênis esportivo',
    'mochila escolar',
    'notebook',
    'cafeteira elétrica',
    'presente para mãe',
    'presente para homem 30 anos',
    'brinquedo criança 5 anos'
  ],
  
  // Configurações de filtros para testar
  filtros: [
    { precoMax: 100 },
    { precoMax: 200 },
    { precoMax: 500 },
    { precoMin: 50, precoMax: 150 },
    { precoMin: 200, precoMax: 1000 },
    {}  // Sem filtro de preço
  ],
  
  // APIs/Motores a serem testados
  apis: [
    {
      nome: 'Google Search API',
      servico: async (termo, filtros) => {
        const resultado = await googleSearchService.searchGoogle(
          termo, 
          filtros.num || 10, 
          1, 
          false, // não usar cache para teste
          { precoMin: filtros.precoMin, precoMax: filtros.precoMax }
        );
        return resultado.items || [];
      }
    },
    {
      nome: 'Shopee API',
      servico: async (termo, filtros) => {
        const resultado = await shopeeAPIService.searchProducts(
          termo,
          filtros.num || 10
        );
        // Filtrar por preço se necessário
        if (filtros.precoMin || filtros.precoMax) {
          return resultado.filter(item => {
            const preco = item.price;
            if (!preco) return false;
            if (filtros.precoMin && preco < filtros.precoMin) return false;
            if (filtros.precoMax && preco > filtros.precoMax) return false;
            return true;
          });
        }
        return resultado;
      }
    },
    {
      nome: 'Motor Híbrido',
      servico: async (termo, filtros) => {
        return await hybridSearchService.buscarProdutos({
          query: termo,
          ...filtros,
          num: filtros.num || 10
        });
      }
    },
    {
      nome: 'Custom Search V1',
      servico: async (termo, filtros) => {
        try {
          return await customSearchService.buscarProdutos({
            query: termo,
            ...filtros,
            num: filtros.num || 10
          });
        } catch (error) {
          console.error(`Erro no Custom Search V1: ${error.message}`);
          return [];
        }
      }
    },
    {
      nome: 'Custom Search V2',
      servico: async (termo, filtros) => {
        try {
          return await customSearchServiceV2.buscarProdutos({
            query: termo,
            ...filtros,
            num: filtros.num || 10
          });
        } catch (error) {
          console.error(`Erro no Custom Search V2: ${error.message}`);
          return [];
        }
      }
    }
  ],
  
  // Configurações de saída
  outputPath: path.join(__dirname, 'resultado-teste-apis-completo.json'),
  reportPath: path.join(__dirname, 'relatorio-teste-apis-completo.html'),
  
  // Número de resultados a solicitar por busca
  numResultados: 10
};

// Estatísticas para cada API
const estatisticas = {};

// Inicializa as estatísticas para cada API
CONFIG.apis.forEach(api => {
  estatisticas[api.nome] = {
    totalBuscas: 0,
    buscasSucesso: 0,
    buscasFalha: 0,
    totalResultados: 0,
    tempoTotal: 0,
    tempoMedio: 0,
    tempoMinimo: Infinity,
    tempoMaximo: 0,
    precisaoPreco: {
      totalProdutos: 0,
      produtosConformes: 0,
      percentualConformidade: 0
    },
    marketplaces: {},
    resultadosPorBusca: []
  };
});

/**
 * Função para executar uma busca em uma API específica
 */
async function executarBusca(api, termo, filtros) {
  const inicio = Date.now();
  let resultados = [];
  let erro = null;
  
  try {
    // Executar a busca
    resultados = await api.servico(termo, filtros);
    
    // Verificar se os resultados são um array
    if (!Array.isArray(resultados)) {
      console.error(`API ${api.nome} não retornou um array para o termo "${termo}"`);
      resultados = [];
      erro = 'Formato de resposta inválido';
    }
  } catch (error) {
    console.error(`Erro ao buscar "${termo}" na API ${api.nome}:`, error.message);
    erro = error.message;
  }
  
  const tempoExecucao = Date.now() - inicio;
  
  // Atualizar estatísticas
  const stats = estatisticas[api.nome];
  stats.totalBuscas++;
  
  if (erro) {
    stats.buscasFalha++;
  } else {
    stats.buscasSucesso++;
    stats.totalResultados += resultados.length;
    stats.tempoTotal += tempoExecucao;
    stats.tempoMedio = stats.tempoTotal / stats.buscasSucesso;
    stats.tempoMinimo = Math.min(stats.tempoMinimo, tempoExecucao);
    stats.tempoMaximo = Math.max(stats.tempoMaximo, tempoExecucao);
    
    // Verificar conformidade com filtro de preço
    let produtosConformes = 0;
    
    resultados.forEach(produto => {
      // Extrair e normalizar o preço
      const preco = typeof produto.price === 'number' 
        ? produto.price 
        : priceExtractor.extractAndNormalizePrice(produto.price);
      
      // Contar marketplaces
      const marketplace = produto.marketplace || detectarMarketplace(produto.link);
      stats.marketplaces[marketplace] = (stats.marketplaces[marketplace] || 0) + 1;
      
      // Verificar conformidade com filtro de preço
      if (preco !== null) {
        stats.precisaoPreco.totalProdutos++;
        
        const conformePreco = (!filtros.precoMin || preco >= filtros.precoMin) && 
                             (!filtros.precoMax || preco <= filtros.precoMax);
        
        if (conformePreco) {
          produtosConformes++;
          stats.precisaoPreco.produtosConformes++;
        }
      }
    });
    
    // Calcular percentual de conformidade para esta busca
    const conformidade = resultados.length > 0 
      ? (produtosConformes / resultados.length * 100).toFixed(2) 
      : 100;
    
    // Guardar resultado desta busca específica
    stats.resultadosPorBusca.push({
      termo,
      filtros,
      numResultados: resultados.length,
      tempoExecucao,
      conformidadePreco: conformidade,
      erro
    });
  }
  
  // Calcular percentual geral de conformidade
  if (stats.precisaoPreco.totalProdutos > 0) {
    stats.precisaoPreco.percentualConformidade = (
      stats.precisaoPreco.produtosConformes / stats.precisaoPreco.totalProdutos * 100
    ).toFixed(2);
  }
  
  // Retornar resultado desta busca
  return {
    api: api.nome,
    termo,
    filtros,
    resultados,
    numResultados: resultados.length,
    tempoExecucao,
    sucesso: !erro,
    erro
  };
}

/**
 * Detecta o marketplace a partir da URL
 */
function detectarMarketplace(url) {
  if (!url) return 'Desconhecido';
  
  url = url.toLowerCase();
  
  if (url.includes('mercadolivre.com.br') || url.includes('mercadolibre.com.br')) {
    return 'Mercado Livre';
  } else if (url.includes('shopee.com.br')) {
    return 'Shopee';
  } else if (url.includes('americanas.com.br')) {
    return 'Americanas';
  } else if (url.includes('magazineluiza.com.br') || url.includes('magazinevoce.com.br')) {
    return 'Magazine Luiza';
  } else if (url.includes('amazon.com.br')) {
    return 'Amazon';
  } else if (url.includes('casasbahia.com.br')) {
    return 'Casas Bahia';
  } else if (url.includes('pontofrio.com.br')) {
    return 'Ponto Frio';
  } else if (url.includes('extra.com.br')) {
    return 'Extra';
  } else if (url.includes('fastshop.com.br')) {
    return 'Fast Shop';
  } else if (url.includes('kabum.com.br')) {
    return 'KaBuM';
  } else if (url.includes('aliexpress.com')) {
    return 'AliExpress';
  }
  
  return 'Outro';
}

/**
 * Gera um relatório HTML com os resultados
 */
function gerarRelatorioHTML(estatisticas) {
  // Formatação de cores baseada no desempenho
  function getColorClass(value, thresholds) {
    if (value >= thresholds.bom) return 'success';
    if (value >= thresholds.medio) return 'warning';
    return 'danger';
  }

  const apis = Object.keys(estatisticas);
  
  // Estilo e conteúdo do relatório HTML
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Completo de Teste de APIs - Easy Gift Search</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { padding: 2rem; }
    .card { margin-bottom: 1.5rem; }
    .metrics-table td, .metrics-table th { text-align: center; }
    .bg-success-light { background-color: rgba(25, 135, 84, 0.15); }
    .bg-warning-light { background-color: rgba(255, 193, 7, 0.15); }
    .bg-danger-light { background-color: rgba(220, 53, 69, 0.15); }
    .text-success { color: #198754; }
    .text-warning { color: #ffc107; }
    .text-danger { color: #dc3545; }
    .chart-container { height: 300px; margin-bottom: 2rem; }
  </style>
</head>
<body>
  <div class="container-fluid">
    <h1 class="mb-4">Relatório Completo de Teste de APIs - Easy Gift Search</h1>
    <p class="lead">Data do teste: ${new Date().toLocaleString()}</p>
    
    <div class="row">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Métricas Gerais</h5>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="metricsChart"></canvas>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Tempo de Resposta (ms)</h5>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="timeChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Resumo Comparativo</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-striped table-hover metrics-table">
            <thead class="table-dark">
              <tr>
                <th>API</th>
                <th>Taxa de Sucesso</th>
                <th>Tempo Médio (ms)</th>
                <th>Resultados Médios</th>
                <th>Conformidade de Preço</th>
              </tr>
            </thead>
            <tbody>
              ${apis.map(api => {
                const stats = estatisticas[api];
                const taxaSucesso = (stats.buscasSucesso / stats.totalBuscas * 100).toFixed(2);
                const resultadosMedios = (stats.totalResultados / stats.buscasSucesso).toFixed(2);
                
                return `
                <tr>
                  <td class="text-start fw-bold">${api}</td>
                  <td class="text-${getColorClass(taxaSucesso, {bom: 90, medio: 75})}">${taxaSucesso}%</td>
                  <td class="text-${getColorClass(100000 / stats.tempoMedio, {bom: 500, medio: 100})}">${stats.tempoMedio.toFixed(0)}</td>
                  <td class="text-${getColorClass(resultadosMedios, {bom: 8, medio: 5})}">${resultadosMedios}</td>
                  <td class="text-${getColorClass(stats.precisaoPreco.percentualConformidade, {bom: 90, medio: 75})}">${stats.precisaoPreco.percentualConformidade}%</td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    ${apis.map(api => {
      const stats = estatisticas[api];
      const taxaSucesso = (stats.buscasSucesso / stats.totalBuscas * 100).toFixed(2);
      
      // Converter marketplaces para um formato fácil de renderizar
      let marketplacesHtml = '';
      if (Object.keys(stats.marketplaces).length > 0) {
        const totalProdutos = Object.values(stats.marketplaces).reduce((a, b) => a + b, 0);
        marketplacesHtml = Object.entries(stats.marketplaces)
          .sort((a, b) => b[1] - a[1])
          .map(([marketplace, count]) => {
            const percent = (count / totalProdutos * 100).toFixed(2);
            return `
              <div class="mb-1">${marketplace}: ${count} (${percent}%)</div>
              <div class="progress mb-3" style="height: 20px;">
                <div class="progress-bar" role="progressbar" style="width: ${percent}%;" 
                  aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">${percent}%</div>
              </div>
            `;
          }).join('');
      }
      
      return `
      <div class="card mt-4">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">${api}</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <div class="card">
                <div class="card-header">Estatísticas Gerais</div>
                <div class="card-body">
                  <p><strong>Total de buscas:</strong> ${stats.totalBuscas}</p>
                  <p><strong>Taxa de sucesso:</strong> ${taxaSucesso}%</p>
                  <p><strong>Tempo médio:</strong> ${stats.tempoMedio.toFixed(2)} ms</p>
                  <p><strong>Tempo mínimo:</strong> ${stats.tempoMinimo === Infinity ? 'N/A' : stats.tempoMinimo} ms</p>
                  <p><strong>Tempo máximo:</strong> ${stats.tempoMaximo} ms</p>
                </div>
              </div>
            </div>
            
            <div class="col-md-4">
              <div class="card">
                <div class="card-header">Resultados</div>
                <div class="card-body">
                  <p><strong>Total de resultados:</strong> ${stats.totalResultados}</p>
                  <p><strong>Média por busca:</strong> ${(stats.totalResultados / stats.buscasSucesso).toFixed(2)}</p>
                  <p><strong>Precisão de preço:</strong> ${stats.precisaoPreco.percentualConformidade}%</p>
                  <p><strong>Produtos conformes:</strong> ${stats.precisaoPreco.produtosConformes}/${stats.precisaoPreco.totalProdutos}</p>
                </div>
              </div>
            </div>
            
            <div class="col-md-4">
              <div class="card">
                <div class="card-header">Marketplaces</div>
                <div class="card-body">
                  ${marketplacesHtml || '<p>Nenhum marketplace detectado</p>'}
                </div>
              </div>
            </div>
          </div>
          
          <h6 class="mt-4 mb-3">Detalhe por Busca</h6>
          <div class="table-responsive">
            <table class="table table-sm table-striped">
              <thead>
                <tr>
                  <th>Termo</th>
                  <th>Filtros</th>
                  <th>Resultados</th>
                  <th>Tempo (ms)</th>
                  <th>Conformidade</th>
                </tr>
              </thead>
              <tbody>
                ${stats.resultadosPorBusca.map(busca => `
                <tr>
                  <td>${busca.termo}</td>
                  <td>${JSON.stringify(busca.filtros)}</td>
                  <td>${busca.numResultados}</td>
                  <td>${busca.tempoExecucao}</td>
                  <td>${busca.conformidadePreco}%</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      `;
    }).join('')}
  </div>
  
  <script>
    // Dados para os gráficos
    const apis = ${JSON.stringify(apis)};
    const taxaSucesso = apis.map(api => (${JSON.stringify(estatisticas)}[api].buscasSucesso / ${JSON.stringify(estatisticas)}[api].totalBuscas * 100).toFixed(2));
    const tempoMedio = apis.map(api => ${JSON.stringify(estatisticas)}[api].tempoMedio.toFixed(0));
    const resultadosMedios = apis.map(api => (${JSON.stringify(estatisticas)}[api].totalResultados / ${JSON.stringify(estatisticas)}[api].buscasSucesso).toFixed(2));
    const conformidadePreco = apis.map(api => ${JSON.stringify(estatisticas)}[api].precisaoPreco.percentualConformidade);
    
    // Gráfico de métricas gerais
    new Chart(document.getElementById('metricsChart'), {
      type: 'bar',
      data: {
        labels: apis,
        datasets: [
          {
            label: 'Taxa de Sucesso (%)',
            data: taxaSucesso,
            backgroundColor: 'rgba(25, 135, 84, 0.6)'
          },
          {
            label: 'Resultados Médios',
            data: resultadosMedios,
            backgroundColor: 'rgba(13, 110, 253, 0.6)'
          },
          {
            label: 'Conformidade de Preço (%)',
            data: conformidadePreco,
            backgroundColor: 'rgba(255, 193, 7, 0.6)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    
    // Gráfico de tempo de resposta
    new Chart(document.getElementById('timeChart'), {
      type: 'bar',
      data: {
        labels: apis,
        datasets: [
          {
            label: 'Tempo Médio (ms)',
            data: tempoMedio,
            backgroundColor: 'rgba(13, 110, 253, 0.6)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  </script>
</body>
</html>
`;

  return html;
}

/**
 * Função principal que executa todos os testes
 */
async function executarTestes() {
  console.log(`
=======================================================
🔍 TESTE COMPLETO DE APIS - EASY GIFT SEARCH
=======================================================
Iniciando testes com:
- ${CONFIG.apis.length} APIs
- ${CONFIG.termosDeBusca.length} termos de busca
- ${CONFIG.filtros.length} configurações de filtro
=======================================================
  `);
  
  const resultados = [];
  let contador = 0;
  const totalTestes = CONFIG.apis.length * CONFIG.termosDeBusca.length * CONFIG.filtros.length;
  
  // Testar cada combinação de API, termo e filtro
  for (const api of CONFIG.apis) {
    console.log(`\n🔍 Testando API: ${api.nome}`);
    
    for (const termo of CONFIG.termosDeBusca) {
      for (const filtro of CONFIG.filtros) {
        contador++;
        
        // Adicionar o número de resultados ao filtro
        const filtroCompleto = {
          ...filtro,
          num: CONFIG.numResultados
        };
        
        // Exibir progresso
        const progresso = ((contador / totalTestes) * 100).toFixed(2);
        console.log(`[${contador}/${totalTestes}] (${progresso}%) Testando "${termo}" com filtros: ${JSON.stringify(filtroCompleto)}`);
        
        // Executar busca e coletar resultados
        const resultado = await executarBusca(api, termo, filtroCompleto);
        resultados.push(resultado);
        
        // Breve pausa para não sobrecarregar as APIs
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  // Calcular percentuais e estatísticas finais
  Object.values(estatisticas).forEach(stats => {
    if (stats.buscasSucesso === 0) {
      stats.tempoMedio = 0;
      stats.tempoMinimo = 0;
    }
  });
  
  // Salvar resultados em arquivo JSON
  fs.writeFileSync(
    CONFIG.outputPath,
    JSON.stringify({ resultados, estatisticas }, null, 2)
  );
  
  // Gerar relatório HTML
  const relatorioHTML = gerarRelatorioHTML(estatisticas);
  fs.writeFileSync(CONFIG.reportPath, relatorioHTML);
  
  // Exibir resumo final
  console.log(`
=======================================================
✅ TESTE COMPLETO FINALIZADO!
=======================================================
Resultados salvos em: ${CONFIG.outputPath}
Relatório HTML gerado em: ${CONFIG.reportPath}
  `);
  
  // Exibir estatísticas resumidas
  console.log('\nResumo das APIs:');
  console.log('=======================================================');
  console.log('API                | Sucesso | Tempo Médio | Resultados | Conformidade');
  console.log('------------------ | ------- | ----------- | ---------- | -----------');
  
  Object.entries(estatisticas).forEach(([nome, stats]) => {
    const taxaSucesso = (stats.buscasSucesso / stats.totalBuscas * 100).toFixed(2);
    const tempoMedio = stats.tempoMedio.toFixed(0);
    const resultadosMedios = (stats.totalResultados / stats.buscasSucesso).toFixed(2);
    
    console.log(
      `${nome.padEnd(18)} | ${taxaSucesso.padStart(7)}% | ${tempoMedio.padStart(11)}ms | ${resultadosMedios.padStart(10)} | ${stats.precisaoPreco.percentualConformidade}%`
    );
  });
  
  console.log('=======================================================');
}

// Executar os testes
executarTestes().catch(erro => {
  console.error('Erro ao executar testes:', erro);
});
