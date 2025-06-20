/**
 * Script para validar se as correções de duplicidade de função foram aplicadas corretamente
 */

// Importar o módulo corrigido
const googleService = require('./backend/services/googleSearchService');
const simulateGoogleResults = require('./backend/services/simulateGoogleResults');

console.log('🔍 Iniciando validação de correção do erro de função duplicada...');

// Verificar se a função simulateGoogleResults está sendo importada corretamente
try {
  console.log('✅ Verificando importação do módulo simulateGoogleResults...');
  
  if (typeof simulateGoogleResults === 'function') {
    console.log('✅ Módulo simulateGoogleResults importado com sucesso!');
  } else {
    console.error('❌ O módulo simulateGoogleResults não é uma função!');
    process.exit(1);
  }
  
  // Testar a função importada
  const resultados = simulateGoogleResults('teste', 2);
  
  if (Array.isArray(resultados) && resultados.length > 0) {
    console.log(`✅ Função simulateGoogleResults executada com sucesso - retornou ${resultados.length} resultados`);
  } else {
    console.error('❌ A função simulateGoogleResults não retornou um array de resultados válido!');
    process.exit(1);
  }
  
  // Verificar se a função está corretamente exposta no serviço
  console.log('✅ Verificando exportação da função no serviço googleSearchService...');
  
  if (typeof googleService.simulateGoogleResults === 'function') {
    console.log('✅ Função simulateGoogleResults exposta corretamente no serviço!');
  } else {
    console.error('❌ A função simulateGoogleResults não está exposta corretamente no serviço!');
    process.exit(1);
  }
  
  // Testar a função no serviço
  const resultadosServico = googleService.simulateGoogleResults('teste-servico', 2);
  
  if (Array.isArray(resultadosServico) && resultadosServico.length > 0) {
    console.log(`✅ Função googleService.simulateGoogleResults executada com sucesso - retornou ${resultadosServico.length} resultados`);
  } else {
    console.error('❌ A função googleService.simulateGoogleResults não retornou um array de resultados válido!');
    process.exit(1);
  }
  
  console.log('✨ Validação concluída com sucesso! A correção parece ter resolvido o problema de duplicidade.');
  console.log('🚀 O projeto deve estar pronto para ser implantado em produção agora.');
  
} catch (error) {
  console.error(`❌ Erro durante a validação: ${error.message}`);
  console.error(error);
  process.exit(1);
}
