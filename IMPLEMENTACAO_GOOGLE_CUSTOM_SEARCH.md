# Guia de Implementação do Google Custom Search API

Este guia fornece instruções detalhadas para implementar e configurar a API do Google Custom Search no projeto Easy Gift Search.

## 1. Obter Credenciais da API Google Custom Search

### 1.1. Criar uma Conta no Google Cloud Platform
1. Acesse [Google Cloud Platform](https://console.cloud.google.com/)
2. Crie uma nova conta ou faça login em uma conta existente
3. Crie um novo projeto (por exemplo, "Easy Gift Search")

### 1.2. Ativar a API Custom Search
1. No console do Google Cloud, navegue até "APIs & Serviços" > "Biblioteca"
2. Pesquise por "Custom Search API"
3. Selecione "Custom Search API" e clique em "Ativar"

### 1.3. Criar Credenciais da API
1. Navegue até "APIs & Serviços" > "Credenciais"
2. Clique em "Criar Credenciais" > "Chave de API"
3. Copie a chave de API gerada - este será o valor para `GOOGLE_SEARCH_API_KEY`
4. (Recomendado) Restrinja a chave de API para uso apenas com a Custom Search API

### 1.4. Configurar Programmatic Search Engine (PSE)
1. Acesse [Programmatic Search Engine](https://programmablesearchengine.google.com/about/)
2. Clique em "Get Started" ou "Create a Search Engine"
3. Configure o mecanismo de busca:
   - Dê um nome como "Easy Gift Search"
   - Em "Sites to search", você pode:
     - Adicionar sites específicos de e-commerce (amazon.com.br, shopee.com.br, etc.)
     - Ou escolher "Search the entire web" para buscar em toda a internet
4. Personalize conforme necessário (Imagens, Refinamentos, etc.)
5. Após a criação, acesse "Control Panel" > "Basics"
6. Copie o "Search engine ID" - este será o valor para `GOOGLE_SEARCH_CX`

## 2. Configurar o Projeto

### 2.1. Configurar Variáveis de Ambiente
1. Edite o arquivo `.env` no diretório `backend/`:
   ```
   # Google Custom Search API
   GOOGLE_SEARCH_API_KEY=sua-chave-api-gerada-no-passo-1.3
   GOOGLE_SEARCH_CX=seu-cx-id-obtido-no-passo-1.4
   USE_GOOGLE_SEARCH_API=true
   
   # Configuração do servidor
   PORT=3000
   NODE_ENV=development
   ```

2. Faça o mesmo para o arquivo `.env.production` se estiver implantando em produção

### 2.2. Testar a Implementação
1. Navegue até o diretório do backend:
   ```
   cd backend
   ```

2. Execute o script de teste consolidado:
   ```
   node test-google-only-consolidated.js
   ```

3. Verifique se todos os testes estão passando com sucesso

### 2.3. Próximos Passos Após Instalação das Chaves API

Após configurar corretamente as chaves da API e confirmar que os testes estão passando, você deve:

1. **Iniciar o servidor para testar a integração completa**:
   ```
   npm start
   ```
   ou
   ```
   node server.js
   ```

2. **Testar a API através dos endpoints**:
   - Acesse `http://localhost:3000/api/products/search?query=presente+tecnologia` no navegador ou use um cliente como Postman
   - Verifique se os resultados estão sendo retornados corretamente da API do Google

3. **Verificar a integração com o frontend**:
   - Abra a aplicação em `http://localhost:3000`
   - Faça buscas usando o formulário de pesquisa
   - Confirme que os resultados estão sendo exibidos corretamente

4. **Ajustar e otimizar os resultados**:
   - Revise as consultas formadas no arquivo `googleSearchService.js`
   - Ajuste os parâmetros de busca conforme necessário para melhorar a relevância dos resultados

5. **Monitorar o uso da API**:
   - Acesse o console do Google Cloud para verificar o uso da sua cota diária
   - Implemente cache se necessário para reduzir o número de chamadas à API

## 3. Dicas para Otimização dos Resultados

### 3.1. Termos de Busca
- Use termos específicos como "presente para mulher 30 anos" em vez de apenas "presentes"
- Inclua palavras-chave como "comprar" ou "loja" para priorizar resultados de e-commerce

### 3.2. Configuração do PSE
- Adicione sites confiáveis ao seu PSE para resultados mais precisos
- Configure sinônimos para termos de busca comuns (via painel de controle do PSE)
- Use os refinamentos e labels para categorizar resultados

### 3.3. Filtros de Consulta
- Utilize filtros para aprimorar as consultas:
  - Faixa de preço: `preço entre R$50 e R$200`
  - Gênero: `para homem`, `para mulher`
  - Idade: `para criança 10 anos`
  - Ocasião: `aniversário`, `casamento`, `natal`

## 4. Limitações e Considerações

### 4.1. Limites da API Gratuita
- 100 consultas gratuitas por dia
- Máximo de 10 resultados por consulta (em uma única página)
- Máximo de 10 consultas por segundo

### 4.2. Monitoramento
- Monitore o uso e cotas da API no console do Google Cloud
- Para problemas com os resultados, ajuste as configurações do seu PSE
- Use o painel de controle do PSE para verificar estatísticas e desempenho

## 5. Recursos Adicionais

- [Documentação da API Custom Search](https://developers.google.com/custom-search/v1/overview)
- [Guia de Consultas](https://developers.google.com/custom-search/v1/using_rest)
- [Console Programmatic Search Engine](https://programmablesearchengine.google.com/)

## 6. Solução de Problemas

### 6.1. Erro 400 Bad Request
- Verifique se a chave da API está correta
- Confirme se o ID do mecanismo de pesquisa (CX) está correto
- Verifique se a consulta não contém caracteres especiais não suportados

### 6.2. Erro 403 Forbidden
- Verifique se a chave da API está ativa
- Verifique se você não excedeu a cota diária (100 consultas/dia no plano gratuito)
- Confirme se a chave não tem restrições que impedem seu uso

### 6.4. Resolução do Erro 403 (Forbidden)

Se você está recebendo o erro 403 ao testar a API, há duas opções para resolver:

#### 6.4.1. Usando o Script Assistente de Correção

Um script assistente interativo foi criado para facilitar o diagnóstico e correção do erro 403:

1. **Executar o script assistente**:
   - No Windows, execute o arquivo `corrigir-api-google.bat` na raiz do projeto
   - Ou navegue até o diretório backend e execute:
     ```
     node fix-google-api-error.js
     ```

2. **Seguir as instruções interativas**:
   - O script vai testar sua configuração atual
   - Oferecerá opções para abrir o Google Cloud Console
   - Permitirá atualizar sua chave de API e CX
   - Testará a API novamente após as alterações

#### 6.4.2. Correção Manual

Se preferir resolver manualmente, siga estes passos:

1. **Verificar o status da chave da API**:
   - Acesse o [Google Cloud Console](https://console.cloud.google.com/)
   - Navegue até "APIs & Serviços" > "Credenciais"
   - Verifique se a chave está ativa e não expirada

2. **Verificar as cotas e limites**:
   - Navegue até "APIs & Serviços" > "Painel"
   - Selecione "Custom Search API"
   - Verifique o uso atual e os limites na seção "Cotas"
   - O plano gratuito permite apenas 100 consultas por dia

3. **Verificar restrições da chave**:
   - No console, verifique se há restrições de IP, referenciador HTTP ou outros limites
   - Temporariamente, você pode remover todas as restrições para testar

4. **Criar uma nova chave de API**:
   - Se necessário, crie uma nova chave de API
   - Substitua a chave atual no arquivo `.env`

5. **Verificar o ID do mecanismo de busca (CX)**:
   - Acesse o [Programmatic Search Engine](https://programmablesearchengine.google.com/)
   - Verifique se o mecanismo está ativo e se o CX está correto

6. **Ativar a API para o projeto**:
   - Certifique-se de que a Custom Search API está ativada para o projeto específico que está usando
   - Verifique em "APIs & Serviços" > "Biblioteca" > "Custom Search API" > "Gerenciar"

### 6.3. Sem Resultados
- Tente termos de busca diferentes ou mais genéricos
- Verifique se o PSE está configurado para buscar nos sites corretos
- Teste diretamente no console do Google Cloud para verificar se a API está funcionando

## 7. Implantação em Produção

Após testar e verificar que tudo está funcionando corretamente em ambiente de desenvolvimento, siga estes passos para implantar em produção:

### 7.1. Preparar Variáveis de Ambiente para Produção

1. Configure o arquivo `.env.production` com as chaves corretas:
   ```
   # Google Custom Search API
   GOOGLE_SEARCH_API_KEY=sua-chave-api-de-producao
   GOOGLE_SEARCH_CX=seu-cx-id-de-producao
   USE_GOOGLE_SEARCH_API=true
   
   # Configuração do servidor
   PORT=3000
   NODE_ENV=production
   ```

2. Considere usar variáveis de ambiente seguras em sua plataforma de hospedagem (Vercel, Heroku, etc.) em vez de armazenar as chaves diretamente nos arquivos.

### 7.2. Otimizar para Produção

1. **Implementar Cache**:
   - Adicione um sistema de cache para economizar chamadas à API
   - Exemplo: armazenar resultados por alguns minutos para consultas frequentes

2. **Monitoramento de Erros**:
   - Implemente um sistema de logging para capturar e monitorar erros em produção
   - Configure alertas para falhas na API ou quando a cota estiver próxima do limite

3. **Fallback para Erros**:
   - Garanta que seu sistema tenha uma estratégia de fallback quando a API do Google não estiver disponível
   - Considere armazenar resultados populares para exibir em caso de falhas

### 7.3. Implantação

1. **Construir a Aplicação**:
   ```
   npm run build
   ```

2. **Implantar na Plataforma de Hospedagem**:
   - Vercel: `vercel --prod`
   - Heroku: `git push heroku main`
   - Ou use o processo específico para sua plataforma de hospedagem

3. **Verificar a Implantação**:
   - Teste todos os endpoints na versão de produção
   - Verifique o funcionamento do frontend
   - Monitore os logs para detectar possíveis erros

### 7.4. Manutenção Contínua

1. **Monitorar o Uso da API**:
   - Verifique regularmente a cota de uso no Google Cloud Console
   - Considere atualizar para um plano pago se necessário

2. **Atualizar Configurações do PSE**:
   - Refine periodicamente seu mecanismo de busca para melhorar resultados
   - Adicione novos sites de e-commerce relevantes

3. **Atualizar Dependências**:
   - Mantenha as bibliotecas e dependências atualizadas
   - Acompanhe as mudanças na API do Google Custom Search

## 8. Testando os Endpoints da API

Após iniciar o servidor, você pode testar os endpoints da API usando ferramentas como cURL, Postman ou simplesmente o navegador:

### 8.1. Endpoints Principais

1. **Verificar Status do Servidor**:
   ```
   curl http://localhost:3000/api/test
   ```
   
2. **Buscar Produtos**:
   ```
   curl http://localhost:3000/api/products
   ```
   
3. **Buscar Produtos com Query**:
   ```
   curl http://localhost:3000/api/products/search?query=presente+tecnologia
   ```
   
4. **Buscar Recomendações Aleatórias**:
   ```
   curl http://localhost:3000/api/recommend/random
   ```
   
5. **Obter Recomendações Específicas** (usando POST):
   ```
   curl -X POST http://localhost:3000/api/recommend \
     -H "Content-Type: application/json" \
     -d '{"query": "presente aniversário"}'
   ```

### 8.2. Parâmetros de Busca

Você pode refinar suas buscas adicionando parâmetros à URL:

1. **Filtro por Gênero**:
   ```
   curl http://localhost:3000/api/products/search?query=presente&genero=feminino
   ```
   
2. **Filtro por Faixa de Preço**:
   ```
   curl http://localhost:3000/api/products/search?query=presente&precoMin=50&precoMax=200
   ```
   
3. **Filtro por Idade**:
   ```
   curl http://localhost:3000/api/products/search?query=presente&idade=30
   ```
   
4. **Filtro por Categoria**:
   ```
   curl http://localhost:3000/api/products/search?query=presente&categoria=tecnologia
   ```
   
5. **Combinando Filtros**:
   ```
   curl http://localhost:3000/api/products/search?query=presente&genero=masculino&idade=40&categoria=esporte
   ```

### 8.3. Resposta Típica da API

Exemplo de resposta da API de produtos:

```json
{
  "produtos": [
    {
      "id": "google-0",
      "nome": "Smartphone XYZ - Presente tecnologia - Item 1",
      "preco": "R$ 1299,90",
      "imagem": "https://exemplo.com/imagem1.jpg",
      "url": "https://exemplo.com/produto/1",
      "descricao": "Smartphone com tela HD, 128GB de memória e câmera de alta resolução.",
      "marketplace": "Google",
      "categoria": "Tecnologia"
    },
    // ... mais produtos
  ],
  "sucesso": true,
  "query": "presente tecnologia",
  "totalResultados": 10,
  "pagina": 1,
  "totalPaginas": 1,
  "timestamp": "2025-06-20T13:15:27.931Z"
}
```

## 9. Próximos Passos Detalhados

Agora que você já configurou a API do Google Custom Search e testou os endpoints básicos, aqui estão os próximos passos detalhados para completar a implementação:

### 9.1. Corrigir o Erro 403 (Forbidden)

Se você está enfrentando o erro 403 ao tentar usar a API, você pode usar o script assistente interativo ou seguir os passos manuais:

#### Opção 1: Usando o Script Assistente de Correção

1. **Execute o script assistente**:
   ```
   # No Windows, clique no arquivo na pasta raiz:
   corrigir-api-google.bat
   
   # Ou, no diretório backend:
   cd backend
   node fix-google-api-error.js
   ```
   
2. **Siga as instruções interativas** que o script fornecerá para:
   - Testar sua configuração atual
   - Abrir o Google Cloud Console para ativar a API
   - Criar uma nova chave se necessário
   - Atualizar o CX do mecanismo de pesquisa
   - Testar novamente após as alterações

#### Opção 2: Correção Manual

1. **Verificar a ativação da API**:
   ```
   cd backend
   node -e "console.log(require('dotenv').config(), process.env.GOOGLE_SEARCH_API_KEY, process.env.GOOGLE_SEARCH_CX)"
   ```
   Este comando vai mostrar suas chaves atuais para verificação.

2. **Criar uma nova chave de API**:
   - Acesse o [Google Cloud Console](https://console.cloud.google.com/)
   - Selecione seu projeto
   - Vá para "APIs & Serviços" > "Credenciais"
   - Clique em "Criar credenciais" > "Chave de API"
   - Copie a nova chave

3. **Atualizar a chave no arquivo .env**:
   ```
   # Abra o arquivo .env no editor
   # Substitua a linha GOOGLE_SEARCH_API_KEY com sua nova chave
   GOOGLE_SEARCH_API_KEY=sua-nova-chave-aqui
   ```

4. **Verificar o mecanismo de busca**:
   - Acesse [Programmatic Search Engine](https://programmablesearchengine.google.com/)
   - Verifique se o mecanismo está configurado para buscar na web inteira ou nos sites desejados
   - Confirme se o status está como "Ativo"

5. **Testar novamente a API**:
   ```
   cd backend
   node test-google-only-consolidated.js
   ```

### 9.2. Refinando a Implementação

Após corrigir os problemas com a API, você pode refinar a implementação:

1. **Melhorar as consultas de busca**:
   - Edite `backend/services/googleSearchService.js`
   - Ajuste a função `searchGoogle` para otimizar parâmetros como:
     - Adicionar parâmetros `cr=countryBR` para resultados do Brasil
     - Ajustar o parâmetro `num` para o número ideal de resultados
     - Considerar adicionar filtros como `rights=cc_publicdomain` para diferentes tipos de licença

2. **Implementar cache para economizar consultas**:
   - Um sistema de cache completo já foi implementado no projeto
   - Consulte o documento [IMPLEMENTACAO_CACHE_GOOGLE.md](./IMPLEMENTACAO_CACHE_GOOGLE.md) para detalhes
   - O sistema utiliza `node-cache` para armazenar resultados por 1 hora
   - Inclui endpoints para gerenciamento do cache e visualização de estatísticas
   - Reduz significativamente o número de chamadas à API

3. **Instalar a dependência do cache**:
   ```
   cd backend
   npm install node-cache --save
   ```

### 9.3. Integrando com o Frontend

Para garantir que o frontend está usando corretamente a API:

1. **Verificar o frontend**:
   - Abra `public/js/app.js` ou o arquivo principal do frontend
   - Confirme se as chamadas à API estão usando os endpoints corretos
   - Certifique-se de que a exibição dos resultados está formatada corretamente

2. **Testar a interface do usuário**:
   - Inicie o servidor: `cd backend && npm start`
   - Abra o navegador em `http://localhost:3000`
   - Faça várias buscas com diferentes filtros
   - Verifique se os resultados são exibidos corretamente

3. **Ajustar a exibição dos resultados**:
   - Modifique o frontend para exibir adequadamente os resultados do Google
   - Adicione tratamento para imagens ausentes ou preços não encontrados

### 9.4. Preparar para Produção

Quando estiver satisfeito com a implementação:

1. **Criar arquivo de variáveis de ambiente para produção**:
   ```
   cd backend
   cp .env .env.production
   # Edite .env.production com as chaves de produção
   ```

2. **Testar em modo de produção**:
   ```
   cd backend
   NODE_ENV=production node server.js
   ```

3. **Implantar na plataforma de hospedagem**:
   - Configure as variáveis de ambiente na plataforma de hospedagem
   - Implante o código seguindo as instruções da plataforma específica
   - Monitore os logs após a implantação para detectar possíveis erros

### 9.5. Monitoramento e Manutenção

Após a implantação:

1. **Configurar monitoramento**:
   - Configure alertas de uso da API no Google Cloud Console
   - Implemente logging para monitorar erros e uso
   - Considere usar um serviço de monitoramento como Sentry ou New Relic

2. **Documentação para usuários**:
   - Crie um guia de uso para os usuários finais da aplicação
   - Documente limitações conhecidas e como lidar com problemas comuns

3. **Plano de contingência**:
   - Desenvolva uma estratégia para lidar com interrupções da API
   - Considere implementar um sistema de fallback com dados populares pré-carregados
