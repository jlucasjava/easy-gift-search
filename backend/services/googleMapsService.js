const axios = require('axios');
const https = require('https');
require('dotenv').config();

// Configuração para ignorar problemas de certificado SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * Serviço para integração com Google Maps API via RapidAPI
 * Permite busca de localizações e informações geográficas para melhorar recomendações
 */

/**
 * Busca informações de localização usando Google Maps API
 * @param {Object} params - Parâmetros da busca
 * @param {string} params.text - Texto a ser buscado
 * @param {string} params.place - Local de referência
 * @param {string} params.street - Rua específica
 * @param {string} params.city - Cidade
 * @param {string} params.country - País
 * @param {string} params.state - Estado/região
 * @param {string} params.postalcode - CEP
 * @param {string} params.latitude - Latitude
 * @param {string} params.longitude - Longitude
 * @param {string} params.radius - Raio de busca
 * @returns {Promise<Object>} Informações de localização
 */
async function buscarLocalizacao(params) {
  try {
    const {
      text,
      place = '',
      street = '',
      city = '',
      country = 'Brasil',
      state = '',
      postalcode = '',
      latitude = '',
      longitude = '',
      radius = ''
    } = params;

    if (!text) {
      throw new Error('Texto é obrigatório para busca de localização');
    }

    const requestData = {
      text,
      place,
      street,
      city,
      country,
      state,
      postalcode,
      latitude,
      longitude,
      radius
    };

    const config = {
      method: 'POST',
      url: 'https://google-api31.p.rapidapi.com/map',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'google-api31.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY_NEW || process.env.RAPIDAPI_KEY
      },
      data: requestData,
      httpsAgent,
      timeout: 10000
    };

    console.log('🗺️ Google Maps - Buscando localização:', text);
    const response = await axios(config);

    if (response.data) {
      return {
        sucesso: true,
        localizacao: {
          nome: response.data.name || text,
          endereco: response.data.formatted_address || place,
          coordenadas: {
            latitude: response.data.geometry?.location?.lat || latitude,
            longitude: response.data.geometry?.location?.lng || longitude
          },
          tipos: response.data.types || [],
          avaliacao: response.data.rating || null,
          fotos: response.data.photos || [],
          horarios: response.data.opening_hours || null,
          telefone: response.data.formatted_phone_number || null,
          website: response.data.website || null
        },
        fonte: 'Google Maps API',
        parametros: params
      };
    }

    throw new Error('Resposta inválida da API Google Maps');

  } catch (error) {
    console.error('❌ Erro Google Maps:', error.message);
    
    // Fallback com informações mock para demonstração
    return {
      sucesso: false,
      erro: error.message,
      localizacao: {
        nome: params.text,
        endereco: `${params.place || 'Local não especificado'}, ${params.city || 'Cidade'}, ${params.country || 'Brasil'}`,
        coordenadas: {
          latitude: params.latitude || '-23.5505',
          longitude: params.longitude || '-46.6333'
        },
        tipos: ['establishment', 'point_of_interest'],
        avaliacao: null,
        fotos: [],
        horarios: null,
        telefone: null,
        website: null
      },
      fonte: 'Google Maps API (Fallback)',
      parametros: params
    };
  }
}

/**
 * Busca lojas próximas a uma localização
 * @param {Object} params - Parâmetros da busca
 * @param {string} params.categoria - Tipo de loja (ex: 'shopping', 'eletrônicos')
 * @param {string} params.latitude - Latitude de referência
 * @param {string} params.longitude - Longitude de referência
 * @param {string} params.radius - Raio de busca em metros
 * @param {string} params.cidade - Cidade de referência
 * @returns {Promise<Object>} Lojas próximas
 */
async function buscarLojasProximas(params) {
  try {
    const { categoria, latitude, longitude, radius = '5000', cidade = 'São Paulo' } = params;
    
    const texto = `${categoria} loja shopping ${cidade}`;
    
    return await buscarLocalizacao({
      text: texto,
      place: cidade,
      latitude,
      longitude,
      radius,
      country: 'Brasil'
    });

  } catch (error) {
    console.error('❌ Erro busca lojas próximas:', error.message);
    throw error;
  }
}

/**
 * Busca centros comerciais e shopping centers
 * @param {Object} params - Parâmetros da busca
 * @param {string} params.cidade - Cidade para buscar
 * @param {string} params.estado - Estado/região
 * @returns {Promise<Object>} Shopping centers encontrados
 */
async function buscarShoppings(params) {
  try {
    const { cidade = 'São Paulo', estado = 'SP' } = params;
    
    return await buscarLocalizacao({
      text: 'shopping center mall',
      place: `${cidade}, ${estado}`,
      city: cidade,
      state: estado,
      country: 'Brasil'
    });

  } catch (error) {
    console.error('❌ Erro busca shoppings:', error.message);
    throw error;
  }
}

/**
 * Busca informações de entrega baseadas em localização
 * @param {Object} params - Parâmetros da busca
 * @param {string} params.cep - CEP de destino
 * @param {string} params.endereco - Endereço completo
 * @param {string} params.cidade - Cidade
 * @returns {Promise<Object>} Informações de entrega
 */
async function buscarInfoEntrega(params) {
  try {
    const { cep, endereco, cidade = 'São Paulo' } = params;
    
    const texto = endereco || `CEP ${cep}`;
    
    const resultado = await buscarLocalizacao({
      text: texto,
      place: cidade,
      postalcode: cep,
      city: cidade,
      country: 'Brasil'
    });

    // Adicionar informações estimadas de entrega
    if (resultado.sucesso) {
      resultado.entrega = {
        prazoEstimado: '2-5 dias úteis',
        valorFrete: 'A calcular',
        disponibilidade: 'Entrega disponível',
        expressa: 'Entrega expressa disponível'
      };
    }

    return resultado;

  } catch (error) {
    console.error('❌ Erro busca info entrega:', error.message);
    throw error;
  }
}

/**
 * Busca eventos e datas especiais na região
 * @param {Object} params - Parâmetros da busca
 * @param {string} params.cidade - Cidade de interesse
 * @param {string} params.tipo - Tipo de evento (natal, aniversário, etc.)
 * @returns {Promise<Object>} Eventos encontrados
 */
async function buscarEventosLocais(params) {
  try {
    const { cidade = 'São Paulo', tipo = 'eventos' } = params;
    
    return await buscarLocalizacao({
      text: `${tipo} eventos datas especiais ${cidade}`,
      place: cidade,
      city: cidade,
      country: 'Brasil'
    });

  } catch (error) {
    console.error('❌ Erro busca eventos locais:', error.message);
    throw error;
  }
}

module.exports = {
  buscarLocalizacao,
  buscarLojasProximas,
  buscarShoppings,
  buscarInfoEntrega,
  buscarEventosLocais
};
