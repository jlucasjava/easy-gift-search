/**
 * Controller para o motor de busca personalizado V2
 * Oferece endpoints para usar o motor de busca avançado
 */

const customSearchServiceV2 = require('../services/customSearchServiceV2');
const googleSearchService = require('../services/googleSearchService');

/**
 * Busca produtos usando o motor personalizado V2
 */
exports.buscarPersonalizado = async (req, res) => {
  try {
    console.log('[CustomSearchV2] Requisição recebida:', req.query);
    
    const { query, precoMin, precoMax, idade, genero, num = 10 } = req.query;
    
    if (!query && !genero && !idade) {
      return res.status(400).json({
        erro: 'É necessário fornecer pelo menos um parâmetro de busca (query, genero ou idade)'
      });
    }
    
    const filtros = {
      query: query,
      precoMin: precoMin ? parseInt(precoMin) : undefined,
      precoMax: precoMax ? parseInt(precoMax) : undefined,
      idade: idade,
      genero: genero,
      num: parseInt(num)
    };
    
    // Executar busca com o motor V2
    const inicio = Date.now();
    const produtos = await customSearchServiceV2.buscarProdutos(filtros);
    const tempoExecucao = Date.now() - inicio;
    
    const resultado = {
      sucesso: true,
      query: query || 'personalizado',
      totalResultados: produtos.length,
      produtos: produtos,
      fonte: 'Motor de Busca Personalizado V2',
      filtros: filtros,
      tempoExecucao: `${tempoExecucao}ms`,
      timestamp: new Date().toISOString()
    };
    
    console.log('[CustomSearchV2] Resposta enviada:', {
      sucesso: resultado.sucesso,
      totalResultados: resultado.totalResultados,
      tempo: resultado.tempoExecucao
    });
    
    res.json(resultado);
  } catch (error) {
    console.error('[CustomSearchV2] Erro no controller:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Busca comparativa entre Google e motor personalizado V2
 */
exports.buscaComparativa = async (req, res) => {
  try {
    console.log('[BuscaComparativaV2] Requisição recebida:', req.query);
    
    const { query, precoMax, idade, genero, num = 5 } = req.query;
    
    if (!query && !genero && !idade) {
      return res.status(400).json({
        erro: 'É necessário fornecer pelo menos um parâmetro de busca (query, genero ou idade)'
      });
    }
    
    // Construir filtros para a busca
    const filtrosGoogle = {
      categoria: query,
      precoMax: precoMax ? parseInt(precoMax) : undefined,
      idade,
      genero,
      num: parseInt(num)
    };
    
    const filtrosCustom = {
      query,
      precoMax: precoMax ? parseInt(precoMax) : undefined,
      idade,
      genero,
      num: parseInt(num)
    };
    
    // Executar ambas as buscas em paralelo com medição de tempo
    const inicioGoogle = Date.now();
    const inicioCustom = Date.now();
    
    const [resultadoGoogle, resultadoCustom] = await Promise.all([
      googleSearchService.buscarPresentesGoogle(filtrosGoogle)
        .catch(err => {
          console.error('[BuscaComparativaV2] Erro na busca Google:', err.message);
          return { sucesso: false, erro: err.message, produtos: [] };
        }),
      customSearchServiceV2.buscarProdutos(filtrosCustom)
        .catch(err => {
          console.error('[BuscaComparativaV2] Erro na busca Personalizada:', err.message);
          return [];
        })
    ]);
    
    const tempoGoogle = Date.now() - inicioGoogle;
    const tempoCustom = Date.now() - inicioCustom;
    
    // Formatar resposta
    const resposta = {
      sucesso: true,
      termo_busca: query || 'personalizado',
      filtros: {
        precoMax,
        idade,
        genero
      },
      google: {
        produtos: resultadoGoogle.produtos || [],
        total: resultadoGoogle.produtos?.length || 0,
        fonte: 'Google Custom Search API',
        tempo: `${tempoGoogle}ms`,
        sucesso: resultadoGoogle.sucesso !== false
      },
      personalizado: {
        produtos: resultadoCustom || [],
        total: resultadoCustom?.length || 0,
        fonte: 'Motor de Busca Personalizado V2',
        tempo: `${tempoCustom}ms`,
        sucesso: true
      },
      vencedor: determinaVencedor(resultadoGoogle, resultadoCustom, tempoGoogle, tempoCustom),
      timestamp: new Date().toISOString()
    };
    
    console.log('[BuscaComparativaV2] Resposta enviada:', {
      sucesso: resposta.sucesso,
      total_google: resposta.google.total,
      total_personalizado: resposta.personalizado.total,
      vencedor: resposta.vencedor.nome
    });
    
    res.json(resposta);
  } catch (error) {
    console.error('[BuscaComparativaV2] Erro na busca comparativa:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Determina qual motor de busca teve melhor desempenho
 */
function determinaVencedor(resultadoGoogle, resultadoCustom, tempoGoogle, tempoCustom) {
  const produtosGoogle = resultadoGoogle.produtos || [];
  const produtosCustom = resultadoCustom || [];
  
  // Critérios de avaliação
  const pontuacaoGoogle = calcularPontuacao(produtosGoogle, tempoGoogle, resultadoGoogle.sucesso !== false);
  const pontuacaoCustom = calcularPontuacao(produtosCustom, tempoCustom, true);
  
  console.log(`📊 Pontuação: Google=${pontuacaoGoogle.toFixed(2)}, Personalizado=${pontuacaoCustom.toFixed(2)}`);
  
  if (pontuacaoGoogle > pontuacaoCustom) {
    return {
      nome: 'Google Search API',
      motivo: 'Mais resultados ou melhor qualidade',
      pontuacao: pontuacaoGoogle.toFixed(2)
    };
  } else if (pontuacaoCustom > pontuacaoGoogle) {
    return {
      nome: 'Motor Personalizado V2',
      motivo: 'Mais resultados ou melhor qualidade',
      pontuacao: pontuacaoCustom.toFixed(2)
    };
  } else {
    return {
      nome: 'Empate',
      motivo: 'Ambos os motores tiveram desempenho similar',
      pontuacao: pontuacaoGoogle.toFixed(2)
    };
  }
}

/**
 * Calcula a pontuação de um motor de busca
 */
function calcularPontuacao(produtos, tempo, sucesso) {
  if (!sucesso) return 0;
  if (!produtos.length) return 0;
  
  // Base: número de produtos encontrados (máx 10 pontos)
  let pontuacao = Math.min(produtos.length, 10);
  
  // Qualidade dos produtos (com preço e imagem) (máx 5 pontos)
  const produtosComPreco = produtos.filter(p => p.price).length;
  const produtosComImagem = produtos.filter(p => p.image).length;
  
  pontuacao += (produtosComPreco / produtos.length) * 2.5;
  pontuacao += (produtosComImagem / produtos.length) * 2.5;
  
  // Penalização por tempo (quanto mais rápido, melhor)
  // Máximo 3 segundos - acima disso começa a perder pontos
  const penalizacaoTempo = Math.max(0, (tempo - 3000) / 1000) * 0.5;
  pontuacao = Math.max(0, pontuacao - penalizacaoTempo);
  
  return pontuacao;
}

/**
 * Limpa o cache do motor personalizado V2
 */
exports.limparCache = async (req, res) => {
  try {
    const itemsRemovidos = customSearchServiceV2.limparCache();
    
    res.json({
      sucesso: true,
      mensagem: `Cache limpo com sucesso: ${itemsRemovidos} itens removidos`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[LimparCache] Erro ao limpar cache:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Endpoint para debug e análise de desempenho
 */
exports.analisarDesempenho = async (req, res) => {
  try {
    // Obter estatísticas de cache
    const estatisticasCache = customSearchServiceV2.obterEstatisticasCache();
    
    res.json({
      sucesso: true,
      estatisticas_cache: {
        total_itens: estatisticasCache.itemCount,
        stats: estatisticasCache.stats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[AnalisarDesempenho] Erro:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

module.exports = exports;
