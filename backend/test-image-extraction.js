/**
 * Teste da função de extração de imagens do Google Custom Search
 * 
 * Este script testa a extração de imagens de resultados da Google Custom Search API
 * para validar se as melhorias implementadas estão funcionando corretamente.
 * 
 * Execução:
 * node test-image-extraction.js
 */

require('dotenv').config();
const axios = require('axios');
const { 
  getBestImage, 
  extractImageFromLink, 
  extractImageFromSnippet 
} = require('./services/googleSearchService');

// Teste com dados reais da API do Google
async function testarExtracaoImagens() {
  console.log('🔍 Iniciando teste de extração de imagens...');
  
  try {
    // Verificar se as chaves da API estão configuradas
    if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_CX) {
      console.error('❌ Chaves da API do Google não configuradas!');
      console.log('Configure as variáveis GOOGLE_SEARCH_API_KEY e GOOGLE_SEARCH_CX no arquivo .env');
      return;
    }
    
    // Parâmetros de teste
    const queries = [
      'presente para mãe',
      'brinquedo criança 5 anos',
      'eletrônicos até 200 reais',
      'decoração casa',
      'acessórios femininos'
    ];
    
    // Testar cada query
    let sucessos = 0;
    let falhas = 0;
    let totalItens = 0;
    
    for (const query of queries) {
      console.log(`\n📊 Testando query: "${query}"`);
      
      const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_CX}&q=${encodeURIComponent(query)}&num=5&gl=br&cr=countryBR&lr=lang_pt&safe=active`;
      
      const response = await axios.get(url);
      
      if (response.data && response.data.items) {
        const items = response.data.items;
        totalItens += items.length;
        
        console.log(`Encontrados ${items.length} resultados.`);
        
        // Testar extração de imagem para cada item
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          console.log(`\n🔎 Item ${i+1}: ${item.title}`);
          
          // Testar getBestImage
          const imagem = getBestImage(item);
          
          if (imagem) {
            console.log(`✅ Imagem encontrada: ${imagem}`);
            sucessos++;
          } else {
            console.log(`❌ Nenhuma imagem encontrada no resultado direto`);
            
            // Testar métodos de fallback
            const imagemLink = extractImageFromLink(item.link);
            if (imagemLink) {
              console.log(`✅ Imagem encontrada via link: ${imagemLink}`);
              sucessos++;
            } else {
              const imagemSnippet = extractImageFromSnippet(item.snippet);
              if (imagemSnippet) {
                console.log(`✅ Imagem encontrada via snippet: ${imagemSnippet}`);
                sucessos++;
              } else {
                console.log(`❌ Falha total na extração de imagem`);
                falhas++;
              }
            }
          }
          
          // Mostrar informações adicionais para depuração
          console.log(`- Link: ${item.link}`);
          console.log(`- Snippet: ${item.snippet?.substring(0, 100)}...`);
          
          // Mostrar estrutura do pagemap para depuração
          if (item.pagemap) {
            console.log('- Estrutura do pagemap:');
            Object.keys(item.pagemap).forEach(key => {
              console.log(`  - ${key}: ${Array.isArray(item.pagemap[key]) ? item.pagemap[key].length + ' itens' : 'objeto'}`);
            });
          } else {
            console.log('- Sem pagemap disponível');
          }
        }
      } else {
        console.log('❌ Sem resultados ou erro na resposta da API');
      }
    }
    
    // Exibir estatísticas
    console.log('\n📈 Estatísticas do teste:');
    console.log(`Total de itens testados: ${totalItens}`);
    console.log(`Sucessos: ${sucessos} (${Math.round((sucessos/totalItens)*100)}%)`);
    console.log(`Falhas: ${falhas} (${Math.round((falhas/totalItens)*100)}%)`);
    
    if (sucessos / totalItens >= 0.8) {
      console.log('✅ TESTE APROVADO: Taxa de sucesso superior a 80%');
    } else {
      console.log('⚠️ ATENÇÃO: Taxa de sucesso inferior a 80%. Verifique a implementação.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao executar o teste:', error.message);
    if (error.response) {
      console.error('Detalhes da resposta da API:', error.response.data);
    }
  }
}

// Executar o teste
testarExtracaoImagens();
