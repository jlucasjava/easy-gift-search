#!/usr/bin/env node
/**
 * 🧪 TESTE RÁPIDO DE PRODUÇÃO
 * Easy Gift Search - Production Test
 * July 8, 2025
 */

const https = require('https');
const colors = require('colors');

console.log('🧪 EASY GIFT SEARCH - TESTE DE PRODUÇÃO'.green.bold);
console.log('='.repeat(60).gray);
console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}\n`.cyan);

const BASE_URL = 'https://easy-gift-search.vercel.app';

const endpoints = [
    {
        path: '/api/status',
        name: 'Status da API',
        description: 'Verifica se o servidor está funcionando'
    },
    {
        path: '/api/products?q=smartphone&age=adulto&maxPrice=1000',
        name: 'Busca de Produtos',
        description: 'Testa busca real com filtros'
    },
    {
        path: '/api/recommend?budget=500&interests=tecnologia',
        name: 'Recomendações IA',
        description: 'Testa sistema de recomendações'
    },
    {
        path: '/api/custom-search?query=presente&maxPrice=500',
        name: 'Busca Personalizada',
        description: 'Testa motor de busca customizado'
    }
];

async function testEndpoint(endpoint) {
    return new Promise((resolve) => {
        const url = `${BASE_URL}${endpoint.path}`;
        console.log(`🔍 Testando: ${endpoint.name}`.yellow);
        console.log(`📡 URL: ${url}`.gray);
        
        const startTime = Date.now();
        
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                
                try {
                    if (res.statusCode === 200) {
                        const json = JSON.parse(data);
                        console.log(`✅ ${endpoint.name}: OK (${responseTime}ms)`.green);
                        
                        if (Array.isArray(json)) {
                            console.log(`📊 Resultados: ${json.length} itens`.white);
                            if (json.length > 0) {
                                console.log(`📝 Exemplo: ${json[0].title || json[0].name || 'N/A'}`.gray);
                            }
                        } else if (json.status) {
                            console.log(`📊 Status: ${json.status}`.white);
                            console.log(`📊 Versão: ${json.version || 'N/A'}`.white);
                        }
                        
                        resolve({ success: true, responseTime, data: json });
                    } else {
                        console.log(`❌ ${endpoint.name}: HTTP ${res.statusCode}`.red);
                        resolve({ success: false, error: `HTTP ${res.statusCode}` });
                    }
                } catch (error) {
                    console.log(`❌ ${endpoint.name}: Erro ao parsear JSON`.red);
                    console.log(`📄 Resposta: ${data.substring(0, 100)}...`.gray);
                    resolve({ success: false, error: 'JSON inválido' });
                }
                console.log(''); // Linha em branco
            });
        }).on('error', (error) => {
            console.log(`❌ ${endpoint.name}: Falha na conexão`.red);
            console.log(`🔍 Erro: ${error.message}`.gray);
            resolve({ success: false, error: error.message });
            console.log(''); // Linha em branco
        });
    });
}

async function runAllTests() {
    console.log('🚀 INICIANDO TESTES DE PRODUÇÃO...'.cyan.bold);
    console.log('='.repeat(60).gray);
    console.log('');
    
    const results = [];
    
    for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint);
        results.push({ ...endpoint, ...result });
        
        // Pequena pausa entre testes
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('📋 RESUMO DOS TESTES'.yellow.bold);
    console.log('='.repeat(60).gray);
    
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`✅ Sucessos: ${successful}/${total}`.green);
    console.log(`❌ Falhas: ${total - successful}/${total}`.red);
    
    if (successful === total) {
        console.log('\n🎉 TODOS OS TESTES PASSARAM!'.green.bold);
        console.log('✨ Easy Gift Search está 100% funcional em produção!'.green);
        console.log(`🌐 Acesse: ${BASE_URL}`.cyan.underline);
    } else {
        console.log('\n⚠️  ALGUNS TESTES FALHARAM'.yellow.bold);
        console.log('🔧 Possíveis causas:'.yellow);
        console.log('   1. Variáveis de ambiente não configuradas no Vercel'.gray);
        console.log('   2. Deploy ainda em andamento (aguarde 2-3 minutos)'.gray);
        console.log('   3. Problemas temporários de conectividade'.gray);
        console.log('\n📋 Próximos passos:'.yellow);
        console.log('   1. Verifique as variáveis no dashboard Vercel'.gray);
        console.log('   2. Aguarde o deploy completar'.gray);
        console.log('   3. Execute o teste novamente: node teste-rapido-producao.js'.gray);
    }
    
    console.log('\n🕐 Tempo médio de resposta:'.cyan);
    const avgTime = results
        .filter(r => r.responseTime)
        .reduce((sum, r) => sum + r.responseTime, 0) / successful;
    
    if (avgTime > 0) {
        console.log(`⚡ ${Math.round(avgTime)}ms`.white);
        
        if (avgTime < 2000) {
            console.log('🏆 Excelente performance!'.green);
        } else if (avgTime < 5000) {
            console.log('👍 Boa performance'.yellow);
        } else {
            console.log('⚠️  Performance pode ser melhorada'.red);
        }
    }
    
    console.log('\n📊 PRÓXIMAS ETAPAS:'.cyan.bold);
    if (successful === total) {
        console.log('1. ✅ Iteration 1 (Ativação) - COMPLETA!'.green);
        console.log('2. 🔧 Iteration 2 (Performance) - Próxima'.yellow);
        console.log('3. 📊 Iteration 3 (Analytics) - Planejada'.gray);
    } else {
        console.log('1. 🔧 Configurar Vercel (guia-ativacao-vercel.html)'.yellow);
        console.log('2. 🧪 Executar testes novamente'.yellow);
        console.log('3. 📋 Prosseguir para próxima iteração'.gray);
    }
}

// Executar testes
runAllTests().catch(console.error);
