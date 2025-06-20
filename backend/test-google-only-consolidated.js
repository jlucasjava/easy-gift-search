/**
 * Teste Consolidado - Google Custom Search Only
 * 
 * Este script testa todas as funcionalidades da API do Google Custom Search:
 * - Pesquisa básica
 * - Pesquisa com filtros
 * - Recomendações
 * - Status da API
 */

require('dotenv').config();
const axios = require('axios');
const colors = require('colors/safe');

const googleSearchService = require('./services/googleSearchService');
const apiStatus = require('./config/apiStatus');

console.log(colors.cyan('\n===== TESTE CONSOLIDADO - GOOGLE CUSTOM SEARCH =====\n'));

// Testa se as variáveis de ambiente estão configuradas
async function testarConfiguracao() {  console.log(colors.yellow('Verificando configuração da API do Google Custom Search...'));
  
  const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const googleCseId = process.env.GOOGLE_SEARCH_CX;
  
  if (!googleApiKey || !googleCseId) {
    console.log(colors.red('❌ Erro: Configuração da API do Google incompleta!'));
    console.log(colors.gray('  - Verifique se as variáveis GOOGLE_SEARCH_API_KEY e GOOGLE_SEARCH_CX estão definidas no arquivo .env'));
    return false;
  }
  
  console.log(colors.green('✓ Configuração da API do Google detectada!'));
  return true;
}

// Testa a pesquisa básica
async function testarPesquisaBasica() {
  try {
    console.log(colors.yellow('\nTestando pesquisa básica do Google...'));
    
    const query = 'presente aniversário';
    console.log(colors.gray(`  Consultando: "${query}"`));
    
    const resultado = await googleSearchService.searchProducts(query);
    
    if (!resultado || !resultado.items || resultado.items.length === 0) {
      console.log(colors.red('❌ Erro: Pesquisa não retornou resultados!'));
      return false;
    }
    
    console.log(colors.green(`✓ Pesquisa básica retornou ${resultado.items.length} resultados!`));
    console.log(colors.gray(`  Primeiro resultado: "${resultado.items[0].title}"`));
    return true;
  } catch (error) {
    console.log(colors.red(`❌ Erro na pesquisa básica: ${error.message}`));
    return false;
  }
}

// Testa a pesquisa com filtros
async function testarPesquisaComFiltros() {
  try {
    console.log(colors.yellow('\nTestando pesquisa com filtros...'));
    
    const query = 'presente aniversário';
    const filtros = {
      preco: '1-100',
      genero: 'feminino'
    };
    
    console.log(colors.gray(`  Consultando: "${query}" com filtros: ${JSON.stringify(filtros)}`));
    
    const resultado = await googleSearchService.searchProducts(query, filtros);
    
    if (!resultado || !resultado.items || resultado.items.length === 0) {
      console.log(colors.red('❌ Erro: Pesquisa com filtros não retornou resultados!'));
      return false;
    }
    
    console.log(colors.green(`✓ Pesquisa com filtros retornou ${resultado.items.length} resultados!`));
    return true;
  } catch (error) {
    console.log(colors.red(`❌ Erro na pesquisa com filtros: ${error.message}`));
    return false;
  }
}

// Testa o serviço de recomendações
async function testarRecomendacoes() {
  try {
    console.log(colors.yellow('\nTestando serviço de recomendações...'));
    
    const query = 'presente namorado tecnologia';
    console.log(colors.gray(`  Consultando recomendações para: "${query}"`));
    
    const resultado = await googleSearchService.getRecommendations(query);
    
    if (!resultado || !resultado.items || resultado.items.length === 0) {
      console.log(colors.red('❌ Erro: Serviço de recomendações não retornou resultados!'));
      return false;
    }
    
    console.log(colors.green(`✓ Serviço de recomendações retornou ${resultado.items.length} resultados!`));
    return true;
  } catch (error) {
    console.log(colors.red(`❌ Erro no serviço de recomendações: ${error.message}`));
    return false;
  }
}

// Testa o status da API
async function testarStatusAPI() {
  try {
    console.log(colors.yellow('\nVerificando status da API do Google...'));
    
    const status = await apiStatus.verificarStatusGoogleSearch();
    
    if (!status || !status.ativo) {
      console.log(colors.red(`❌ API do Google Custom Search não está ativa: ${status.mensagem}`));
      return false;
    }
    
    console.log(colors.green(`✓ API do Google Custom Search está ativa!`));
    return true;
  } catch (error) {
    console.log(colors.red(`❌ Erro ao verificar status da API: ${error.message}`));
    return false;
  }
}

// Executa todos os testes
async function executarTestes() {
  let configuracaoOk = await testarConfiguracao();
  
  if (!configuracaoOk) {
    console.log(colors.red('\n❌ Não é possível continuar os testes sem a configuração correta.'));
    console.log(colors.yellow('  Verifique o arquivo .env e tente novamente.'));
    return;
  }
  
  const resultados = {
    pesquisaBasica: await testarPesquisaBasica(),
    pesquisaComFiltros: await testarPesquisaComFiltros(),
    recomendacoes: await testarRecomendacoes(),
    statusAPI: await testarStatusAPI()
  };
  
  // Resumo final
  console.log(colors.cyan('\n===== RESUMO DOS TESTES =====\n'));
  
  Object.entries(resultados).forEach(([teste, sucesso]) => {
    console.log(`${sucesso ? colors.green('✓') : colors.red('❌')} ${teste}: ${sucesso ? 'Sucesso' : 'Falha'}`);
  });
  
  const totalTestes = Object.values(resultados).length;
  const testesSucesso = Object.values(resultados).filter(r => r).length;
  
  console.log(colors.cyan(`\nResultado Final: ${testesSucesso}/${totalTestes} testes com sucesso`));
  
  if (testesSucesso === totalTestes) {
    console.log(colors.green('\n✓ Todos os testes foram bem-sucedidos! O sistema está funcionando corretamente apenas com a API do Google Custom Search.'));
  } else {
    console.log(colors.yellow('\n⚠️ Alguns testes falharam. Verifique os erros acima e faça as correções necessárias.'));
  }
}

// Executa os testes
executarTestes().catch(error => {
  console.error(colors.red(`\nErro fatal nos testes: ${error.message}`));
});
