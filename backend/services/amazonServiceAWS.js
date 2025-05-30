// Novo serviço de integração com AWS Product Advertising API
const crypto = require('crypto');
const axios = require('axios');

// Configuração AWS PA-API
const AWS_ACCESS_KEY_ID = process.env.AMAZON_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AMAZON_SECRET_KEY;
const AWS_ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG;
const AWS_REGION = process.env.AMAZON_REGION || 'us-east-1';
const AWS_SERVICE = 'ProductAdvertisingAPI';
const AWS_HOST = 'webservices.amazon.com';

// Função para criar assinatura AWS
function createAWSSignature(stringToSign, secretKey) {
  return crypto.createHmac('sha256', secretKey).update(stringToSign).digest('base64');
}

// Função para gerar timestamp ISO8601
function getTimestamp() {
  return new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
}

exports.buscarProdutosAmazonAWS = async (filtros) => {
  // Verifica se as credenciais AWS estão configuradas
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_ASSOCIATE_TAG) {
    console.log('⚠️ Credenciais AWS não configuradas, usando dados mock');
    return await exports.buscarProdutosAmazon(filtros); // Fallback para mock
  }

  try {
    console.log('🔐 Usando AWS Product Advertising API');
    console.log('Filtros recebidos:', filtros);

    const timestamp = getTimestamp();
    const keywords = filtros.genero || 'gift';
    
    // Parâmetros da requisição
    const params = {
      'Service': 'AWSECommerceService',
      'Operation': 'ItemSearch',
      'AWSAccessKeyId': AWS_ACCESS_KEY_ID,
      'AssociateTag': AWS_ASSOCIATE_TAG,
      'SearchIndex': 'All',
      'Keywords': keywords,
      'ResponseGroup': 'Images,ItemAttributes,Offers',
      'Timestamp': timestamp,
      'Version': '2013-08-01'
    };

    // Adicionar filtros de preço se fornecidos
    if (filtros.precoMin) {
      params.MinimumPrice = Math.round(parseFloat(filtros.precoMin) * 100); // Centavos
    }
    if (filtros.precoMax) {
      params.MaximumPrice = Math.round(parseFloat(filtros.precoMax) * 100); // Centavos
    }

    // Criar string de consulta ordenada
    const sortedParams = Object.keys(params).sort().map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
    
    // String para assinar
    const stringToSign = `GET\n${AWS_HOST}\n/onca/xml\n${sortedParams}`;
    
    // Criar assinatura
    const signature = createAWSSignature(stringToSign, AWS_SECRET_ACCESS_KEY);
    
    // URL final
    const url = `https://${AWS_HOST}/onca/xml?${sortedParams}&Signature=${encodeURIComponent(signature)}`;

    // Fazer requisição
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Easy Gift Search/1.0 (Language=JavaScript)'
      }
    });

    // Processar resposta XML (seria necessário um parser XML)
    console.log('✅ Resposta AWS recebida:', response.status);
    
    // Por enquanto, retorna dados mock até implementar parser XML
    return await exports.buscarProdutosAmazon(filtros);

  } catch (error) {
    console.error('❌ Erro na AWS Product Advertising API:', error.message);
    console.log('🔄 Usando fallback para dados mock');
    return await exports.buscarProdutosAmazon(filtros);
  }
};

// Mantém a função original com dados mock
exports.buscarProdutosAmazon = async (filtros) => {
  // MODO DEMO: retorna produtos mock com links reais para demonstração
  console.log('🔧 MODO DEMO: Retornando produtos mock da Amazon');
  console.log('Filtros recebidos:', filtros);
  
  const produtosMock = [
    {
      id: 'B08N5WRWNW',
      nome: 'Echo Dot (4ª Geração) - Smart Speaker com Alexa',
      preco: 249.90,
      imagem: 'https://m.media-amazon.com/images/I/714Rq4k05UL._AC_SL1000_.jpg',
      url: 'https://www.amazon.com.br/dp/B08N5WRWNW',
      marketplace: 'Amazon'
    },
    {
      id: 'B08C1W5N87',
      nome: 'Fire TV Stick | Streaming em Full HD com Alexa',
      preco: 199.90,
      imagem: 'https://m.media-amazon.com/images/I/51TjJOTfslL._AC_SL1000_.jpg',
      url: 'https://www.amazon.com.br/dp/B08C1W5N87',
      marketplace: 'Amazon'
    },
    {
      id: 'B09BFG5ZQW',
      nome: 'Kindle (11ª geração) - O eReader mais vendido do mundo',
      preco: 349.90,
      imagem: 'https://m.media-amazon.com/images/I/71rRnLfCHJL._AC_SL1000_.jpg',
      url: 'https://www.amazon.com.br/dp/B09BFG5ZQW',
      marketplace: 'Amazon'
    },
    {
      id: 'B08F5M1W6Q',
      nome: 'Bose QuietComfort 35 II - Fone Bluetooth',
      preco: 899.90,
      imagem: 'https://m.media-amazon.com/images/I/81+jNVOUsJL._AC_SL1500_.jpg',
      url: 'https://www.amazon.com.br/dp/B08F5M1W6Q',
      marketplace: 'Amazon'
    },
    {
      id: 'B07Y8J1W3K',
      nome: 'Caderno Inteligente Grande 80 Folhas',
      preco: 59.90,
      imagem: 'https://m.media-amazon.com/images/I/81234567890._AC_SL1000_.jpg',
      url: 'https://www.amazon.com.br/dp/B07Y8J1W3K',
      marketplace: 'Amazon'
    }
  ];
  
  // Aplicar filtro de preço se fornecido
  let produtosFiltrados = produtosMock;
  if (filtros.precoMin || filtros.precoMax) {
    const precoMinimo = filtros.precoMin ? parseFloat(filtros.precoMin) : 0;
    const precoMaximo = filtros.precoMax ? parseFloat(filtros.precoMax) : Infinity;
    
    if (!isNaN(precoMinimo) || !isNaN(precoMaximo)) {
      produtosFiltrados = produtosMock.filter(produto => {
        return produto.preco >= precoMinimo && produto.preco <= precoMaximo;
      });
      console.log(`Filtro preço R$ ${precoMinimo} - R$ ${precoMaximo === Infinity ? '∞' : precoMaximo}: ${produtosFiltrados.length} produtos encontrados`);
    }
  }

  return produtosFiltrados;
};

// Função principal que escolhe qual API usar
exports.buscarProdutos = async (filtros) => {
  // Tenta usar AWS PA-API se configurada, senão usa RapidAPI ou mock
  if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_ASSOCIATE_TAG) {
    return await exports.buscarProdutosAmazonAWS(filtros);
  } else {
    return await exports.buscarProdutosAmazon(filtros);
  }
};
