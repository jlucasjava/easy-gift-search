// validar-google-api-producao.js
// Script para validar o funcionamento da Google Custom Search API em produção
const axios = require('axios');

// URL da API em produção
const PRODUCTION_URL = 'https://easy-gift-search.onrender.com';
const TEST_QUERY = 'presentes para crianças';

async function validarGoogleAPIProducao() {
  console.log('🧪 VALIDAÇÃO DA GOOGLE CUSTOM SEARCH API EM PRODUÇÃO');
  console.log('====================================================');
  console.log(`🔍 URL: ${PRODUCTION_URL}`);
  console.log(`🔍 Query de teste: "${TEST_QUERY}"`);
  console.log('');

  try {
    // 1. Verificar se o servidor está respondendo
    console.log('1️⃣ Verificando se o servidor está online...');
    const statusResponse = await axios.get(`${PRODUCTION_URL}/api/monitor/status`);
    
    if (statusResponse.data && statusResponse.status === 200) {
      console.log('✅ Servidor está online e respondendo');
      
      // Verificar configuração da API
      if (statusResponse.data.apis && statusResponse.data.apis.google) {
        const googleStatus = statusResponse.data.apis.google;
        console.log(`⚙️ Status da Google API: ${googleStatus.active ? '✅ ATIVA' : '❌ INATIVA'}`);
        console.log(`🔑 API Key configurada: ${googleStatus.keyConfigured ? '✅ SIM' : '❌ NÃO'}`);
        console.log(`🔍 CSE ID configurado: ${googleStatus.cseidConfigured ? '✅ SIM' : '❌ NÃO'}`);
      } else {
        console.log('⚠️ Informações da API do Google não disponíveis na resposta de status');
      }
    } else {
      console.log('❌ Servidor não está respondendo corretamente');
      return;
    }
    
    // 2. Testar a busca de produtos
    console.log('\n2️⃣ Testando a busca de produtos...');
    const searchResponse = await axios.get(`${PRODUCTION_URL}/api/products/search?q=${encodeURIComponent(TEST_QUERY)}`);
    
    if (searchResponse.data && searchResponse.status === 200) {
      const produtos = searchResponse.data.produtos || [];
      console.log(`✅ Busca realizada com sucesso: ${produtos.length} produtos encontrados`);
      
      // Validar se há produtos reais
      if (produtos.length > 0) {
        console.log('\n📊 AMOSTRA DE PRODUTOS:');
        
        // Mostrar os 3 primeiros produtos ou menos se houver menos
        const amostra = produtos.slice(0, Math.min(3, produtos.length));
        
        amostra.forEach((produto, index) => {
          console.log(`\n🛍️ PRODUTO ${index + 1}:`);
          console.log(`🏷️ Nome: ${produto.nome || 'N/A'}`);
          console.log(`💰 Preço: ${produto.preco || 'N/A'}`);
          console.log(`🔗 URL: ${produto.url || 'N/A'}`);
          console.log(`🖼️ Imagem: ${produto.imagem ? '✅ Presente' : '❌ Ausente'}`);
          console.log(`🏪 Marketplace: ${produto.marketplace || 'Desconhecido'}`);
          
          // Validar URLs
          const urlValida = produto.url && (produto.url.startsWith('http://') || produto.url.startsWith('https://'));
          console.log(`🔗 URL válida: ${urlValida ? '✅ SIM' : '❌ NÃO'}`);
          
          // Validar imagens
          const imagemValida = produto.imagem && (produto.imagem.startsWith('http://') || produto.imagem.startsWith('https://'));
          console.log(`🖼️ Imagem válida: ${imagemValida ? '✅ SIM' : '❌ NÃO'}`);
        });
        
        // Estatísticas gerais
        const urlsValidas = produtos.filter(p => p.url && (p.url.startsWith('http://') || p.url.startsWith('https://'))).length;
        const imagensValidas = produtos.filter(p => p.imagem && (p.imagem.startsWith('http://') || p.imagem.startsWith('https://'))).length;
        
        console.log('\n📊 ESTATÍSTICAS GERAIS:');
        console.log(`🔢 Total de produtos: ${produtos.length}`);
        console.log(`🔗 URLs válidas: ${urlsValidas} (${Math.round(urlsValidas/produtos.length*100)}%)`);
        console.log(`🖼️ Imagens válidas: ${imagensValidas} (${Math.round(imagensValidas/produtos.length*100)}%)`);
        
        // Verificar se os resultados são de marketplaces conhecidos
        const marketplaces = {};
        produtos.forEach(p => {
          if (p.marketplace) {
            marketplaces[p.marketplace] = (marketplaces[p.marketplace] || 0) + 1;
          }
        });
        
        console.log('\n🏪 DISTRIBUIÇÃO DE MARKETPLACES:');
        Object.keys(marketplaces).forEach(m => {
          console.log(`- ${m}: ${marketplaces[m]} produtos (${Math.round(marketplaces[m]/produtos.length*100)}%)`);
        });
        
        // Conclusão
        const porcentagemValida = Math.round((Math.min(urlsValidas, imagensValidas) / produtos.length) * 100);
        
        console.log('\n🏁 CONCLUSÃO:');
        if (porcentagemValida >= 80) {
          console.log('✅ API FUNCIONANDO CORRETAMENTE: A maioria dos produtos possui URLs e imagens válidas');
        } else if (porcentagemValida >= 50) {
          console.log('⚠️ API FUNCIONANDO PARCIALMENTE: Alguns produtos possuem URLs ou imagens inválidas');
        } else {
          console.log('❌ API COM PROBLEMAS: A maioria dos produtos possui URLs ou imagens inválidas');
        }
      } else {
        console.log('❌ Nenhum produto encontrado na busca');
      }
    } else {
      console.log('❌ Falha ao realizar a busca de produtos');
    }
    
  } catch (error) {
    console.error('❌ ERRO NA VALIDAÇÃO:', error.message);
    
    if (error.response) {
      console.error('Detalhes do erro:');
      console.error(`Status: ${error.response.status}`);
      console.error(`Mensagem: ${JSON.stringify(error.response.data)}`);
    }
  }
  
  console.log('\n====================================================');
  console.log('🏁 FIM DA VALIDAÇÃO');
  console.log('====================================================');
}

// Executar a validação
validarGoogleAPIProducao();
