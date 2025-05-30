
const axios = require('axios');
const https = require('https');
require('dotenv').config();

// Configuração para ignorar problemas de certificado SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * Serviço para integração com Open AI 21 Llama API via RapidAPI
 * API: https://open-ai21.p.rapidapi.com/conversationllama
 */

/**
 * Gera recomendações de presentes usando Llama AI
 * @param {Object} params - Parâmetros da consulta
 * @param {string} params.message - Mensagem/pergunta para a IA
 * @param {boolean} params.webAccess - Se deve usar acesso à web
 * @returns {Promise<Object>} Resposta da IA
 */
async function gerarRecomendacaoLlama(params) {
  try {
    const { message, webAccess = false } = params;
    
    if (!process.env.RAPIDAPI_KEY_NEW) {
      throw new Error('RAPIDAPI_KEY_NEW não configurada');
    }

    const requestConfig = {
      method: 'POST',
      url: 'https://open-ai21.p.rapidapi.com/conversationllama',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'open-ai21.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY_NEW
      },
      data: {
        messages: [
          {
            role: "user",
            content: message
          }
        ],
        web_access: webAccess
      },
      timeout: 15000,
      httpsAgent
    };

    console.log('🦙 Fazendo requisição para Llama API...');
    const response = await axios(requestConfig);

    if (response.data) {
      console.log('✅ Resposta recebida da Llama API');
      return {
        sucesso: true,
        fonte: 'Llama AI (Open AI 21)',
        resposta: response.data,
        timestamp: new Date().toISOString()
      };
    } else {
      throw new Error('Resposta vazia da API');
    }

  } catch (error) {
    console.error('❌ Erro na Llama API:', error.message);
    
    // Retorna resposta de fallback
    return {
      sucesso: false,
      fonte: 'Fallback Local',
      erro: error.message,
      resposta: {
        choices: [{
          message: {
            content: "Desculpe, não foi possível gerar uma recomendação no momento. Tente novamente mais tarde."
          }
        }]
      },
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Gera sugestões de presentes baseadas em perfil
 * @param {Object} perfil - Perfil da pessoa
 * @param {string} perfil.idade - Idade da pessoa
 * @param {string} perfil.genero - Gênero da pessoa
 * @param {string} perfil.interesses - Interesses da pessoa
 * @param {number} perfil.orcamento - Orçamento disponível
 * @returns {Promise<Object>} Recomendações de presentes
 */
async function sugerirPresentes(perfil) {
  const { idade, genero, interesses, orcamento } = perfil;
  
  const message = `Preciso de sugestões de presentes para uma pessoa com as seguintes características:
- Idade: ${idade} anos
- Gênero: ${genero}
- Interesses: ${interesses}
- Orçamento: R$ ${orcamento}

Por favor, sugira 5 ideias de presentes específicas, com nome do produto, preço estimado e onde encontrar. Responda em português brasileiro.`;

  return await gerarRecomendacaoLlama({ message, webAccess: true });
}

/**
 * Testa a conexão com a API Llama
 * @returns {Promise<Object>} Resultado do teste
 */
async function testarAPILlama() {
  console.log('🧪 Testando API Llama...');
  
  const resultado = await gerarRecomendacaoLlama({
    message: "Olá! Você pode me ajudar com sugestões de presentes?",
    webAccess: false
  });

  return {
    ...resultado,
    configuracao: {
      rapidapi_key_configurada: !!process.env.RAPIDAPI_KEY_NEW,
      use_llama_api: process.env.USE_LLAMA_API === 'true'
    }
  };
}

module.exports = {
  gerarRecomendacaoLlama,
  sugerirPresentes,
  testarAPILlama
};
