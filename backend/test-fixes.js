// Test file to verify our image URL fixes
const aliexpressService = require('./services/aliexpressService');
const amazonService = require('./services/amazonService');
const shopeeService = require('./services/shopeeService');

console.log('Testing AliExpress Service...');
aliexpressService.buscarProdutosAliExpress({ query: 'smartphone', orcamento: 500 })
  .then(products => {
    console.log('AliExpress - Found', products.length, 'products');
    if (products.length > 0) {
      console.log('First product image:', products[0].imagem);
      console.log('All images use placeholder:', products.every(p => p.imagem.includes('placeholder.com')));
    }
  })
  .catch(err => console.log('AliExpress error:', err.message));

console.log('\nTesting Amazon Service...');
amazonService.buscarProdutosAmazon({ query: 'smartphone', orcamento: 500 })
  .then(products => {
    console.log('Amazon - Found', products.length, 'products');
    if (products.length > 0) {
      console.log('First product image:', products[0].imagem);
      console.log('All images use placeholder:', products.every(p => p.imagem.includes('placeholder.com')));
    }
  })
  .catch(err => console.log('Amazon error:', err.message));

console.log('\nTesting Shopee Service...');
shopeeService.buscarProdutosShopee({ query: 'smartphone', orcamento: 500 })
  .then(products => {
    console.log('Shopee - Found', products.length, 'products');
    if (products.length > 0) {
      console.log('First product image:', products[0].imagem);
      console.log('All images use placeholder:', products.every(p => p.imagem.includes('placeholder.com')));
    }
  })
  .catch(err => console.log('Shopee error:', err.message));
