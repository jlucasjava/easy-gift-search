/**
 * Script para testar a qualidade dos resultados de busca com foco em produtos reais
 * Este script testa se as melhorias feitas na busca estão funcionando corretamente
 * e se estamos obtendo links e imagens reais de produtos em marketplaces conhecidos.
 */

require('dotenv').config();
const axios = require('axios');
const colors = require('colors/safe');
const googleSearchService = require('./services/googleSearchService');
const fs = require('fs');
const path = require('path');

console.log(colors.cyan('🧪 TESTE DE QUALIDADE DE RESULTADOS'));
console.log(colors.cyan('==============================='));
console.log('');

// Verificar configuração da API
console.log(colors.yellow('📋 Verificando configuração:'));
console.log(`Google Search API Key: ${process.env.GOOGLE_SEARCH_API_KEY ? colors.green('✓ Configurada') : colors.red('✗ Não configurada')}`);
console.log(`Google Search CX: ${process.env.GOOGLE_SEARCH_CX ? colors.green('✓ Configurado') : colors.red('✗ Não configurado')}`);
console.log(`Uso da API Google: ${process.env.USE_GOOGLE_SEARCH_API === 'true' ? colors.green('✓ Ativado') : colors.yellow('✗ Desativado')}`);
console.log('');

// Termos de teste
const termosDeTeste = [
  'celular samsung galaxy',
  'fone de ouvido bluetooth',
  'smart tv 4k',
  'perfume masculino',
  'presente para criança 10 anos'
];

// Testa todos os termos
async function testarTodosBuscas() {
  console.log(colors.yellow('🔍 Testando buscas com termos diferentes:'));
  console.log('');
  
  const resultados = {};
  
  for (const termo of termosDeTeste) {
    console.log(colors.cyan(`Buscando por: "${termo}"...`));
    
    try {
      // Buscar produtos usando o serviço
      const filtros = {
        categoria: termo,
        page: 1,
        num: 5
      };
      
      const resultado = await googleSearchService.buscarPresentesGoogle(filtros);
      
      // Analisar resultados
      const totalProdutos = resultado.produtos?.length || 0;
      const produtosValidos = resultado.produtos?.filter(p => 
        googleSearchService.isValidMarketplace(p.url) && 
        p.imagem && 
        p.imagem.startsWith('http')
      ).length || 0;
      
      const porcentagemValidos = totalProdutos > 0 ? Math.round((produtosValidos / totalProdutos) * 100) : 0;
      
      // Registrar métricas
      resultados[termo] = {
        total: totalProdutos,
        validos: produtosValidos,
        porcentagem: porcentagemValidos,
        produtos: resultado.produtos?.map(p => ({
          titulo: p.nome || p.titulo,
          url: p.url,
          marketplace: googleSearchService.detectMarketplace(p.url),
          temImagem: !!p.imagem,
          imagemValida: p.imagem && p.imagem.startsWith('http')
        }))
      };
      
      // Mostrar resultados
      if (porcentagemValidos >= 80) {
        console.log(colors.green(`✓ ${produtosValidos}/${totalProdutos} (${porcentagemValidos}%) produtos são de marketplaces válidos com imagens reais`));
      } else if (porcentagemValidos >= 50) {
        console.log(colors.yellow(`⚠ ${produtosValidos}/${totalProdutos} (${porcentagemValidos}%) produtos são de marketplaces válidos com imagens reais`));
      } else {
        console.log(colors.red(`✗ ${produtosValidos}/${totalProdutos} (${porcentagemValidos}%) produtos são de marketplaces válidos com imagens reais`));
      }
      
      // Mostrar marketplaces encontrados
      const marketplaces = resultado.produtos?.map(p => googleSearchService.detectMarketplace(p.url)).filter(Boolean);
      const marketplacesUnicos = [...new Set(marketplaces)].join(', ');
      console.log(`Marketplaces encontrados: ${colors.cyan(marketplacesUnicos || 'Nenhum')}`);
      
    } catch (error) {
      console.error(colors.red(`✗ Erro ao buscar "${termo}": ${error.message}`));
    }
    
    console.log('');
  }
  
  // Resumo final
  console.log(colors.yellow('📊 RESUMO FINAL:'));
  console.log('');
  
  let totalGeral = 0;
  let validosGeral = 0;
  
  for (const termo in resultados) {
    totalGeral += resultados[termo].total;
    validosGeral += resultados[termo].validos;
    
    const cor = resultados[termo].porcentagem >= 80 ? colors.green :
               resultados[termo].porcentagem >= 50 ? colors.yellow : colors.red;
    
    console.log(`${termo}: ${cor(`${resultados[termo].porcentagem}%`)} válidos (${resultados[termo].validos}/${resultados[termo].total})`);
  }
  
  const porcentagemGeral = totalGeral > 0 ? Math.round((validosGeral / totalGeral) * 100) : 0;
  console.log('');
  console.log(`${colors.cyan('Eficácia Geral:')} ${porcentagemGeral >= 80 ? colors.green(`${porcentagemGeral}%`) : 
                             porcentagemGeral >= 50 ? colors.yellow(`${porcentagemGeral}%`) : 
                             colors.red(`${porcentagemGeral}%`)} (${validosGeral}/${totalGeral} produtos válidos)`);
  
  // Criar relatório
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const relatorio = {
    timestamp: new Date().toISOString(),
    resumo: {
      totalProdutos: totalGeral,
      produtosValidos: validosGeral,
      eficaciaGeral: porcentagemGeral
    },
    detalhes: resultados,
    configuracao: {
      googleSearchApiKey: !!process.env.GOOGLE_SEARCH_API_KEY,
      googleSearchCx: !!process.env.GOOGLE_SEARCH_CX,
      useGoogleSearchApi: process.env.USE_GOOGLE_SEARCH_API === 'true'
    }
  };
  
  const relatorioJson = JSON.stringify(relatorio, null, 2);
  const nomeArquivo = `teste-qualidade-resultados-${timestamp}.json`;
  
  fs.writeFileSync(path.join(__dirname, nomeArquivo), relatorioJson);
  console.log('');
  console.log(colors.cyan(`Relatório detalhado salvo em: ${nomeArquivo}`));
}

// Executar testes
testarTodosBuscas();
