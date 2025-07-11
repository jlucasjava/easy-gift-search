/**
 * 🚀 TESTE SERVIDOR OTIMIZADO
 * Script simples para testar as melhorias aplicadas
 */

const path = require('path');

// Definir diretório correto
process.chdir(path.join(__dirname));
console.log('📁 Diretório atual:', process.cwd());

// Verificar se os arquivos existem
const fs = require('fs');
const files = [
  'server.js',
  'services/advancedCacheService.js',
  'services/performanceMonitor.js',
  'middleware/clusterMiddleware.js',
  'middleware/advancedRateLimit.js'
];

console.log('\n🔍 Verificando arquivos criados:');
for (const file of files) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NÃO ENCONTRADO`);
  }
}

// Tentar iniciar o servidor
console.log('\n🚀 Tentando iniciar servidor...');
try {
  require('./server.js');
} catch (error) {
  console.error('❌ Erro ao iniciar servidor:', error.message);
}
