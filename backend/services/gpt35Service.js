const axios = require('axios');
const https = require('https');
require('dotenv').config();

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * Serviço para integração com Open AI32 GPT-3.5 API via RapidAPI
 * API: https://open-ai32.p.rapidapi.com/conversationgpt35
 */

/**
 * Gera resposta usando GPT-3.5 (Open AI32)
 * @param {Object} params - Parâmetros da consulta
 * @param {string} params.message - Mensagem/pergunta para a IA
 * @param {boolean} params.webAccess - Se deve usar acesso à web
 * @returns {Promise<Object>} Resposta da IA
 */
async function gerarRespostaGPT35(params) {
  try {
    const { message, webAccess = false } = params;
    if (!process.env.RAPIDAPI_KEY_NEW) {
      throw new Error('RAPIDAPI_KEY_NEW não configurada');
    }
    const requestConfig = {
      method: 'POST',
      url: 'https://open-ai32.p.rapidapi.com/conversationgpt35',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'open-ai32.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY_NEW
      },
      data: {
        messages: [
          { role: 'user', content: message }
        ],
        web_access: webAccess
      },
      httpsAgent
    };
    const response = await axios(requestConfig);
    return response.data;
  } catch (error) {
    console.error('Erro ao chamar GPT-3.5 API:', error.message);
    throw error;
  }
}

module.exports = {
  gerarRespostaGPT35
};
