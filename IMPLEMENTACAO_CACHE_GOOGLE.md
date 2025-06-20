# Implementação de Cache e Otimização do Google Custom Search

Este documento detalha as implementações de cache e otimizações de parâmetros de busca adicionados ao serviço do Google Custom Search na aplicação Easy Gift Search.

## 1. Sistema de Cache

Foi implementado um sistema de cache para reduzir o número de chamadas à API do Google Custom Search e melhorar o desempenho da aplicação.

### 1.1. Componentes Implementados

- **NodeCache**: Biblioteca leve para cache em memória
- **Cache por chave personalizada**: Armazenamento de resultados baseado em consultas e parâmetros
- **TTL (Time To Live)**: Tempo de expiração de 1 hora para itens em cache
- **Endpoints de gerenciamento**: Rotas para limpar cache e visualizar estatísticas

### 1.2. Benefícios do Cache

- **Redução de chamadas à API**: Economiza na cota diária gratuita (100 consultas/dia)
- **Resposta mais rápida**: Retorna resultados instantaneamente para consultas repetidas
- **Robustez**: Permite continuar exibindo resultados mesmo com interrupções temporárias da API
- **Monitoramento**: Estatísticas sobre uso e eficiência do cache

### 1.3. Como Utilizar o Cache

#### Endpoints de Gerenciamento de Cache

Os seguintes endpoints foram adicionados para gerenciar o cache:

- **Limpar Cache**:
  ```
  curl -X POST http://localhost:3000/api/recommend/cache/clear
  ```

- **Obter Estatísticas do Cache**:
  ```
  curl http://localhost:3000/api/recommend/cache/stats
  ```

#### Exemplo de Estatísticas do Cache

```json
{
  "sucesso": true,
  "stats": {
    "keys": ["google_search_presentes tecnologia_10_1", "recommendations_tecnologia"],
    "stats": {
      "hits": 15,
      "misses": 8,
      "keys": 2,
      "ksize": 2,
      "vsize": 2
    },
    "itemCount": 2
  },
  "timestamp": "2025-06-25T10:15:30.123Z"
}
```

### 1.4. Testando o Sistema de Cache

Um script de teste foi criado para verificar o funcionamento do cache:

```
cd backend
node teste-cache-google.js
```

Este script executa uma série de testes que demonstram:
- Primeira busca (sem cache)
- Segunda busca (usando cache)
- Estatísticas do cache
- Busca com parâmetros diferentes
- Limpeza do cache

## 2. Otimização de Parâmetros de Busca

Além do sistema de cache, foram implementadas diversas otimizações nos parâmetros de busca para melhorar a relevância e qualidade dos resultados.

### 2.1. Parâmetros Otimizados

| Parâmetro | Descrição | Valor |
|-----------|-----------|-------|
| `gl` | Geolocalização | `br` (Brasil) |
| `cr` | País de origem dos resultados | `countryBR` (Brasil) |
| `lr` | Idioma dos resultados | `lang_pt` (Português) |
| `safe` | Filtro SafeSearch | `active` (Ativo) |
| `sort` | Ordenação dos resultados | `relevance` (Relevância) |
| `filter` | Filtro de duplicados | `1` (Ativado) |
| `imgSize` | Tamanho preferido para imagens | `medium` (Médio) |
| `rights` | Licença de conteúdo | Preferência por conteúdo livre |
| `fields` | Campos retornados | Limitado para economia de dados |

### 2.2. Otimização das Consultas

Foram implementadas melhorias nas consultas de busca:

- **Adição de termos de e-commerce**: Termos como "comprar", "online", "loja" são adicionados às consultas
- **Especificidade geográfica**: Adição do termo "Brasil" para priorizar resultados nacionais
- **Formatação de preços**: Melhoria na extração de preços nos formatos brasileiros (R$ XX,XX)
- **Extração de imagens**: Algoritmo aprimorado para selecionar a melhor imagem disponível

### 2.3. Exemplo de Consulta Otimizada

Antes:
```
presentes tecnologia
```

Depois:
```
presentes tecnologia comprar online Brasil loja
```

## 3. Extração de Imagens e Preços

Foram implementadas melhorias significativas na extração de imagens e preços dos resultados de busca.

### 3.1. Extração de Imagens

A função `getBestImage()` foi implementada para obter a melhor imagem disponível, seguindo uma hierarquia de prioridades:

1. Imagem de produto (quando disponível)
2. Imagem principal (cse_image)
3. Thumbnail (cse_thumbnail)
4. Meta tags OpenGraph (og:image)

Isso resulta em uma taxa maior de resultados com imagens válidas.

### 3.2. Extração de Preços

A função `extractPrice()` foi aprimorada para:

- Reconhecer diferentes formatos de preço brasileiros
- Extrair preços tanto do título quanto da descrição
- Lidar com formatação variada (R$ 10,90 / R$10.90 / R$ 1.299,00)

## 4. Testes e Validação

### 4.1. Scripts de Teste

Os seguintes scripts foram criados ou atualizados para testar as novas funcionalidades:

- `teste-cache-google.js`: Testa especificamente o sistema de cache
- `teste-google-only.js`: Teste geral de integração com Google Custom Search
- `test-google-api-detailed.js`: Teste detalhado com parâmetros variados

### 4.2. Como Executar os Testes

```
cd backend
node teste-cache-google.js
```

### 4.3. Resultados Esperados

- Primeira busca: Acesso à API (mais lento)
- Buscas subsequentes: Uso do cache (instantâneo)
- Estatísticas do cache: Aumento de "hits" ao longo do tempo
- Resultados mais relevantes com as consultas otimizadas

## 5. Próximos Passos

### 5.1. Aprimoramentos Futuros

- **Cache Persistente**: Implementar armazenamento persistente para o cache
- **Cache por Usuário**: Personalizar resultados em cache por perfil de usuário
- **Cache Inteligente**: Priorizar cache para consultas populares
- **Prefetching**: Pré-carregar resultados para consultas comuns
- **Estratégia de Expiração**: Implementar expiração variável com base na popularidade

### 5.2. Monitoramento

- Implementar logging detalhado do uso do cache
- Monitorar a taxa de acertos/erros do cache
- Analisar padrões de consulta para otimizar estratégias de cache

### 5.3. Ajustes Finos

- Ajustar o TTL (tempo de vida) do cache com base no uso
- Refinar parâmetros de busca para melhorar ainda mais os resultados
- Explorar novas opções de filtro da API do Google

## 6. Conclusão

As implementações de cache e otimizações de parâmetros de busca representam uma melhoria significativa na aplicação Easy Gift Search, resultando em:

- **Melhor Desempenho**: Respostas mais rápidas para consultas repetidas
- **Economia de Recursos**: Redução no número de chamadas à API
- **Resultados Mais Relevantes**: Consultas mais específicas e otimizadas
- **Maior Robustez**: Funcionamento mesmo durante interrupções temporárias da API

Para testar estas melhorias, execute o servidor backend e faça consultas repetidas para observar a diferença de velocidade entre a primeira consulta e as subsequentes.
