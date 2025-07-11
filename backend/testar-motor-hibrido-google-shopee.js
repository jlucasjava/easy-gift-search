/**
 * Script para testar o motor de busca híbrido com integração Google + Shopee
 * Este teste valida a integração entre Google Search API e Shopee API,
 * além de verificar a precisão do filtro de preços.
 */

const hybridSearchService = require('./services/hybridSearchService');
const priceExtractor = require('./services/priceExtractor');

// Configuração do teste
const TERMOS_TESTE = [
  'smartphone',
  'relógio inteligente',
  'headphone bluetooth',
  'tênis masculino',
  'mochila escolar'
];

const FILTROS_TESTE = [
  { precoMax: 100 },
  { precoMax: 200 },
  { precoMax: 500 },
  { precoMin: 100, precoMax: 300 }
];

// Função para executar uma busca e validar os resultados
async function executarBuscaEValidar(termo, filtros) {
  console.log(`\n======================================================`);
  console.log(`🔍 TESTE: "${termo}" com filtros: ${JSON.stringify(filtros)}`);
  console.log(`======================================================`);
  
  try {
    // Iniciar cronômetro
    const inicio = Date.now();
    
    // Executar busca
    const resultado = await hybridSearchService.buscarProdutos({
      query: termo,
      ...filtros,
      num: 20
    });
    
    // Calcular tempo
    const tempoExecucao = Date.now() - inicio;
    
    // Validar resultados
    console.log(`✅ Busca concluída em ${tempoExecucao}ms`);
    console.log(`📊 Total de resultados: ${resultado.length}`);
    
    // Verificar conformidade com filtros de preço
    let conformesPreco = 0;
    let naoConformesPreco = 0;
    
    for (const produto of resultado) {
      const preco = typeof produto.price === 'number' ? produto.price : priceExtractor.extractAndNormalizePrice(produto.price);
      
      if (preco === null) {
        console.log(`⚠️ Produto com preço não extraível: ${produto.title}`);
        naoConformesPreco++;
        continue;
      }
      
      // Verificar se está dentro da faixa de preço
      const dentroFaixa = (!filtros.precoMin || preco >= filtros.precoMin) && 
                          (!filtros.precoMax || preco <= filtros.precoMax);
      
      if (dentroFaixa) {
        conformesPreco++;
      } else {
        console.log(`❌ Produto fora da faixa de preço: ${produto.title} - R$ ${preco}`);
        naoConformesPreco++;
      }
    }
    
    // Estatísticas de origem
    const origens = {};
    resultado.forEach(produto => {
      const origem = produto.source || 'desconhecida';
      origens[origem] = (origens[origem] || 0) + 1;
    });
    
    // Mostrar estatísticas por marketplace
    const marketplaces = {};
    resultado.forEach(produto => {
      const marketplace = produto.marketplace || detectMarketplace(produto.link);
      marketplaces[marketplace] = (marketplaces[marketplace] || 0) + 1;
    });
    
    // Resumo
    console.log(`\n📈 RESUMO DOS RESULTADOS:`);
    console.log(`✓ Produtos conformes com filtro de preço: ${conformesPreco}/${resultado.length} (${Math.round(conformesPreco/resultado.length*100)}%)`);
    console.log(`✓ Produtos não conformes: ${naoConformesPreco}`);
    console.log(`\n📊 ORIGEM DOS RESULTADOS:`);
    Object.entries(origens).forEach(([origem, qtd]) => {
      console.log(`- ${origem}: ${qtd} produtos (${Math.round(qtd/resultado.length*100)}%)`);
    });
    console.log(`\n🛒 MARKETPLACE DOS RESULTADOS:`);
    Object.entries(marketplaces).forEach(([marketplace, qtd]) => {
      console.log(`- ${marketplace}: ${qtd} produtos (${Math.round(qtd/resultado.length*100)}%)`);
    });
    
    return {
      termo,
      filtros,
      totalResultados: resultado.length,
      conformesPreco,
      origens,
      marketplaces,
      tempoExecucao
    };
  } catch (error) {
    console.error(`❌ ERRO NO TESTE: ${error.message}`);
    return {
      termo,
      filtros,
      erro: error.message
    };
  }
}

// Detectar marketplace a partir da URL
function detectMarketplace(url) {
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
  }
  
  return 'Outro';
}

// Função principal
async function executarTestes() {
  console.log(`
  =========================================================
  🔍 TESTE DO MOTOR HÍBRIDO COM GOOGLE + SHOPEE
  =========================================================
  Iniciando testes com ${TERMOS_TESTE.length} termos e ${FILTROS_TESTE.length} configurações de filtro.
  `);
  
  const resultados = [];
  
  // Testar cada combinação de termo e filtro
  for (const termo of TERMOS_TESTE) {
    for (const filtro of FILTROS_TESTE) {
      const resultado = await executarBuscaEValidar(termo, filtro);
      resultados.push(resultado);
    }
  }
  
  // Estatísticas gerais
  const sucessos = resultados.filter(r => !r.erro).length;
  const falhas = resultados.filter(r => r.erro).length;
  
  // Calcular taxa de conformidade com filtros de preço
  const conformidadeMedia = resultados
    .filter(r => r.totalResultados > 0)
    .reduce((acc, r) => acc + (r.conformesPreco / r.totalResultados), 0) 
    / resultados.filter(r => r.totalResultados > 0).length;
  
  // Resumo final
  console.log(`\n
  =========================================================
  📊 RESUMO FINAL DOS TESTES
  =========================================================
  
  ✓ Total de testes: ${resultados.length}
  ✓ Testes com sucesso: ${sucessos} (${Math.round(sucessos/resultados.length*100)}%)
  ✓ Testes com falha: ${falhas} (${Math.round(falhas/resultados.length*100)}%)
  
  📈 Conformidade média com filtros de preço: ${Math.round(conformidadeMedia*100)}%
  
  🕒 Teste concluído em: ${new Date().toLocaleString()}
  `);
}

// Executar os testes
executarTestes().catch(console.error);
