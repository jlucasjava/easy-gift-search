// Serviço de integração real com Amazon via RapidAPI (real-time-amazon-data)
const axios = require('axios');
const https = require('https');

// Nova função para buscar produtos reais via RapidAPI
exports.buscarProdutosAmazonReal = async (filtros) => {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  
  if (!RAPIDAPI_KEY) {
    console.log('⚠️ RAPIDAPI_KEY não configurada, usando dados mock');
    return await exports.buscarProdutosAmazon(filtros);
  }

  try {
    console.log('🔍 Buscando produtos reais na Amazon via RapidAPI');
    console.log('Filtros recebidos:', filtros);

    // Preparar parâmetros de busca
    const searchTerm = filtros.genero || 'gift';
    const country = 'US'; // ou 'BR' se suportado
      // Configuração da requisição para real-time-amazon-data API
    const options = {
      method: 'GET',
      url: 'https://real-time-amazon-data.p.rapidapi.com/search',
      params: {
        query: searchTerm,
        page: '1',
        country: country,
        sort_by: 'RELEVANCE',
        product_condition: 'ALL'
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
      },      timeout: 10000,
      // Adicionar configuração SSL para resolver problemas de certificado
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    };

    // Fazer a requisição
    const response = await axios.request(options);
    console.log(`✅ API Amazon Real: ${response.data.data?.products?.length || 0} produtos encontrados`);

    // Processar resposta
    if (response.data && response.data.data && response.data.data.products) {
      let produtos = response.data.data.products.map(item => ({
        id: item.asin || item.product_id || `amz_${Date.now()}_${Math.random()}`,
        nome: item.product_title || item.title || 'Produto Amazon',
        preco: parseFloat(item.product_price?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
        imagem: item.product_photo || item.image_url || 'https://m.media-amazon.com/images/I/31DL37vpKpL._AC_.jpg',
        url: item.product_url || `https://amazon.com/dp/${item.asin}`,
        marketplace: 'Amazon',
        rating: item.product_star_rating || null,
        reviews: item.product_num_ratings || null
      }));

      // Aplicar filtros de preço se fornecidos
      if (filtros.precoMin || filtros.precoMax) {
        const precoMinimo = filtros.precoMin ? parseFloat(filtros.precoMin) : 0;
        const precoMaximo = filtros.precoMax ? parseFloat(filtros.precoMax) : Infinity;
        
        produtos = produtos.filter(produto => {
          return produto.preco >= precoMinimo && produto.preco <= precoMaximo;
        });
        
        console.log(`💰 Filtro preço aplicado: ${produtos.length} produtos restantes`);
      }

      // Limitar a 9 produtos para manter consistência
      produtos = produtos.slice(0, 9);
      
      console.log(`📦 Retornando ${produtos.length} produtos reais da Amazon`);
      return produtos;
    }

    // Se não houver produtos, usar fallback
    console.log('⚠️ Nenhum produto encontrado, usando fallback');
    return await exports.buscarProdutosAmazon(filtros);

  } catch (error) {
    console.error('❌ Erro na API Amazon Real:', error.message);
    console.log('🔄 Usando fallback para dados mock');
    return await exports.buscarProdutosAmazon(filtros);
  }
};

const PLACEHOLDER_IMG = '/images/placeholder.jpg';

exports.buscarProdutosAmazon = async (filtros) => {
  // MODO DEMO: retorna produtos mock com links reais para demonstração
  console.log('🔧 MODO DEMO: Retornando produtos mock da Amazon');
  console.log('Filtros recebidos:', filtros);
    const produtosMock = [
    {
      id: 'B08N5WRWNW',
      nome: 'Mordedor de Silicone para Bebê',
      preco: 39.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://www.amazon.com.br/dp/B08N5WRWNW',
      marketplace: 'Amazon',
      genero: 'unisex',
      idadeMin: 0
    },
    {
      id: 'B07ZQRL9XY',
      nome: 'Body Algodão Bebê Menino 0-6 meses',
      preco: 49.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://www.amazon.com.br/dp/B07ZQRL9XY',
      marketplace: 'Amazon',
      genero: 'masculino',
      idadeMin: 0
    },
    {
      id: 'B09V3HN1L3',
      nome: 'Kit Fraldas Pampers RN',
      preco: 89.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://www.amazon.com.br/dp/B09V3HN1L3',
      marketplace: 'Amazon',
      genero: 'unisex',
      idadeMin: 0
    },
    {
      id: 'B08X1Z1W4Z',
      nome: 'Cafeteira Expresso Nespresso',
      preco: 499.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://www.amazon.com.br/dp/B08X1Z1W4Z',
      marketplace: 'Amazon',
      genero: 'unisex',
      idadeMin: 18
    },
    {
      id: 'B07P8MQG6Z',
      nome: 'Relógio Smartwatch Amazfit Bip',
      preco: 299.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://www.amazon.com.br/dp/B07P8MQG6Z',
      marketplace: 'Amazon',
      genero: 'masculino',
      idadeMin: 14
    }
  ];
  // Filtro integrado preço, gênero e idade
  let produtosFiltrados = produtosMock;
  if (filtros.precoMin || filtros.precoMax) {
    const precoMinimo = filtros.precoMin ? parseFloat(filtros.precoMin) : 0;
    const precoMaximo = filtros.precoMax ? parseFloat(filtros.precoMax) : Infinity;
    produtosFiltrados = produtosFiltrados.filter(produto => produto.preco >= precoMinimo && produto.preco <= precoMaximo);
  }
  if (filtros.genero && filtros.genero.toLowerCase() !== 'nao informado' && filtros.genero.toLowerCase() !== '') {
    const genero = filtros.genero.toLowerCase();
    produtosFiltrados = produtosFiltrados.filter(p => {
      const produtoGenero = p.genero.toLowerCase();
      return produtoGenero === 'unisex' || produtoGenero === genero;
    });
  }
  if (filtros.idade) {
    const idade = parseInt(filtros.idade);
    produtosFiltrados = produtosFiltrados.filter(p => idade >= p.idadeMin);
  }
  return produtosFiltrados;
  
  /* CÓDIGO ORIGINAL (desabilitado para demo):
  const options = {
    method: 'GET',
    url: 'https://amazon24.p.rapidapi.com/api/product',
    params: {
      keyword: filtros.genero || 'gift',
      country: 'BR',
      categoryID: '',
      minPrice: filtros.precoMin || 0,
      page: '1'
    },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'amazon24.p.rapidapi.com'
    }
  };
  try {
    const { data } = await axios.request(options);
    return data.docs?.map(item => ({
      id: item.asin,
      nome: item.product_title,
      preco: item.product_price,
      imagem: item.product_photo,
      url: item.product_url,
      marketplace: 'Amazon'
    })) || [];
  } catch (err) {
    console.error('Erro Amazon:', err.response?.data || err.message);
    return [];
  }
  */
};

// Função principal que escolhe qual implementação usar
exports.buscarProdutos = async (filtros) => {
  const useRealAPI = process.env.USE_REAL_AMAZON_API === 'true';
  
  if (useRealAPI && process.env.RAPIDAPI_KEY) {
    console.log('🚀 Usando API real da Amazon (real-time-amazon-data)');
    return await exports.buscarProdutosAmazonReal(filtros);
  } else {
    console.log('🔧 Usando dados mock da Amazon');
    return await exports.buscarProdutosAmazon(filtros);
  }
};

// Função para testar a API real diretamente
exports.testarAPIReal = async () => {
  try {
    console.log('🧪 Testando API real da Amazon...');
    const resultado = await exports.buscarProdutosAmazonReal({ genero: 'electronics' });
    console.log(`✅ Teste concluído: ${resultado.length} produtos encontrados`);
    return resultado;
  } catch (error) {
    console.error('❌ Erro no teste da API:', error.message);
    return [];
  }
};
