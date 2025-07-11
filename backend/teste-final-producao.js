
const https = require('https');

async function testProduction() {
    console.log('🧪 TESTANDO PRODUÇÃO - Easy Gift Search');
    console.log('='.repeat(50));
    
    const endpoints = [
        '/api/status',
        '/api/products?q=smartphone&age=adulto&maxPrice=1000',
        '/api/recommend?budget=500&interests=tecnologia'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\n🔍 Testando: ${endpoint}`);
            
            const response = await fetch(`https://easy-gift-search.vercel.app${endpoint}`);
            const data = await response.json();
            
            if (response.ok) {
                console.log('✅ Status: OK');
                console.log(`📊 Dados: ${JSON.stringify(data).substring(0, 100)}...`);
            } else {
                console.log('❌ Status: Erro');
                console.log(`🔍 Erro: ${data.error || 'Desconhecido'}`);
            }
        } catch (error) {
            console.log('❌ Falha na conexão');
            console.log(`🔍 Erro: ${error.message}`);
        }
    }
    
    console.log('\n🏁 TESTE CONCLUÍDO');
}

testProduction();
