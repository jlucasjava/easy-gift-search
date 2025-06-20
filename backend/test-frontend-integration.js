// Script para testar a integração frontend-backend
// Este script verifica se os componentes estão funcionando corretamente
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const axios = require('axios');

// Criar interface para interagir com o usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Constantes
const API_URL = 'http://localhost:3000/api';
const ENV_FILE = path.join(__dirname, '.env');

async function main() {
  console.log('🔍 Iniciando teste de integração frontend-backend');
  console.log('------------------------------------------------');
  
  // Verificar se o servidor está rodando
  try {
    const testResponse = await axios.get(`${API_URL}/test`);
    console.log(`✅ Servidor respondendo: ${testResponse.data.message}`);
    console.log(`🌐 Ambiente: ${testResponse.data.environment}`);
  } catch (error) {
    console.error('❌ Servidor não está respondendo. Inicie-o com "node server.js"');
    console.error(`  Erro: ${error.message}`);
    rl.close();
    return;
  }
  
  // Verificar configuração da API do Google
  try {
    console.log('\n🔑 Verificando configuração da API do Google...');
    
    if (!fs.existsSync(ENV_FILE)) {
      console.error('❌ Arquivo .env não encontrado.');
      rl.close();
      return;
    }
    
    const envContent = fs.readFileSync(ENV_FILE, 'utf8');
    const apiKey = envContent.match(/GOOGLE_SEARCH_API_KEY=(.+)/)?.[1];
    const cx = envContent.match(/GOOGLE_SEARCH_CX=(.+)/)?.[1];
    
    if (!apiKey || apiKey === 'sua-chave-api-aqui') {
      console.error('❌ GOOGLE_SEARCH_API_KEY não configurada ou inválida no .env');
    } else {
      console.log('✅ GOOGLE_SEARCH_API_KEY configurada');
    }
    
    if (!cx || cx === 'seu-cx-id-aqui') {
      console.error('❌ GOOGLE_SEARCH_CX não configurado ou inválido no .env');
    } else {
      console.log('✅ GOOGLE_SEARCH_CX configurado');
    }
    
    // Testar API do Google diretamente
    console.log('\n🧪 Testando consulta com a API do Google...');
    try {
      const testQuery = 'presente tecnologia';
      const response = await axios.get(`${API_URL}/products?query=${encodeURIComponent(testQuery)}`);
      
      if (response.data && Array.isArray(response.data.produtos)) {
        const produtos = response.data.produtos;
        console.log(`✅ API retornou ${produtos.length} produtos`);
        
        if (produtos.length > 0) {
          console.log('\n📦 Exemplo de produto retornado:');
          const sample = produtos[0];
          console.log(` - ID: ${sample.id}`);
          console.log(` - Nome: ${sample.nome}`);
          console.log(` - Preço: ${sample.preco}`);
          console.log(` - Imagem: ${sample.imagem ? '✓' : '✗'}`);
          console.log(` - URL: ${sample.url}`);
          console.log(` - Marketplace: ${sample.marketplace}`);
          
          // Verificar se está usando API real ou simulada
          if (sample.marketplace === 'Google' && sample.id.startsWith('google-') && sample.imagem?.includes('placeholder.com')) {
            console.log('\n⚠️ ATENÇÃO: API está usando dados SIMULADOS');
            console.log('   Configure corretamente as chaves da API para usar dados reais');
          } else {
            console.log('\n✅ API está usando dados REAIS da Google Custom Search API');
          }
        }
      } else {
        console.error('❌ Formato de resposta inesperado');
      }
    } catch (error) {
      console.error(`❌ Erro ao testar API: ${error.message}`);
    }
    
    // Verificar integridade do HTML e JavaScript do frontend
    console.log('\n🧩 Verificando integridade do frontend...');
    
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const jsPath = path.join(__dirname, '..', 'public', 'js', 'app.js');
    
    if (!fs.existsSync(htmlPath)) {
      console.error('❌ index.html não encontrado');
    } else {
      console.log('✅ index.html encontrado');
    }
    
    if (!fs.existsSync(jsPath)) {
      console.error('❌ public/js/app.js não encontrado');
    } else {
      console.log('✅ public/js/app.js encontrado');
      
      // Verificar se o app.js contém as funções necessárias
      const jsContent = fs.readFileSync(jsPath, 'utf8');
      
      const checks = {
        'buscarProdutos': jsContent.includes('function buscarProdutos'),
        'renderGrid': jsContent.includes('function renderGrid'),
        'formatarPreco': jsContent.includes('function formatarPreco'),
        'validarImagem': jsContent.includes('function validarImagem'),
        'formatarTitulo': jsContent.includes('function formatarTitulo'),
      };
      
      let allOk = true;
      for (const [func, exists] of Object.entries(checks)) {
        if (!exists) {
          console.error(`❌ Função ${func} não encontrada em app.js`);
          allOk = false;
        }
      }
      
      if (allOk) {
        console.log('✅ Todas as funções essenciais encontradas em app.js');
      }
    }
    
  } catch (error) {
    console.error(`❌ Erro durante verificação: ${error.message}`);
  }
  
  console.log('\n✅ Teste de integração concluído');
  console.log('------------------------------------------------');
  console.log('🚀 Próximos passos:');
  console.log('1. Certifique-se de que o servidor está rodando com "node server.js"');
  console.log('2. Abra http://localhost:3000 no navegador para testar a interface');
  console.log('3. Verifique se os resultados da busca estão sendo exibidos corretamente');
  console.log('4. Teste o salvamento de favoritos');
  console.log('------------------------------------------------');
  
  rl.close();
}

main();
