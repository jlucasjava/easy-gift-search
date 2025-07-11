#!/usr/bin/env node
/**
 * 🚀 PRODUCTION ACTIVATION SCRIPT
 * Easy Gift Search - July 8, 2025
 * 
 * This script guides you through activating the production environment
 */

const colors = require('colors');
const fs = require('fs');
const path = require('path');

console.log('🚀 EASY GIFT SEARCH - PRODUCTION ACTIVATION'.green.bold);
console.log('='.repeat(60).gray);
console.log(`📅 Date: ${new Date().toLocaleString('pt-BR')}\n`.cyan);

// Check current environment
console.log('🔍 CHECKING CURRENT ENVIRONMENT...'.yellow.bold);
console.log('='.repeat(40).gray);

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

console.log(`📁 .env file: ${envExists ? '✅ EXISTS' : '❌ MISSING'}`.white);

if (envExists) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasGoogleKey = envContent.includes('GOOGLE_SEARCH_API_KEY=AIza');
    const hasGoogleCX = envContent.includes('GOOGLE_SEARCH_CX=');
    const isGoogleEnabled = envContent.includes('USE_GOOGLE_SEARCH_API=true');
    
    console.log(`🔑 Google API Key: ${hasGoogleKey ? '✅ CONFIGURED' : '❌ MISSING'}`.white);
    console.log(`🎯 Google CX ID: ${hasGoogleCX ? '✅ CONFIGURED' : '❌ MISSING'}`.white);
    console.log(`🟢 Google API Enabled: ${isGoogleEnabled ? '✅ YES' : '❌ NO'}`.white);
}

console.log('\n📋 PRODUCTION ACTIVATION CHECKLIST'.yellow.bold);
console.log('='.repeat(40).gray);

const checklist = [
    {
        task: 'Local Environment Ready',
        status: envExists,
        description: 'All environment variables configured locally'
    },
    {
        task: 'Vercel Project Deployed',
        status: true, // We know it's deployed based on tests
        description: 'Project is deployed and accessible via browser'
    },
    {
        task: 'API Keys in Vercel',
        status: false, // This is what we need to do
        description: 'Environment variables configured in Vercel dashboard'
    },
    {
        task: 'Production Testing',
        status: false, // Will be done after configuration
        description: 'All endpoints tested in production environment'
    }
];

checklist.forEach((item, index) => {
    const statusIcon = item.status ? '✅' : '⏳';
    const statusText = item.status ? 'DONE' : 'PENDING';
    console.log(`${index + 1}. ${statusIcon} ${item.task}: ${statusText}`.white);
    console.log(`   ${item.description}`.gray);
});

console.log('\n🎯 NEXT STEPS - VERCEL CONFIGURATION'.yellow.bold);
console.log('='.repeat(40).gray);

console.log('1️⃣  OPEN VERCEL DASHBOARD:'.cyan.bold);
console.log('   🌐 https://vercel.com/dashboard'.underline);
console.log('   📁 Find your "easy-gift-search" project\n');

console.log('2️⃣  CONFIGURE ENVIRONMENT VARIABLES:'.cyan.bold);
console.log('   Go to Project Settings → Environment Variables\n');

// Read current .env and provide the exact values to copy
if (envExists) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    console.log('📋 COPY THESE EXACT VALUES:'.green.bold);
    console.log('   (Copy and paste each line into Vercel)\n'.gray);
    
    envLines.forEach(line => {
        if (line.includes('=')) {
            console.log(`   ${line}`.white);
        }
    });
}

console.log('\n3️⃣  ADDITIONAL PRODUCTION VARIABLES:'.cyan.bold);
console.log('   Add these for full functionality:\n');

const additionalVars = [
    'NODE_ENV=production',
    'USE_REAL_AMAZON_API=true',
    'USE_REAL_SHOPEE_API=true',
    'USE_REAL_ALIEXPRESS_API=true',
    'USE_REAL_MERCADOLIVRE_API=true',
    'USE_REAL_REALTIME_API=true'
];

additionalVars.forEach(variable => {
    console.log(`   ${variable}`.white);
});

console.log('\n4️⃣  REDEPLOY PROJECT:'.cyan.bold);
console.log('   After adding variables, trigger a new deployment\n');

console.log('5️⃣  TEST PRODUCTION:'.cyan.bold);
console.log('   Run: node teste-producao-final.js'.white);
console.log('   Or visit: https://easy-gift-search.vercel.app/api/status\n');

console.log('🆘 NEED HELP?'.red.bold);
console.log('='.repeat(40).gray);
console.log('📚 Documentation: CHECKLIST_FINAL_PRODUCAO.md'.white);
console.log('🔧 Configuration: APIS_REAIS_CONFIGURACAO_FINAL.md'.white);
console.log('🎯 Monitoring: monitor-producao-vercel.html'.white);

console.log('\n✨ ESTIMATED TIME: 10-15 minutes'.green.bold);
console.log('🎉 Once complete, your app will be fully functional in production!'.green);

// Create a quick verification script
const verificationScript = `
// Quick verification after Vercel configuration
async function testProduction() {
    try {
        const response = await fetch('https://easy-gift-search.vercel.app/api/status');
        const data = await response.json();
        console.log('✅ Production Status:', data);
        
        // Test search endpoint
        const searchResponse = await fetch('https://easy-gift-search.vercel.app/api/custom-search?query=smartphone&maxPrice=1000');
        const searchData = await searchResponse.json();
        console.log('✅ Search Working:', searchData.length > 0 ? 'YES' : 'NO');
        
    } catch (error) {
        console.error('❌ Production Test Failed:', error.message);
    }
}

// Uncomment to test after configuration:
// testProduction();
`;

fs.writeFileSync(path.join(__dirname, 'verify-production-quick.js'), verificationScript);
console.log('\n📄 Created: verify-production-quick.js (for testing after setup)'.gray);
