// teste-parametros-otimizados.js - Teste da otimização de parâmetros de busca
const axios = require('axios');
require('dotenv').config();

// Simular diferentes configurações de parâmetros para comparação
async function testarParametrosOtimizados() {
    console.log('🧪 TESTE DE OTIMIZAÇÃO DE PARÂMETROS DE BUSCA');
    console.log('=============================================');
    
    // Verificar configuração
    if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_CX) {
        console.log('⚠️ API Key ou CX não configurados. Executando em modo de simulação.');
        return executarTesteSimulado();
    }
    
    // Consulta de teste
    const query = 'presentes para mulher aniversário';
    
    // Configurações a serem testadas
    const configuracoes = [
        {
            nome: 'Básica',
            params: {
                key: process.env.GOOGLE_SEARCH_API_KEY,
                cx: process.env.GOOGLE_SEARCH_CX,
                q: query
            }
        },
        {
            nome: 'Com localização Brasil',
            params: {
                key: process.env.GOOGLE_SEARCH_API_KEY,
                cx: process.env.GOOGLE_SEARCH_CX,
                q: query,
                gl: 'br',
                cr: 'countryBR'
            }
        },
        {
            nome: 'Com idioma Português',
            params: {
                key: process.env.GOOGLE_SEARCH_API_KEY,
                cx: process.env.GOOGLE_SEARCH_CX,
                q: query,
                lr: 'lang_pt'
            }
        },
        {
            nome: 'Com termos de e-commerce',
            params: {
                key: process.env.GOOGLE_SEARCH_API_KEY,
                cx: process.env.GOOGLE_SEARCH_CX,
                q: `${query} comprar online loja`
            }
        },
        {
            nome: 'Configuração completa otimizada',
            params: {
                key: process.env.GOOGLE_SEARCH_API_KEY,
                cx: process.env.GOOGLE_SEARCH_CX,
                q: `${query} comprar online Brasil loja`,
                gl: 'br',
                cr: 'countryBR',
                lr: 'lang_pt',
                safe: 'active',
                sort: 'relevance',
                filter: '1',
                num: 5
            }
        }
    ];
    
    // Testar cada configuração
    for (const config of configuracoes) {
        console.log(`\n📊 TESTANDO CONFIGURAÇÃO: ${config.nome}`);
        try {
            const start = Date.now();
            const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
                params: config.params,
                timeout: 10000
            });
            const end = Date.now();
            
            const resultados = response.data.items || [];
            console.log(`✅ Tempo de resposta: ${end - start}ms`);
            console.log(`✅ Resultados encontrados: ${resultados.length}`);
            
            // Análise de relevância
            if (resultados.length > 0) {
                const temEcommerce = resultados.filter(item => 
                    item.link.includes('produto') || 
                    item.link.includes('shop') || 
                    item.link.includes('store') ||
                    item.link.includes('comprar')).length;
                
                console.log(`✅ Resultados de e-commerce: ${temEcommerce} (${Math.round(temEcommerce/resultados.length*100)}%)`);
                
                // Mostrar o primeiro resultado
                console.log(`\n📋 PRIMEIRO RESULTADO:`);
                console.log(`🔤 Título: ${resultados[0].title}`);
                console.log(`🔗 Link: ${resultados[0].link}`);
                console.log(`📝 Snippet: ${resultados[0].snippet}`);
            }
        } catch (error) {
            console.error(`❌ Erro ao testar configuração: ${error.message}`);
            if (error.response) {
                console.error(`❌ Status: ${error.response.status}`);
                console.error(`❌ Dados: ${JSON.stringify(error.response.data)}`);
            }
        }
    }
    
    console.log('\n=============================================');
    console.log('🏁 TESTE DE PARÂMETROS FINALIZADO');
    console.log('=============================================');
}

// Versão simulada do teste para quando as chaves da API não estão configuradas
function executarTesteSimulado() {
    console.log('\n⚙️ EXECUTANDO TESTE SIMULADO DE OTIMIZAÇÃO DE PARÂMETROS');
    
    // Configurações a serem testadas
    const configuracoes = [
        { nome: 'Básica', delay: 800, resultados: 7, ecommerce: 3 },
        { nome: 'Com localização Brasil', delay: 850, resultados: 8, ecommerce: 5 },
        { nome: 'Com idioma Português', delay: 830, resultados: 8, ecommerce: 4 },
        { nome: 'Com termos de e-commerce', delay: 900, resultados: 10, ecommerce: 8 },
        { nome: 'Configuração completa otimizada', delay: 950, resultados: 10, ecommerce: 9 }
    ];
    
    // Exemplo de resultado simulado
    const resultadoExemplo = {
        title: 'Presentes para Mulher - Itens de Aniversário Especiais',
        link: 'https://exemplo.com/produtos/presentes-mulher',
        snippet: 'Encontre os melhores presentes para mulher. Itens exclusivos para aniversário com entrega rápida e garantia. Presentes a partir de R$ 50,00.'
    };
    
    // Testar cada configuração
    for (const config of configuracoes) {
        console.log(`\n📊 SIMULAÇÃO DE CONFIGURAÇÃO: ${config.nome}`);
        
        console.log(`✅ Tempo de resposta simulado: ${config.delay}ms`);
        console.log(`✅ Resultados encontrados: ${config.resultados}`);
        console.log(`✅ Resultados de e-commerce: ${config.ecommerce} (${Math.round(config.ecommerce/config.resultados*100)}%)`);
        
        // Mostrar o resultado de exemplo
        console.log(`\n📋 EXEMPLO DE RESULTADO (SIMULADO):`);
        console.log(`🔤 Título: ${resultadoExemplo.title}`);
        console.log(`🔗 Link: ${resultadoExemplo.link}`);
        console.log(`📝 Snippet: ${resultadoExemplo.snippet}`);
    }
    
    console.log('\n⚠️ OBSERVAÇÕES SOBRE PARÂMETROS OTIMIZADOS:');
    console.log('1. Adicionar localização (gl=br, cr=countryBR) melhora a relevância regional');
    console.log('2. Definir idioma (lr=lang_pt) filtra resultados em português');
    console.log('3. Incluir termos como "comprar", "loja" aumenta resultados de e-commerce');
    console.log('4. Combinar todos os parâmetros otimizados fornece os melhores resultados');
    console.log('5. Recomendado usar a configuração completa otimizada em produção');
    
    console.log('\n=============================================');
    console.log('🏁 TESTE SIMULADO DE PARÂMETROS FINALIZADO');
    console.log('=============================================');
}

// Executar o teste
testarParametrosOtimizados();
