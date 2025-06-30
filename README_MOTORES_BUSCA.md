# Easy Gift Search - Sistema de Motores de Busca

Este projeto implementa múltiplos motores de busca para a aplicação Easy Gift Search, permitindo consultar produtos em diversos marketplaces brasileiros com filtragem por preço e outras características.

## 📊 Motores de Busca Implementados

### 1. Google Custom Search API
- **Arquivo**: `backend/services/googleSearchService.js`
- **Rota**: `/api/search`
- **Características**: Utiliza a API do Google Custom Search para buscar produtos.

### 2. Custom Search (V1)
- **Arquivo**: `backend/services/customSearchService.js`
- **Rota**: `/api/custom-search`
- **Características**: Implementação com scraping básico de Mercado Livre e Americanas.

### 3. Custom Search V2
- **Arquivo**: `backend/services/customSearchServiceV2.js`
- **Rota**: `/api/custom-search-v2`
- **Características**: Versão avançada com proxy rotation, mais marketplaces e deduplicação aprimorada.

### 4. Hybrid Search (Recomendado)
- **Arquivo**: `backend/services/hybridSearchService.js`
- **Rota**: `/api/hybrid-search`
- **Características**: Combina múltiplas estratégias, cache avançado, rotação de User-Agent, filtragem rigorosa e fallback.

## 🛠️ Ferramentas de Diagnóstico e Monitoramento

### 1. Benchmark de Motores
- **Arquivo**: `backend/benchmark-motores.js`
- **Execução**: `node backend/benchmark-motores.js`
- **Saída**: Gera `benchmark-report.html` com comparação visual de todos os motores

### 2. Diagnóstico Completo
- **Arquivo**: `backend/diagnostico-completo.js`
- **Execução**: `node backend/diagnostico-completo.js`
- **Saída**: Gera `diagnostico-report.html` com análise detalhada e recomendações

### 3. Sistema de Monitoramento
- **Arquivo**: `backend/services/monitoringService.js`
- **Rota**: `/monitoring/dashboard`
- **Características**: Monitora desempenho em tempo real, gera métricas e logs detalhados

### 4. Interface de Integração Frontend
- **Arquivo**: `frontend-integration-test.html`
- **Uso**: Abra diretamente no navegador para testar os motores visualmente

## 🚀 Como Executar

### Instalação de Dependências
```bash
cd backend
npm install
```

### Executar Suite de Testes Completa
```bash
# No Windows
testar-tudo.bat

# No Linux/Mac
sh testar-tudo.sh
```

### Iniciar o Servidor
```bash
cd backend
npm run start
```

### Acessar Endpoints

1. **Google Search API**:
   ```
   GET http://localhost:3000/api/search?q=smartphone&maxPrice=1000&num=10
   ```

2. **Custom Search**:
   ```
   GET http://localhost:3000/api/custom-search?q=smartphone&maxPrice=1000&num=10
   ```

3. **Custom Search V2**:
   ```
   GET http://localhost:3000/api/custom-search-v2?q=smartphone&maxPrice=1000&num=10
   ```

4. **Hybrid Search**:
   ```
   GET http://localhost:3000/api/hybrid-search?q=smartphone&maxPrice=1000&num=10
   ```

5. **Dashboard de Monitoramento**:
   ```
   GET http://localhost:3000/monitoring/dashboard
   ```

## 📝 Parâmetros das Consultas

| Parâmetro | Descrição | Valor Padrão |
|-----------|-----------|--------------|
| q | Termo de busca | (obrigatório) |
| maxPrice | Preço máximo em reais | 10000 |
| num | Número de resultados | 10 |
| cache | Usar cache (true/false) | false |

## 📋 Relatórios e Diagnósticos

Após executar as ferramentas de diagnóstico, os seguintes arquivos são gerados:

- `backend/benchmark-report.html` - Relatório visual comparando todos os motores
- `backend/diagnostico-report.html` - Diagnóstico completo com recomendações
- `backend/benchmark-resultados.json` - Dados brutos do benchmark em formato JSON
- `backend/diagnostico-resultados.json` - Dados brutos do diagnóstico em formato JSON
- `backend/logs/busca-detalhado.log` - Logs detalhados de todas as consultas

## 🧩 Integrando com o Frontend

Para integrar com o frontend existente, recomendamos:

1. Utilizar o motor híbrido como padrão:
   ```javascript
   const API_URL = '/api/hybrid-search';
   ```

2. Implementar fallback para o Google Search API em caso de falha:
   ```javascript
   try {
     const response = await fetch(`${API_URL}?q=${query}&maxPrice=${maxPrice}`);
     // processo normal
   } catch (error) {
     console.error('Erro no motor híbrido, usando fallback:', error);
     const fallbackResponse = await fetch(`/api/search?q=${query}&maxPrice=${maxPrice}`);
     // processo com fallback
   }
   ```

## 🔍 Troubleshooting

Se os motores de busca não estiverem funcionando corretamente:

1. Verifique os logs em `backend/logs/busca-detalhado.log`
2. Execute o diagnóstico completo: `node backend/diagnostico-completo.js`
3. Verifique o dashboard de monitoramento: `http://localhost:3000/monitoring/dashboard`
4. Certifique-se que todas as dependências estão instaladas: `npm install`

## 📚 Documentação Adicional

- [ALTERNATIVAS_MOTOR_BUSCA.md](./ALTERNATIVAS_MOTOR_BUSCA.md) - Análise detalhada das alternativas de motores
- [RESUMO_IMPLEMENTACOES_MOTORES.md](./RESUMO_IMPLEMENTACOES_MOTORES.md) - Resumo das implementações realizadas
- [RESUMO_NOVAS_IMPLEMENTACOES.md](./RESUMO_NOVAS_IMPLEMENTACOES.md) - Resumo das novas ferramentas implementadas
