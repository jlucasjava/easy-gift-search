# Motor de Busca Personalizado - Easy Gift Search

## Visão Geral

O Motor de Busca Personalizado foi desenvolvido para solucionar as limitações do Google Custom Search API, principalmente relacionadas à filtragem por preço e à confiabilidade dos resultados. Este motor faz scraping direto dos principais marketplaces brasileiros para obter resultados mais precisos e dentro do orçamento especificado.

## Características Principais

- **Scraping Direto**: Consulta diretamente os sites dos marketplaces em vez de depender de APIs de terceiros
- **Filtragem de Preço Precisa**: Garante que os resultados estejam dentro da faixa de preço especificada
- **Múltiplos Marketplaces**: Integrado com Mercado Livre, Americanas, Magazine Luiza e Shopee
- **Remoção de Duplicados**: Elimina produtos duplicados ou muito similares
- **Ordenação por Relevância**: Prioriza produtos com preços mais próximos do máximo (mas dentro do limite)
- **Cache Inteligente**: Armazena resultados em cache para melhorar performance e reduzir carga nos sites

## Como Usar

### 1. Endpoint REST API

```
GET /api/custom-search/buscar?query=TERMO&precoMax=VALOR
```

**Parâmetros:**
- `query`: Termo de busca (obrigatório)
- `precoMax`: Preço máximo em reais (opcional)
- `precoMin`: Preço mínimo em reais (opcional)
- `idade`: Idade para contextualizar a busca (opcional)
- `genero`: Gênero para contextualizar a busca (opcional)
- `num`: Número máximo de resultados (opcional, padrão: 10)

**Exemplo:**
```
GET /api/custom-search/buscar?query=fone%20de%20ouvido&precoMax=150
```

### 2. Endpoint Comparativo

Para comparar os resultados entre o Google Search e o Motor Personalizado:

```
GET /api/custom-search/comparar?query=TERMO&precoMax=VALOR
```

Este endpoint retorna resultados de ambos os motores, permitindo uma comparação direta.

### 3. Importação Direta no Código

```javascript
const customSearchService = require('./services/customSearchService');

// Exemplo de uso
async function buscarProdutos() {
  const filtros = {
    query: 'smartphone',
    precoMax: 1000,
    num: 5
  };
  
  const resultados = await customSearchService.buscarProdutos(filtros);
  console.log(`Encontrados ${resultados.length} produtos`);
}
```

## Configuração e Dependências

O motor de busca personalizado depende das seguintes bibliotecas:

- **cheerio**: Para parsing de HTML
- **axios**: Para requisições HTTP
- **axios-retry**: Para retry automático em caso de falhas
- **node-cache**: Para caching de resultados
- **puppeteer-core** (opcional): Para casos onde o scraping simples não for suficiente

Todas estas dependências já estão configuradas no package.json.

## Limitações e Considerações

1. **Anti-Scraping**: Alguns sites podem implementar medidas anti-scraping que podem limitar a eficácia do motor
2. **Shopee Simulado**: A implementação atual para Shopee é simplificada e retorna resultados simulados
3. **Manutenção Regular**: Os seletores CSS podem mudar se os sites alterarem seu layout, exigindo atualizações
4. **Velocidade**: O scraping é mais lento que chamadas API, mas o sistema de cache compensa isso para buscas repetidas

## Testes e Validação

Para testar o motor de busca personalizado:

```bash
node testar-custom-search.js
```

Para comparar com o Google Search:

```bash
node testar-comparativo.js
```

## Próximos Passos

1. Implementar scraping completo para Shopee usando Puppeteer
2. Adicionar mais marketplaces brasileiros (Casas Bahia, Amazon BR, etc.)
3. Melhorar algoritmos de extração de preços para casos mais complexos
4. Implementar rotação de user-agents e proxies para evitar bloqueios

---

Documentação criada em 27 de junho de 2025.
