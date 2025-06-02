const axios = require('axios');
const https = require('https');
require('dotenv').config();

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * Serviço para integração com Meta Llama-2 API via RapidAPI
 * API: https://meta-llama-2-ai.p.rapidapi.com/
 */

/**
 * Gera resposta usando Meta Llama-2
 * @param {Object} params - Parâmetros da consulta
 * @param {string} params.model - Nome do modelo (ex: meta-llama/Llama-2-70b-chat-hf)
 * @param {Array} params.messages - Mensagens para o chat
 * @returns {Promise<Object>} Resposta da IA
 */
async function gerarRespostaLlama2(params) {
  try {
    const { model = 'meta-llama/Llama-2-70b-chat-hf', messages } = params;
    if (!process.env.RAPIDAPI_KEY_NEW) {
      throw new Error('RAPIDAPI_KEY_NEW não configurada');
    }
    const requestConfig = {
      method: 'POST',
      url: 'https://meta-llama-2-ai.p.rapidapi.com/',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'meta-llama-2-ai.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY_NEW
      },
      data: {
        model,
        messages
      },
      httpsAgent
    };
    const response = await axios(requestConfig);
    return response.data;
  } catch (error) {
    console.error('Erro ao chamar Meta Llama-2 API:', error.message);
    throw error;
  }
}

module.exports = {
  gerarRespostaLlama2
};
