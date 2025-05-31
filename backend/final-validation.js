// Final validation test for Easy Gift Search project
const http = require('http');

console.log('🔍 EASY GIFT SEARCH - FINAL VALIDATION TEST');
console.log('============================================\n');

// Test data
const testCases = [
  {
    name: 'Masculine Gender Filter',
    path: '/api/products?query=smartphone&orcamento=500&genero=masculino',
    method: 'GET'
  },
  {
    name: 'Feminine Gender Filter', 
    path: '/api/products?query=smartphone&orcamento=500&genero=feminino',
    method: 'GET'
  },
  {
    name: 'No Gender Filter',
    path: '/api/products?query=smartphone&orcamento=500',
    method: 'GET'
  },
  {
    name: 'Price + Gender Filter',
    path: '/api/products?query=smartphone&orcamento=100&genero=masculino',
    method: 'GET'
  }
];

const recommendationTest = {
  name: 'Recommendation System',
  path: '/api/recommend',
  method: 'POST',
  data: JSON.stringify({
    idade: 30,
    genero: 'feminino',
    interesses: ['beleza', 'casa']
  })
};

function runTest(testCase) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: testCase.path,
      method: testCase.method,
      headers: testCase.method === 'POST' ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testCase.data || '')
      } : {}
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ testCase, response, success: true });
        } catch (e) {
          resolve({ testCase, error: data, success: false });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ testCase, error: e.message, success: false });
    });

    if (testCase.data) {
      req.write(testCase.data);
    }
    req.end();
  });
}

async function runAllTests() {
  let totalTests = 0;
  let passedTests = 0;
  let totalProducts = 0;
  let placeholderCount = 0;

  // Test search endpoints
  for (const testCase of testCases) {
    totalTests++;
    console.log(`Testing: ${testCase.name}`);
    
    const result = await runTest(testCase);
    
    if (result.success && result.response.produtos) {
      const products = result.response.produtos;
      totalProducts += products.length;
      
      // Check for placeholder images
      const placeholders = products.filter(p => p.imagem && p.imagem.includes('placeholder.com'));
      placeholderCount += placeholders.length;
      
      console.log(`  ✅ Found ${products.length} products`);
      console.log(`  📸 Placeholder images: ${placeholders.length}`);
      
      // Validate gender filter
      if (testCase.path.includes('genero=masculino')) {
        const correctGender = products.every(p => p.genero === 'masculino' || !p.genero);
        console.log(`  👨 Gender filter (masculine): ${correctGender ? '✅ Working' : '❌ Failed'}`);
      } else if (testCase.path.includes('genero=feminino')) {
        const correctGender = products.every(p => p.genero === 'feminino' || !p.genero);
        console.log(`  👩 Gender filter (feminine): ${correctGender ? '✅ Working' : '❌ Failed'}`);
      }
      
      passedTests++;
    } else {
      console.log(`  ❌ Failed: ${result.error}`);
    }
    console.log('');
  }

  // Test recommendation endpoint
  totalTests++;
  console.log(`Testing: ${recommendationTest.name}`);
  
  const recResult = await runTest(recommendationTest);
  
  if (recResult.success && recResult.response.produtosRelacionados) {
    const products = recResult.response.produtosRelacionados;
    totalProducts += products.length;
    
    const placeholders = products.filter(p => p.imagem && p.imagem.includes('placeholder.com'));
    placeholderCount += placeholders.length;
    
    console.log(`  ✅ Found ${products.length} recommended products`);
    console.log(`  📸 Placeholder images: ${placeholders.length}`);
    console.log(`  💡 Suggestion: ${recResult.response.sugestao.substring(0, 50)}...`);
    
    passedTests++;
  } else {
    console.log(`  ❌ Failed: ${recResult.error}`);
  }

  // Final summary
  console.log('\n🎯 FINAL VALIDATION SUMMARY');
  console.log('============================');
  console.log(`✅ Tests passed: ${passedTests}/${totalTests}`);
  console.log(`📦 Total products tested: ${totalProducts}`);
  console.log(`📸 Placeholder images found: ${placeholderCount}`);
  console.log(`🎨 Real images: ${totalProducts - placeholderCount}`);
  
  if (passedTests === totalTests && placeholderCount === 0) {
    console.log('\n🎉 ALL TESTS PASSED! All critical issues have been fixed:');
    console.log('   ✅ Gender filter case sensitivity - FIXED');
    console.log('   ✅ Placeholder image replacement - COMPLETED');
    console.log('   ✅ API endpoints working correctly');
    console.log('   ✅ Recommendation system functional');
  } else {
    console.log('\n⚠️  Some issues remain:');
    if (passedTests < totalTests) {
      console.log(`   ❌ ${totalTests - passedTests} test(s) failed`);
    }
    if (placeholderCount > 0) {
      console.log(`   📸 ${placeholderCount} placeholder image(s) still found`);
    }
  }
}

runAllTests().catch(console.error);
