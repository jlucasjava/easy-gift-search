#!/usr/bin/env node
/**
 * TESTE DE PRODUÇÃO - Verifica se as APIs estão ativas após configuração no Vercel
 * Execute este script APÓS configurar as variáveis de ambiente no Vercel Dashboard
 */

const https = require('https');

// Configurar para ignorar problemas de certificado SSL em ambiente de desenvolvimento
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function testProductionEndpoint() {
    return new Promise((resolve, reject) => {
        const url = 'https://easy-gift-search.vercel.app/api/status';
        
        log('\n🔍 TESTANDO ENDPOINT DE PRODUÇÃO', 'bold');
        log('=' .repeat(50), 'blue');
        log(`📡 URL: ${url}`, 'blue');
        log('⏳ Fazendo requisição...', 'yellow');
        
        const startTime = Date.now();
        
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                
                try {
                    const jsonData = JSON.parse(data);
                    
                    log(`\n⚡ Tempo de resposta: ${responseTime}ms`, 'blue');
                    log(`📊 Status HTTP: ${res.statusCode}`, res.statusCode === 200 ? 'green' : 'red');
                    
                    if (res.statusCode === 200) {
                        log('\n✅ RESPOSTA RECEBIDA:', 'green');
                        console.log(JSON.stringify(jsonData, null, 2));
                        
                        // Analisar resultado
                        log('\n📈 ANÁLISE DOS RESULTADOS:', 'bold');
                        
                        if (jsonData.apiStatus) {
                            const apiStatus = jsonData.apiStatus;
                            const activeCount = Object.values(apiStatus).filter(status => status === true).length;
                            const totalAPIs = Object.keys(apiStatus).length;
                            
                            log(`🎯 APIs Ativas: ${activeCount}/${totalAPIs}`, 'green');
                            
                            // Verificar cada API
                            Object.entries(apiStatus).forEach(([api, status]) => {
                                log(`  ${status ? '✅' : '❌'} ${api.toUpperCase()}: ${status ? 'ATIVA' : 'INATIVA'}`, 
                                    status ? 'green' : 'red');
                            });
                            
                            if (activeCount === 5) {
                                log('\n🎉 SUCESSO! TODAS AS 5 APIs ESTÃO ATIVAS!', 'green');
                                log('🚀 O sistema está funcionando em produção!', 'green');
                            } else {
                                log(`\n⚠️ PROBLEMA: Apenas ${activeCount}/5 APIs ativas`, 'yellow');
                                log('🔧 Verifique as variáveis de ambiente no Vercel', 'yellow');
                            }
                        } else {
                            log('❌ Resposta não contém apiStatus', 'red');
                        }
                        
                        resolve(jsonData);
                    } else {
                        log(`❌ Erro HTTP: ${res.statusCode}`, 'red');
                        log(`📄 Resposta: ${data}`, 'red');
                        reject(new Error(`HTTP ${res.statusCode}`));
                    }
                    
                } catch (error) {
                    log(`❌ Erro ao parsear JSON: ${error.message}`, 'red');
                    log(`📄 Dados recebidos: ${data}`, 'yellow');
                    reject(error);
                }
            });
            
        }).on('error', (error) => {
            log(`❌ Erro na requisição: ${error.message}`, 'red');
            
            if (error.code === 'ENOTFOUND') {
                log('🔍 Possíveis causas:', 'yellow');
                log('  • Verifique sua conexão com a internet', 'yellow');
                log('  • O domínio pode estar inacessível', 'yellow');
            } else if (error.code === 'ETIMEDOUT') {
                log('🔍 Timeout - o servidor pode estar sobrecarregado', 'yellow');
            }
            
            reject(error);
        });
    });
}

function showNextSteps(result) {
    log('\n' + '='.repeat(50), 'bold');
    log('📋 PRÓXIMOS PASSOS', 'bold');
    
    if (result && result.activeAPIs === 5) {
        log('\n✅ PRODUÇÃO CONFIGURADA COM SUCESSO!', 'green');
        log('🎯 Todas as APIs estão funcionando', 'green');
        log('🔗 Teste o sistema completo em:', 'blue');
        log('   https://easy-gift-search.vercel.app', 'blue');
        
    } else {
        log('\n⚠️ CONFIGURAÇÃO PENDENTE', 'yellow');
        log('🔧 Ações necessárias:', 'yellow');
        log('1. Acessar Vercel Dashboard', 'blue');
        log('2. Configurar Environment Variables:', 'blue');
        log('   - OPENAI_API_KEY=sua_chave_real', 'blue');
        log('   - RAPIDAPI_KEY=sua_chave_real', 'blue');
        log('   - RAPIDAPI_KEY_NEW=sua_chave_real', 'blue');
        log('   - SHOPEE_SCRAPER_API_KEY=sua_chave_real', 'blue');
        log('   - USE_REAL_AMAZON_API=true', 'blue');
        log('   - USE_REAL_SHOPEE_API=true', 'blue');
        log('   - USE_REAL_ALIEXPRESS_API=true', 'blue');
        log('   - USE_REAL_MERCADOLIVRE_API=true', 'blue');
        log('   - USE_REAL_REALTIME_API=true', 'blue');
        log('   - NODE_ENV=production', 'blue');
        log('3. Fazer redeploy', 'blue');
        log('4. Executar este script novamente', 'blue');
    }
    
    log('\n📞 SUPORTE:', 'bold');
    log('• Consulte: GUIA_VERCEL_CONFIGURACAO_URGENTE.md', 'blue');
    log('• Monitor: monitor-producao-vercel.html', 'blue');
    log('• Validação local: node backend/validacao-final-producao.js', 'blue');
}

// Executar teste
async function main() {
    log('🚀 TESTE DE PRODUÇÃO - Easy Gift Search', 'bold');
    log('Data: ' + new Date().toLocaleString('pt-BR'), 'blue');
    
    try {
        const result = await testProductionEndpoint();
        showNextSteps(result);
        
    } catch (error) {
        log('\n❌ FALHA NO TESTE', 'red');
        log(`Erro: ${error.message}`, 'red');
        showNextSteps(null);
        process.exit(1);
    }
}

main();
