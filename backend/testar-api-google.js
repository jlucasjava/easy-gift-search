/**
 * Script para testar a API do Google Custom Search
 * Este script verifica se a API está configurada corretamente e faz uma chamada de teste
 */

const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
dotenv.config();

// Verificar a configuração
console.log('🔍 Verificando configuração da API Google Custom Search...');
console.log('===================================================');

const config = {
  GOOGLE_SEARCH_API_KEY: process.env.GOOGLE_SEARCH_API_KEY,
  GOOGLE_SEARCH_CX: process.env.GOOGLE_SEARCH_CX,
  USE_GOOGLE_SEARCH_API: process.env.USE_GOOGLE_SEARCH_API === 'true'
};

// Verificar se as chaves estão configuradas
if (!config.GOOGLE_SEARCH_API_KEY) {
  console.error('❌ ERRO: GOOGLE_SEARCH_API_KEY não configurada');
  console.log('Por favor, verifique seu arquivo .env');
  process.exit(1);
}

if (!config.GOOGLE_SEARCH_CX) {
  console.error('❌ ERRO: GOOGLE_SEARCH_CX não configurado');
  console.log('Por favor, verifique seu arquivo .env');
  process.exit(1);
}

if (!config.USE_GOOGLE_SEARCH_API) {
  console.error('❌ ERRO: USE_GOOGLE_SEARCH_API não está definido como true');
  console.log('Por favor, verifique seu arquivo .env');
  process.exit(1);
}

console.log('✅ Todas as variáveis de ambiente necessárias estão configuradas');
console.log(`API Key: ${config.GOOGLE_SEARCH_API_KEY.substring(0, 10)}...`);
console.log(`CX ID: ${config.GOOGLE_SEARCH_CX}`);
console.log(`API Ativada: ${config.USE_GOOGLE_SEARCH_API}`);
console.log('===================================================');

// Fazer uma chamada de teste para a API
console.log('\n🧪 Testando a API com uma consulta simples...');

async function testGoogleAPI() {
  try {
    const query = 'presente tecnologia';
    const url = 'https://www.googleapis.com/customsearch/v1';
    
    const params = {
      key: config.GOOGLE_SEARCH_API_KEY,
      cx: config.GOOGLE_SEARCH_CX,
      q: query,
      num: 1
    };
    
    console.log(`Enviando consulta: "${query}"`);
    const response = await axios.get(url, { params });
    
    if (response.data && response.data.items && response.data.items.length > 0) {
      console.log('✅ API respondeu com sucesso!');
      console.log(`Resultados encontrados: ${response.data.items.length}`);
      console.log(`Primeiro resultado: ${response.data.items[0].title}`);
      
      // Salvar o status no arquivo
      const statusFile = path.join(__dirname, 'google-api-status.json');
      fs.writeFileSync(statusFile, JSON.stringify({
        status: 'success',
        timestamp: new Date().toISOString(),
        configuration: {
          apiKeyConfigured: true,
          cxConfigured: true,
          apiEnabled: true
        },
        testResults: {
          query,
          resultsCount: response.data.items.length,
          firstResultTitle: response.data.items[0].title
        }
      }, null, 2));
      
      console.log(`\nStatus salvo em: ${statusFile}`);
      console.log('\n✅ A API do Google Custom Search está configurada corretamente e funcionando!');
      
      return true;
    } else {
      console.error('❌ API respondeu, mas não retornou resultados');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar a API:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Mensagem: ${JSON.stringify(error.response.data)}`);
      
      // Verificar erros comuns
      if (error.response.status === 403) {
        console.log('\n⚠️ ERRO 403: Acesso negado. Causas possíveis:');
        console.log('1. A chave API não está ativada para o Google Custom Search');
        console.log('2. Você excedeu a cota diária gratuita (100 consultas)');
        console.log('3. A conta associada à chave API não tem billing ativado');
      } else if (error.response.status === 400) {
        console.log('\n⚠️ ERRO 400: Requisição inválida. Causas possíveis:');
        console.log('1. O CX (ID do mecanismo de busca personalizado) está incorreto');
        console.log('2. Parâmetros da requisição estão incorretos');
      }
    } else {
      console.error(`Erro: ${error.message}`);
    }
    
    return false;
  }
}

testGoogleAPI();
