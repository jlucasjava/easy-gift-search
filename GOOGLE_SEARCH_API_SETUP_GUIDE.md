# Guia de Configuração do Google Custom Search API

Este guia detalha o processo para configurar a API Google Custom Search para uso no projeto Easy Gift Search.

## Passos para Configuração

### 1. Criar uma Conta Google Cloud Platform

1. Acesse [Google Cloud Platform](https://console.cloud.google.com/)
2. Crie uma nova conta ou faça login em uma conta existente
3. Crie um novo projeto (por exemplo, "Easy Gift Search")

### 2. Ativar a API Custom Search

1. No console do Google Cloud, navegue até "APIs & Serviços" > "Biblioteca"
2. Pesquise por "Custom Search API"
3. Selecione "Custom Search API" e clique em "Ativar"

### 3. Criar Credenciais da API

1. Navegue até "APIs & Serviços" > "Credenciais"
2. Clique em "Criar Credenciais" > "Chave de API"
3. Copie a chave de API gerada para usar como `GOOGLE_SEARCH_API_KEY`
4. (Opcional mas recomendado) Restrinja a chave de API para uso apenas com a Custom Search API

### 4. Configurar Programmatic Search Engine (PSE)

1. Acesse [Programmatic Search Engine](https://programmablesearchengine.google.com/about/)
2. Clique em "Get Started" ou "Create a Search Engine"
3. Configure o mecanismo de busca:
   - Dê um nome como "Easy Gift Search"
   - Em "Sites to search", você pode:
     - Adicionar sites específicos de e-commerce (amazon.com.br, shopee.com.br, etc.)
     - Ou escolher "Search the entire web" para buscar em toda a internet
4. Personalize conforme necessário (Imagens, Refinamentos, etc.)
5. Após a criação, acesse "Control Panel" > "Basics"
6. Copie o "Search engine ID" (este será o valor para `GOOGLE_SEARCH_CX`)

### 5. Configurar Variáveis de Ambiente no Projeto

1. No arquivo `.env` (ou equivalente para seu ambiente de implantação), defina:
   ```
   GOOGLE_SEARCH_API_KEY=sua-chave-api-gerada-no-passo-3
   GOOGLE_SEARCH_CX=seu-cx-id-obtido-no-passo-4
   USE_GOOGLE_SEARCH_API=true
   ```

2. Reinicie o servidor para aplicar as alterações

## Dicas para Melhorar os Resultados

- **Termos de Busca**: Use termos mais específicos como "presente para mulher 30 anos" em vez de apenas "presentes"
- **Restrições de Sites**: Adicione sites confiáveis ao seu PSE para resultados mais precisos
- **Sinônimos**: Configure sinônimos para termos de busca comuns (via painel de controle do PSE)
- **Labels**: Use os refinamentos e labels para categorizar resultados

## Limitações da API Gratuita

- 100 consultas gratuitas por dia
- Máximo de 10 resultados por consulta (em uma única página)
- Máximo de 10 consultas por segundo

## Monitoramento e Solução de Problemas

- Verifique o uso e cotas da API no console do Google Cloud
- Para problemas com os resultados, ajuste as configurações do seu PSE
- Use o painel de controle do PSE para verificar estatísticas e performance

## Recursos Adicionais

- [Documentação da API Custom Search](https://developers.google.com/custom-search/v1/overview)
- [Guia de Consultas](https://developers.google.com/custom-search/v1/using_rest)
- [Console Programmatic Search Engine](https://programmablesearchengine.google.com/)
