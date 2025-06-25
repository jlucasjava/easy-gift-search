/**
 * Script para corrigir erros de sintaxe no arquivo googleSearchService.js
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'services', 'googleSearchService.js');

// Ler o conteúdo atual do arquivo
let fileContent = fs.readFileSync(filePath, 'utf8');

// Verificar conteúdo antes da linha 926
const lines = fileContent.split('\n');
console.log('Linhas ao redor da linha 926:');
for (let i = 920; i < 930; i++) {
  console.log(`${i}: ${lines[i-1]}`);
}

// Tenta corrigir o problema (remover o fechamento de chave extra)
console.log('\nVerificando e corrigindo o arquivo...');

// Verificar se há alguma chave de fechamento extra
const openBraces = fileContent.match(/{/g)?.length || 0;
const closeBraces = fileContent.match(/}/g)?.length || 0;

console.log(`Chaves abertas: ${openBraces}`);
console.log(`Chaves fechadas: ${closeBraces}`);

if (closeBraces > openBraces) {
  console.log('⚠️ Há mais chaves de fechamento que de abertura!');
  
  // Corrigir o arquivo removendo a chave de fechamento extra na linha 926
  const correctedContent = fileContent.split('\n')
    .filter((line, index) => {
      // Se for a linha 926 (índice 925) e contiver apenas "}", pule-a
      return !(index === 925 && line.trim() === '}');
    })
    .join('\n');
    
  // Salvar o arquivo corrigido
  fs.writeFileSync(filePath, correctedContent, 'utf8');
  console.log('✅ Arquivo corrigido e salvo!');
} else {
  console.log('O número de chaves parece estar correto.');
}

// Verificar se o arquivo tem erro de sintaxe agora
try {
  require(filePath);
  console.log('✅ Arquivo carregado com sucesso, sem erros de sintaxe.');
} catch (e) {
  console.error('❌ Ainda há erro de sintaxe:', e.message);
}
