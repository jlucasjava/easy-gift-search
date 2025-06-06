#!/usr/bin/env node
/**
 * VALIDAÇÃO FINAL PARA PRODUÇÃO - Easy Gift Search
 * Este script verifica se tudo está configurado corretamente para deploy em produção
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VALIDAÇÃO FINAL PARA PRODUÇÃO - Easy Gift Search');
console.log('=' .repeat(60));

// Cores para console
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

let allChecksPass = true;

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
    const exists = fs.existsSync(filePath);
    log(`${exists ? '✅' : '❌'} ${description}: ${exists ? 'OK' : 'FALTANDO'}`, exists ? 'green' : 'red');
    if (!exists) allChecksPass = false;
    return exists;
}

function checkEnvVariable(envContent, varName, shouldBeTrue = false) {
    const regex = new RegExp(`${varName}=(.+)`, 'i');
    const match = envContent.match(regex);
    
    if (!match) {
        log(`❌ ${varName}: NÃO ENCONTRADA`, 'red');
        allChecksPass = false;
        return false;
    }
    
    const value = match[1].trim();
    const isConfigured = value !== 'your_api_key_here' && value !== 'your_openai_api_key_here' && 
                        value !== 'your_rapidapi_key_here' && value !== 'your_shopee_scraper_api_key_here';
    
    if (shouldBeTrue) {
        const isTrue = value.toLowerCase() === 'true';
        log(`${isTrue ? '✅' : '❌'} ${varName}: ${value}`, isTrue ? 'green' : 'red');
        if (!isTrue) allChecksPass = false;
        return isTrue;
    } else {
        log(`${isConfigured ? '✅' : '⚠️'} ${varName}: ${isConfigured ? 'CONFIGURADA' : 'PLACEHOLDER'}`, 
            isConfigured ? 'green' : 'yellow');
        return { configured: isConfigured, value };
    }
}

// 1. Verificar arquivos essenciais
log('\n📁 1. VERIFICAÇÃO DE ARQUIVOS', 'bold');
const rootPath = path.join(__dirname, '..');
const backendPath = __dirname;

const essentialFiles = [
    [path.join(backendPath, '.env'), 'Arquivo .env do backend'],
    [path.join(rootPath, '.env.production'), 'Arquivo .env.production'],
    [path.join(rootPath, 'package.json'), 'Package.json principal'],
    [path.join(backendPath, 'package.json'), 'Package.json do backend'],
    [path.join(rootPath, 'vercel.json'), 'Configuração do Vercel']
];

essentialFiles.forEach(([file, desc]) => checkFile(file, desc));

// 2. Verificar configurações do .env local
log('\n🔧 2. VERIFICAÇÃO DO .ENV LOCAL', 'bold');
const envPath = path.join(backendPath, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Verificar APIs principais (devem estar true)
    const mainAPIs = [
        'USE_REAL_AMAZON_API',
        'USE_REAL_SHOPEE_API', 
        'USE_REAL_ALIEXPRESS_API',
        'USE_REAL_MERCADOLIVRE_API',
        'USE_REAL_REALTIME_API'
    ];
    
    log('APIs Principais (5 obrigatórias):');
    let activeAPIs = 0;
    mainAPIs.forEach(api => {
        if (checkEnvVariable(envContent, api, true)) {
            activeAPIs++;
        }
    });
    
    log(`\n📊 Status: ${activeAPIs}/5 APIs principais ativas`, activeAPIs === 5 ? 'green' : 'red');
    
    // Verificar chaves de API
    log('\n🔑 Chaves de API:');
    const apiKeys = [
        'OPENAI_API_KEY',
        'RAPIDAPI_KEY',
        'RAPIDAPI_KEY_NEW', 
        'SHOPEE_SCRAPER_API_KEY'
    ];
    
    let configuredKeys = 0;
    apiKeys.forEach(key => {
        const result = checkEnvVariable(envContent, key);
        if (result.configured) configuredKeys++;
    });
    
    log(`\n📊 Status: ${configuredKeys}/4 chaves configuradas localmente`, configuredKeys > 0 ? 'yellow' : 'red');
}

// 3. Verificar .env.production
log('\n🚀 3. VERIFICAÇÃO DO .ENV.PRODUCTION', 'bold');
const prodEnvPath = path.join(rootPath, '.env.production');
if (fs.existsSync(prodEnvPath)) {
    const prodEnvContent = fs.readFileSync(prodEnvPath, 'utf8');
    
    const mainAPIs = [
        'USE_REAL_AMAZON_API',
        'USE_REAL_SHOPEE_API',
        'USE_REAL_ALIEXPRESS_API', 
        'USE_REAL_MERCADOLIVRE_API',
        'USE_REAL_REALTIME_API'
    ];
    
    let activeProdAPIs = 0;
    mainAPIs.forEach(api => {
        if (checkEnvVariable(prodEnvContent, api, true)) {
            activeProdAPIs++;
        }
    });
    
    log(`\n📊 Status: ${activeProdAPIs}/5 APIs configuradas para produção`, activeProdAPIs === 5 ? 'green' : 'red');
}

// 4. Verificar package.json
log('\n📦 4. VERIFICAÇÃO DO PACKAGE.JSON', 'bold');
const packagePath = path.join(rootPath, 'package.json');
if (fs.existsSync(packagePath)) {
    try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        log(`✅ Nome: ${packageJson.name}`, 'green');
        log(`✅ Versão: ${packageJson.version}`, 'green');
        
        // Verificar scripts essenciais
        const essentialScripts = ['build', 'start', 'dev'];
        essentialScripts.forEach(script => {
            const hasScript = packageJson.scripts && packageJson.scripts[script];
            log(`${hasScript ? '✅' : '❌'} Script ${script}: ${hasScript ? 'OK' : 'FALTANDO'}`, 
                hasScript ? 'green' : 'red');
            if (!hasScript) allChecksPass = false;
        });
        
    } catch (error) {
        log('❌ Erro ao ler package.json: ' + error.message, 'red');
        allChecksPass = false;
    }
}

// 5. Verificar configuração do Git
log('\n🔄 5. VERIFICAÇÃO DO GIT', 'bold');
try {
    const { execSync } = require('child_process');
    
    // Verificar branch atual
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    log(`✅ Branch atual: ${currentBranch}`, 'green');
    
    // Verificar status
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    const isClean = status === '';
    log(`${isClean ? '✅' : '⚠️'} Working directory: ${isClean ? 'LIMPO' : 'TEM ALTERAÇÕES'}`, 
        isClean ? 'green' : 'yellow');
    
    // Verificar se está sincronizado com remote
    try {
        execSync('git fetch', { stdio: 'ignore' });
        const behind = execSync('git rev-list HEAD..origin/main --count', { encoding: 'utf8' }).trim();
        const ahead = execSync('git rev-list origin/main..HEAD --count', { encoding: 'utf8' }).trim();
        
        log(`${behind === '0' ? '✅' : '⚠️'} Commits atrás do remote: ${behind}`, behind === '0' ? 'green' : 'yellow');
        log(`${ahead === '0' ? '✅' : '⚠️'} Commits à frente do remote: ${ahead}`, ahead === '0' ? 'green' : 'yellow');
    } catch (error) {
        log('⚠️ Não foi possível verificar sincronização com remote', 'yellow');
    }
    
} catch (error) {
    log('❌ Erro ao verificar Git: ' + error.message, 'red');
}

// 6. Resumo final e próximos passos
log('\n' + '='.repeat(60), 'bold');
log('📋 RESUMO FINAL', 'bold');

if (allChecksPass) {
    log('🎉 TODAS AS VERIFICAÇÕES PASSARAM!', 'green');
    log('✅ O projeto está pronto para produção', 'green');
} else {
    log('⚠️ ALGUMAS VERIFICAÇÕES FALHARAM', 'yellow');
    log('❌ Corrija os problemas antes do deploy', 'red');
}

log('\n🚀 PRÓXIMOS PASSOS PARA PRODUÇÃO:', 'bold');
log('1. Acessar Vercel Dashboard (https://vercel.com/dashboard)', 'blue');
log('2. Ir para o projeto easy-gift-search', 'blue');
log('3. Configurar Environment Variables:', 'blue');
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
log('4. Fazer redeploy automático', 'blue');
log('5. Testar endpoint: https://easy-gift-search.vercel.app/api/status', 'blue');

log('\n✨ Status esperado após configuração: 5/5 APIs ativas em produção', 'green');
log('=' .repeat(60), 'bold');
