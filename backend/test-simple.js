// Teste simples do módulo Mercado Livre
const service = require('./services/mercadoLivreService');

console.log('Testando importação do módulo...');
console.log('Métodos disponíveis:', Object.keys(service));
console.log('Tipo de buscarProdutos:', typeof service.buscarProdutos);

if (service.buscarProdutos) {
  console.log('✅ Módulo importado com sucesso!');
  
  // Testar a função
  service.buscarProdutos({})
    .then(produtos => {
      console.log(`🎯 Teste executado com sucesso! ${produtos.length} produtos encontrados`);
      if (produtos.length > 0) {
        console.log('Primeiro produto:', produtos[0].nome);
      }
    })
    .catch(error => {
      console.error('❌ Erro ao executar:', error.message);
    });
} else {
  console.log('❌ Função buscarProdutos não encontrada');
}
