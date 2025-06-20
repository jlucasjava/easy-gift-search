/**
 * Script para monitorar a API do Google Custom Search
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');

// Arquivo de log para armazenar histórico de uso
const logFile = path.join(__dirname, 'google-api-usage.log');

// Configuração
const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_SEARCH_CX;
const LIMITE_DIARIO = 100; // Limite padrão do plano gratuito

// Endpoint para monitoramento de API
async function checkApiQuota() {
  if (!GOOGLE_API_KEY) {
    console.error(colors.red('❌ GOOGLE_SEARCH_API_KEY não configurada'));
    return { error: 'API_KEY não configurada', remaining: 0, limit: LIMITE_DIARIO };
  }

  if (!GOOGLE_CX) {
    console.error(colors.red('❌ GOOGLE_SEARCH_CX não configurada'));
    return { error: 'CX não configurado', remaining: 0, limit: LIMITE_DIARIO };
  }

  try {
    // Fazer uma consulta mínima para verificar headers de quota
    const query = 'teste-api-quota';
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}&num=1`;
    
    const response = await axios.get(url);
    
    // Analisar headers (podem não estar disponíveis dependendo da implementação da API)
    const quotaLimit = response.headers['x-ratelimit-limit'] || LIMITE_DIARIO;
    const quotaRemaining = response.headers['x-ratelimit-remaining'];
    
    // Estimar uso com base em algoritmo próprio se headers não estiverem disponíveis
    const estimatedUsage = await estimateApiUsage();
    const remaining = quotaRemaining ? parseInt(quotaRemaining) : (LIMITE_DIARIO - estimatedUsage);
    
    // Registrar uso no log
    logApiUsage(remaining, quotaLimit);
    
    return {
      success: true,
      remaining: remaining,
      limit: parseInt(quotaLimit),
      usage: LIMITE_DIARIO - remaining,
      usagePercent: Math.round(((LIMITE_DIARIO - remaining) / LIMITE_DIARIO) * 100),
      resetTime: getNextResetTime()
    };
    
  } catch (error) {
    console.error(colors.red(`❌ Erro ao verificar quota da API: ${error.message}`));
    
    // Analisar o erro para entender o status da API
    if (error.response) {
      const { status, data } = error.response;
      
      // Quota excedida
      if (status === 403 && data.error?.status === 'RESOURCE_EXHAUSTED') {
        return { 
          error: 'Quota da API excedida', 
          remaining: 0, 
          limit: LIMITE_DIARIO,
          usagePercent: 100,
          resetTime: getNextResetTime()
        };
      }
      
      // Outros erros da API
      return { 
        error: `Erro da API (${status}): ${data.error?.message || 'Erro desconhecido'}`, 
        remaining: '?', 
        limit: LIMITE_DIARIO,
        status: status
      };
    }
    
    return { 
      error: `Erro ao verificar quota: ${error.message}`, 
      remaining: '?', 
      limit: LIMITE_DIARIO 
    };
  }
}

// Estimar uso da API com base no log
async function estimateApiUsage() {
  try {
    // Verificar se o arquivo de log existe
    if (!fs.existsSync(logFile)) {
      return 0;
    }
    
    // Ler arquivo de log
    const logContent = fs.readFileSync(logFile, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    
    // Obter data atual
    const today = new Date().toISOString().split('T')[0];
    
    // Contar entradas de hoje
    const todayEntries = lines.filter(line => line.includes(today));
    
    // Analisar último valor registrado
    if (todayEntries.length > 0) {
      const lastEntry = todayEntries[todayEntries.length - 1];
      const match = lastEntry.match(/remaining: (\d+)/);
      if (match && match[1]) {
        const remaining = parseInt(match[1]);
        return LIMITE_DIARIO - remaining;
      }
    }
    
    return 0;
  } catch (error) {
    console.error(colors.red(`❌ Erro ao estimar uso da API: ${error.message}`));
    return 0;
  }
}

// Registrar uso da API no log
function logApiUsage(remaining, limit) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] limit: ${limit}, remaining: ${remaining}\n`;
    
    fs.appendFileSync(logFile, logEntry);
  } catch (error) {
    console.error(colors.red(`❌ Erro ao registrar uso da API: ${error.message}`));
  }
}

// Obter horário do próximo reset de quota
function getNextResetTime() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  return tomorrow.toISOString();
}

// Endpoint para obter estatísticas do cache
function getCacheStats(cache) {
  try {
    const stats = cache.getStats();
    const keys = cache.keys();
    
    return {
      success: true,
      hits: stats.hits,
      misses: stats.misses,
      keys: keys.length,
      keyList: keys,
      hitRate: stats.hits / (stats.hits + stats.misses || 1),
      ksize: stats.ksize,
      vsize: stats.vsize
    };
  } catch (error) {
    return { error: error.message };
  }
}

// Endpoint para limpar o cache
function clearCache(cache) {
  try {
    const keysCount = cache.keys().length;
    cache.flushAll();
    
    return {
      success: true,
      message: `Cache limpo com sucesso. ${keysCount} itens removidos.`
    };
  } catch (error) {
    return { 
      success: false,
      error: error.message 
    };
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkApiQuota().then(result => {
    console.log(colors.cyan('\n=== Status da API do Google Custom Search ==='));
    if (result.error) {
      console.log(colors.red(`Erro: ${result.error}`));
    } else {
      console.log(colors.green(`Consultas restantes: ${result.remaining}/${result.limit}`));
      console.log(colors.yellow(`Uso atual: ${result.usagePercent}%`));
      console.log(colors.gray(`Próximo reset: ${new Date(result.resetTime).toLocaleString()}`));
    }
  });
}

module.exports = {
  checkApiQuota,
  getCacheStats,
  clearCache,
  estimateApiUsage,
  getNextResetTime
};
