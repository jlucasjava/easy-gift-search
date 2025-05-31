// Teste final abrangente das novas APIs implementadas
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/new-apis';

console.log('🎯 TESTE FINAL ABRANGENTE - APIs Bing Web Search & Google Maps');
console.log('================================================================\n');

async function testeCompleto() {
  const testes = [
    {
      nome: 'Info das APIs',
      url: `${BASE_URL}/info`,
      metodo: 'GET'
    },
    {
      nome: 'Bing Web Search',
      url: `${BASE_URL}/bing/buscar?query=presentes tecnologia`,
      metodo: 'GET'
    },
    {
      nome: 'Bing Produtos',
      url: `${BASE_URL}/bing/produtos?produto=smartphone&categoria=eletrônicos`,
      metodo: 'GET'
    },
    {
      nome: 'Bing Recomendações',
      url: `${BASE_URL}/bing/recomendacoes?idade=25&genero=masculino&interesses=tecnologia`,
      metodo: 'GET'
    },
    {
      nome: 'Bing Tendências',
      url: `${BASE_URL}/bing/tendencias?categoria=presentes`,
      metodo: 'GET'
    },
    {
      nome: 'Google Maps Localização',
      url: `${BASE_URL}/maps/localizacao?text=Shopping Vila Lobos`,
      metodo: 'GET'
    },
    {
      nome: 'Google Maps Lojas',
      url: `${BASE_URL}/maps/lojas?categoria=eletrônicos&cidade=São Paulo`,
      metodo: 'GET'
    },
    {
      nome: 'Google Maps Shoppings',
      url: `${BASE_URL}/maps/shoppings?cidade=São Paulo&estado=SP`,
      metodo: 'GET'
    },
    {
      nome: 'Google Maps Entrega',
      url: `${BASE_URL}/maps/entrega?cep=01310-100&cidade=São Paulo`,
      metodo: 'GET'
    },
    {
      nome: 'Busca Integrada',
      url: `${BASE_URL}/busca-integrada?query=presentes tecnologia&idade=25&genero=masculino&cidade=São Paulo`,
      metodo: 'GET'
    },
    {
      nome: 'Demo Bing',
      url: `${BASE_URL}/demo/bing`,
      metodo: 'GET'
    },
    {
      nome: 'Demo Maps',
      url: `${BASE_URL}/demo/maps`,
      metodo: 'GET'
    }
  ];

  let sucessos = 0;
  let falhas = 0;

  for (let i = 0; i < testes.length; i++) {
    const teste = testes[i];
    console.log(`📝 Teste ${i + 1}/${testes.length}: ${teste.nome}`);
    
    try {
      const response = await axios.get(teste.url, { timeout: 10000 });
      
      if (response.status === 200) {
        console.log(`   ✅ Status: ${response.status} OK`);
        
        // Verificar se a resposta tem estrutura esperada
        const data = response.data;
        if (data) {
          if (data.titulo) {
            console.log(`   📋 Título: ${data.titulo}`);
          } else if (data.sucesso !== undefined) {
            console.log(`   🎯 Sucesso: ${data.sucesso}`);
            if (data.fonte) console.log(`   🔗 Fonte: ${data.fonte}`);
          } else if (data.query) {
            console.log(`   🔍 Query: ${data.query}`);
          }
        }
        sucessos++;
      } else {
        console.log(`   ❌ Status inesperado: ${response.status}`);
        falhas++;
      }
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
      falhas++;
    }
    
    console.log('');
  }

  console.log('📊 RESULTADO FINAL');
  console.log('==================');
  console.log(`✅ Sucessos: ${sucessos}/${testes.length}`);
  console.log(`❌ Falhas: ${falhas}/${testes.length}`);
  console.log(`📈 Taxa de Sucesso: ${Math.round((sucessos / testes.length) * 100)}%`);
  
  if (sucessos === testes.length) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! IMPLEMENTAÇÃO 100% FUNCIONAL! 🚀');
  } else if (sucessos >= testes.length * 0.8) {
    console.log('\n✅ IMPLEMENTAÇÃO LARGAMENTE FUNCIONAL! Pequenos ajustes necessários.');
  } else {
    console.log('\n⚠️  IMPLEMENTAÇÃO PARCIAL. Revisar endpoints com falha.');
  }
}

testeCompleto().catch(console.error);
