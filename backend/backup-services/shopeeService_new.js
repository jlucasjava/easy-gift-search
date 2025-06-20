// Serviço de integração com Shopee usando Nova API Scraper
const axios = require('axios');
const https = require('https');

const PLACEHOLDER_IMG = '/images/placeholder.jpg';

// Configuração do agente HTTPS para resolver problemas de SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

exports.buscarProdutosShopee = async (filtros) => {
  // ==================== CONFIGURAÇÃO API SHOPEE SCRAPER ====================
  console.log('\n🛍️ === SHOPEE SERVICE - VERIFICAÇÃO DE CONFIGURAÇÃO ===');
  console.log(`📋 USE_REAL_SHOPEE_API: ${process.env.USE_REAL_SHOPEE_API || 'undefined'}`);
  console.log(`🔑 SHOPEE_SCRAPER_API_KEY disponível: ${process.env.SHOPEE_SCRAPER_API_KEY ? 'SIM ✅' : 'NÃO ❌'}`);
  
  const useRealApi = process.env.USE_REAL_SHOPEE_API === 'true';
  console.log(`🎯 DECISÃO: ${useRealApi ? 'USAR API REAL (SHOPEE SCRAPER) 🚀' : 'USAR DADOS MOCK 📦'}`);
  console.log('==================================================================\n');
  
  if (useRealApi && process.env.SHOPEE_SCRAPER_API_KEY) {
    console.log('🌐 Executando busca com API REAL do Shopee Scraper...');
    console.log('📊 Filtros recebidos:', filtros);
    
    try {
      // Nova implementação usando Shopee Scraper API
      const shopeeUrl = "https://shopee.com.my/api/v4/pdp/get_pc?shop_id=12851682&item_id=187718196&detail_level=0";
      
      console.log('🔍 Iniciando requisição para Shopee Scraper API...');
      console.log(`🌐 URL sendo enviada: ${shopeeUrl}`);
      
      const response = await axios.post('https://shopee-scraper1.p.rapidapi.com/', {
        url: shopeeUrl
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'shopee-scraper1.p.rapidapi.com',
          'x-rapidapi-key': process.env.SHOPEE_SCRAPER_API_KEY
        },
        httpsAgent,
        timeout: 15000
      });

      console.log(`✅ Resposta recebida! Status: ${response.status}`);
      console.log('📦 Dados brutos:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
      
      // Processar dados do Shopee Scraper
      if (response.data && response.data.data) {
        const item = response.data.data;
        const produtos = [{
          id: `shopee_scraper_${item.itemid || Math.random()}`,
          nome: item.name || 'Produto Shopee (Scraper)',
          preco: (item.price / 100000) || 0, // Shopee retorna preço em centavos
          imagem: item.images ? `https://cf.shopee.com.my/file/${item.images[0]}` : PLACEHOLDER_IMG,
          url: `https://shopee.com.my/product/${item.shop_id}/${item.itemid}`,
          marketplace: 'Shopee',
          genero: filtros.genero || 'unisex',
          idadeMin: 0,
          idadeMax: 120,
          fonte: 'API Real (Shopee Scraper)',
          api_usado: 'shopee-scraper1.p.rapidapi.com'
        }];
        
        console.log(`🎁 Produtos formatados: ${produtos.length}`);
        console.log('📋 Fonte: API Real (shopee-scraper1.p.rapidapi.com)');
        return produtos;
      } else {
        console.log('⚠️ Resposta vazia da API, retornando dados mock');
        return await buscarProdutosMockShopee(filtros);
      }
      
    } catch (error) {
      console.error('❌ Erro na busca real Shopee Scraper:', error.message);
      console.error('🔄 Retornando dados mock devido ao erro');
      return await buscarProdutosMockShopee(filtros);
    }
  }
  
  console.log('📦 Executando busca com DADOS MOCK...');
  return await buscarProdutosMockShopee(filtros);
};

// Função para buscar produtos mock do Shopee
async function buscarProdutosMockShopee(filtros) {
  console.log('📦 Executando busca MOCK do Shopee...');
  console.log('🛍️ Buscando produtos do Shopee (MOCK)');
  console.log('Filtros:', filtros);
  
  const produtosMock = [
    {
      id: 'shopee123456',
      nome: 'Roupinha de Bebê Rosa',
      preco: 49.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://shopee.com.br/Roupinha-Bebe-Rosa-i.123456.789012345',
      marketplace: 'Shopee',
      genero: 'feminino',
      idadeMin: 0,
      idadeMax: 2
    },
    {
      id: 'shopee654321',
      nome: 'Mordedor de Silicone Unissex',
      preco: 29.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://shopee.com.br/Mordedor-Silicone-Bebe-i.654321.987654321',
      marketplace: 'Shopee',
      genero: 'unisex',
      idadeMin: 0,
      idadeMax: 2
    },
    {
      id: 'shopee777888',
      nome: 'Kit Higiene Bebê Azul',
      preco: 79.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://shopee.com.br/Kit-Higiene-Bebe-Azul-i.777888.123456789',
      marketplace: 'Shopee',
      genero: 'masculino',
      idadeMin: 0,
      idadeMax: 2
    },
    {
      id: 'shopee999000',
      nome: 'Conjunto de Panelas Antiaderente',
      preco: 199.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://shopee.com.br/Conjunto-Panelas-Antiaderente-i.999000.987654321',
      marketplace: 'Shopee',
      genero: 'unisex',
      idadeMin: 18,
      idadeMax: 120
    },
    {
      id: 'shopee111333',
      nome: 'Caneca Térmica Personalizada',
      preco: 39.90,
      imagem: PLACEHOLDER_IMG,
      url: 'https://shopee.com.br/Caneca-Termica-Personalizada-i.111333.456789012',
      marketplace: 'Shopee',
      genero: 'unisex',
      idadeMin: 14,
      idadeMax: 120
    }
  ];
  
  // Filtro integrado preço, gênero e idade (faixa etária)
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
    produtosFiltrados = produtosFiltrados.filter(p => {
      const min = p.idadeMin || 0;
      const max = p.idadeMax !== undefined ? p.idadeMax : 120;
      return idade >= min && idade <= max;
    });
  }
  
  console.log(`✅ ${produtosFiltrados.length} produtos encontrados (MOCK)`);
  return produtosFiltrados.slice(0, 30);
}

// Função principal que será chamada pelo controller
exports.buscarProdutos = async (filtros) => {
  return await exports.buscarProdutosShopee(filtros);
};
