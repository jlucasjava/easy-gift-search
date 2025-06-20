# Guia de Migração - Easy Gift Search: Versão Google Custom Search

Este guia destina-se a usuários que estão migrando da versão anterior com múltiplas APIs (Amazon, Shopee, AliExpress, Mercado Livre, etc.) para a nova versão que usa exclusivamente a API do Google Custom Search.

## O Que Mudou?

### 1. Simplificação da Arquitetura
- **Antes**: Integração com 5+ APIs diferentes (Amazon, Shopee, AliExpress, Mercado Livre, OpenAI, etc.)
- **Agora**: Integração exclusiva com Google Custom Search API

### 2. Variáveis de Ambiente
- **Antes**:
  ```
  OPENAI_API_KEY=sua_chave_openai
  RAPIDAPI_KEY=sua_chave_rapidapi
  RAPIDAPI_KEY_NEW=sua_chave_rapidapi_nova
  SHOPEE_SCRAPER_API_KEY=sua_chave_shopee
  USE_REAL_AMAZON_API=true
  USE_REAL_SHOPEE_API=true
  USE_REAL_ALIEXPRESS_API=true
  USE_REAL_MERCADOLIVRE_API=true
  USE_REAL_REALTIME_API=true
  ```

- **Agora**:
  ```
  GOOGLE_SEARCH_API_KEY=sua_chave_google_api
  GOOGLE_SEARCH_CX=seu_cx_id
  USE_GOOGLE_SEARCH_API=true
  ```

### 3. Endpoints da API
- **Antes**: Múltiplos endpoints para diferentes marketplaces
- **Agora**: Endpoints simplificados que usam apenas Google Custom Search

## Como Migrar

### 1. Configurar o Google Custom Search
1. Acesse [Google Programmable Search Engine](https://programmablesearchengine.google.com/about/)
2. Crie uma nova Search Engine
3. Configure-a para buscar em toda a web
4. Obtenha seu `cx` (Search Engine ID)
5. Acesse [Google Cloud Console](https://console.cloud.google.com/)
6. Crie um projeto e habilite a API Custom Search
7. Gere uma chave de API

### 2. Atualizar Variáveis de Ambiente
1. Edite seu arquivo `.env`:
   ```
   GOOGLE_SEARCH_API_KEY=sua_chave_google_api
   GOOGLE_SEARCH_CX=seu_cx_id
   USE_GOOGLE_SEARCH_API=true
   ```

### 3. Remover Integrações Antigas
Se você personalizou o código:
1. Remova referências a outros marketplaces no frontend
2. Atualize os controladores para usar apenas o serviço Google
3. Remova serviços não utilizados

## Benefícios da Migração

- **Simplicidade**: Apenas uma API para gerenciar e manter
- **Custo**: Google Custom Search oferece um nível gratuito (100 consultas/dia)
- **Cobertura**: Resultados de toda a web, não apenas marketplaces específicos
- **Manutenção**: Menos código para manter e menos dependências

## Limitações

- **Estruturação de Dados**: Os resultados podem ser menos estruturados que APIs específicas de marketplaces
- **Informações de Preço**: A extração de preços é baseada em padrões de texto, pode não ser 100% precisa

## Precisa de Ajuda?

Se encontrar problemas durante a migração, consulte a documentação completa ou abra uma issue no repositório do projeto.

---

Equipe Easy Gift Search
