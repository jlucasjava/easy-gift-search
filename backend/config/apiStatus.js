// API Status Configuration - Google Search API only
require('dotenv').config();

/**
 * Display API configuration status on server startup
 */
function displayAPIStatus() {
  console.log('\n🚀 ============= EASY GIFT SEARCH - API STATUS =============');
  console.log(`📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('');

  // Google Search API Status
  const googleSearchEnabled = process.env.USE_GOOGLE_SEARCH_API === 'true';
  const googleSearchKey = !!process.env.GOOGLE_SEARCH_API_KEY;
  const googleSearchCX = !!process.env.GOOGLE_SEARCH_CX;

  console.log('� GOOGLE CUSTOM SEARCH:');
  if (googleSearchEnabled && googleSearchKey && googleSearchCX) {
    console.log('   ✅ ATIVA - Usando Google Custom Search API');
    console.log('   🔑 GOOGLE_SEARCH_API_KEY configurada');
    console.log('   🔑 GOOGLE_SEARCH_CX configurado');
  } else if (googleSearchEnabled && (!googleSearchKey || !googleSearchCX)) {
    console.log('   ⚠️ CONFIGURAÇÃO INCOMPLETA - USE_GOOGLE_SEARCH_API=true mas chaves necessárias não encontradas');
    if (!googleSearchKey) console.log('   ❌ GOOGLE_SEARCH_API_KEY não configurada');
    if (!googleSearchCX) console.log('   ❌ GOOGLE_SEARCH_CX não configurado');
  } else {
    console.log('   ❌ INATIVA - Google Custom Search API não habilitada');
  }

  console.log('');
  console.log('🔑 CHAVES DE API:');
  console.log(`   GOOGLE_SEARCH_API_KEY: ${process.env.GOOGLE_SEARCH_API_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log(`   GOOGLE_SEARCH_CX: ${process.env.GOOGLE_SEARCH_CX ? '✅ Configurado' : '❌ Não configurado'}`);

  console.log('');
  console.log('⚙️ CONFIGURAÇÕES:');
  console.log(`   USE_GOOGLE_SEARCH_API: ${process.env.USE_GOOGLE_SEARCH_API || 'false'}`);

  console.log('');
  if (googleSearchEnabled && googleSearchKey && googleSearchCX) {
    console.log('🎉 STATUS GERAL: GOOGLE CUSTOM SEARCH API ATIVA');
  } else {
    console.log('⚠️ STATUS GERAL: GOOGLE CUSTOM SEARCH API NÃO CONFIGURADA CORRETAMENTE');
  }
  
  console.log('==========================================================\n');
}

/**
 * Check if Google Search API key is configured
 */
function validateAPIConfiguration() {
  const missingKeys = [];
  
  if (process.env.USE_GOOGLE_SEARCH_API === 'true') {
    if (!process.env.GOOGLE_SEARCH_API_KEY) {
      missingKeys.push('GOOGLE_SEARCH_API_KEY (para Google Custom Search)');
    }
    if (!process.env.GOOGLE_SEARCH_CX) {
      missingKeys.push('GOOGLE_SEARCH_CX (para Google Custom Search)');
    }
  }
  if (missingKeys.length > 0) {
    console.log('⚠️ ATENÇÃO: Chaves de API faltando:');
    missingKeys.forEach(key => console.log(`   ❌ ${key}`));
    console.log('🔧 A API do Google Custom Search pode não funcionar corretamente.\n');
  }
}

/**
 * Verifica o status da API do Google Custom Search
 * @returns {Promise<Object>} Status da API
 */
async function verificarStatusGoogleSearch() {
  try {
    const googleSearchEnabled = process.env.USE_GOOGLE_SEARCH_API === 'true';
    const googleSearchKey = !!process.env.GOOGLE_SEARCH_API_KEY;
    const googleSearchCX = !!process.env.GOOGLE_SEARCH_CX;

    // Verificar se a API está ativada e configurada
    if (!googleSearchEnabled) {
      return {
        ativo: false,
        mensagem: 'API do Google Custom Search não está ativada (USE_GOOGLE_SEARCH_API=false)'
      };
    }

    if (!googleSearchKey || !googleSearchCX) {
      return {
        ativo: false,
        mensagem: 'Configuração incompleta - Chaves de API ausentes',
        detalhes: {
          GOOGLE_SEARCH_API_KEY: googleSearchKey ? 'Configurada' : 'Não configurada',
          GOOGLE_SEARCH_CX: googleSearchCX ? 'Configurado' : 'Não configurado'
        }
      };
    }

    // Testar se a API está funcionando com uma consulta simples
    const googleSearchService = require('../services/googleSearchService');
    const resultado = await googleSearchService.testarAPIsGoogle();

    if (resultado.sucesso) {
      return {
        ativo: true,
        mensagem: 'Google Custom Search API está operacional',
        detalhes: {
          resultados: resultado.resultados,
          timestamp: resultado.timestamp
        }
      };
    } else {
      return {
        ativo: false,
        mensagem: `Erro na API: ${resultado.erro || 'Falha no teste'}`,
        detalhes: resultado
      };
    }
  } catch (error) {
    return {
      ativo: false,
      mensagem: `Erro ao verificar status: ${error.message}`,
      erro: error.message
    };
  }
}

module.exports = {
  displayAPIStatus,
  validateAPIConfiguration,
  verificarStatusGoogleSearch
};
