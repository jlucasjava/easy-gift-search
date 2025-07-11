#!/usr/bin/env node
/**
 * 🚀 SCRIPT DE ATIVAÇÃO AUTOMÁTICA - VERCEL
 * Easy Gift Search - Production Activation
 * July 8, 2025
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🚀 EASY GIFT SEARCH - ATIVAÇÃO AUTOMÁTICA VERCEL'.green);
console.log('='.repeat(60));
console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}\n`);

// Ler configurações do .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Extrair variáveis
const envVars = {};
envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
            envVars[key.trim()] = value.trim();
        }
    }
});

console.log('📋 CONFIGURAÇÕES DETECTADAS:');
console.log('='.repeat(40));
Object.keys(envVars).forEach(key => {
    const value = envVars[key];
    const maskedValue = key.includes('KEY') || key.includes('SECRET') 
        ? value.substring(0, 8) + '...' 
        : value;
    console.log(`✅ ${key}: ${maskedValue}`);
});

// Variáveis essenciais para produção
const productionVars = {
    ...envVars,
    'NODE_ENV': 'production',
    'USE_REAL_APIS': 'true',
    'USE_REAL_AMAZON_API': 'true',
    'USE_REAL_SHOPEE_API': 'true',
    'USE_REAL_ALIEXPRESS_API': 'true',
    'USE_REAL_MERCADOLIVRE_API': 'true',
    'USE_REAL_REALTIME_API': 'true'
};

console.log('\n🔧 CONFIGURAÇÕES DE PRODUÇÃO:');
console.log('='.repeat(40));

// Gerar arquivo de configuração Vercel
const vercelEnvContent = Object.keys(productionVars)
    .map(key => `${key}="${productionVars[key]}"`)
    .join('\n');

fs.writeFileSync(path.join(__dirname, '..', 'vercel-env-config.txt'), vercelEnvContent);

console.log('📄 Arquivo vercel-env-config.txt criado com todas as variáveis\n');

// Gerar comandos Vercel CLI
const vercelCommands = Object.keys(productionVars)
    .map(key => `vercel env add ${key} production`)
    .join('\n');

fs.writeFileSync(path.join(__dirname, '..', 'vercel-cli-commands.txt'), vercelCommands);

console.log('⚡ PRÓXIMOS PASSOS PARA ATIVAÇÃO:');
console.log('='.repeat(40));
console.log('1️⃣  MÉTODO MANUAL (Recomendado):');
console.log('   🌐 Abra: https://vercel.com/dashboard');
console.log('   📁 Encontre: easy-gift-search');
console.log('   ⚙️  Vá em: Settings → Environment Variables');
console.log('   📋 Copie as variáveis de: vercel-env-config.txt');

console.log('\n2️⃣  MÉTODO CLI (Alternativo):');
console.log('   💻 npm install -g vercel');
console.log('   🔑 vercel login');
console.log('   📝 Execute comandos de: vercel-cli-commands.txt');

console.log('\n3️⃣  TESTE DE PRODUÇÃO:');
console.log('   🧪 node teste-final-producao.js');
console.log('   🌐 https://seu-projeto.vercel.app/api/status');

console.log('\n✨ TEMPO ESTIMADO: 10-15 minutos');
console.log('🎉 Resultado: Sistema 100% funcional em produção!');

// Criar script de teste pós-ativação
const testScript = `
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
            console.log(\`\\n🔍 Testando: \${endpoint}\`);
            
            const response = await fetch(\`https://easy-gift-search.vercel.app\${endpoint}\`);
            const data = await response.json();
            
            if (response.ok) {
                console.log('✅ Status: OK');
                console.log(\`📊 Dados: \${JSON.stringify(data).substring(0, 100)}...\`);
            } else {
                console.log('❌ Status: Erro');
                console.log(\`🔍 Erro: \${data.error || 'Desconhecido'}\`);
            }
        } catch (error) {
            console.log('❌ Falha na conexão');
            console.log(\`🔍 Erro: \${error.message}\`);
        }
    }
    
    console.log('\\n🏁 TESTE CONCLUÍDO');
}

testProduction();
`;

fs.writeFileSync(path.join(__dirname, 'teste-final-producao.js'), testScript);

console.log('\n📄 Script de teste criado: teste-final-producao.js');
console.log('\n🚀 PRONTO PARA ATIVAÇÃO! Execute os passos acima.');
