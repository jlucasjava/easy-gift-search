# Guia de Integração Frontend-Backend para Easy Gift Search

Este guia apresenta instruções detalhadas para resolver problemas comuns e validar a integração entre o frontend e o backend do projeto Easy Gift Search, com foco no uso da Google Custom Search API.

## 1. Preparação para Integração

### 1.1. Verificar Configuração das Chaves API

Antes de começar, certifique-se de que as chaves da API estão configuradas corretamente:

1. Verifique o arquivo `.env` no diretório `backend/`:
   ```
   GOOGLE_SEARCH_API_KEY=sua-chave-api-do-google
   GOOGLE_SEARCH_CX=seu-cx-id-do-programmatic-search-engine
   USE_GOOGLE_SEARCH_API=true
   ```

2. Execute o script de diagnóstico para verificar a configuração:
   ```
   cd backend
   node test-frontend-integration.js
   ```

3. Se o script indicar "DADOS SIMULADOS", verifique suas chaves e certifique-se de que a API está ativada no Google Cloud Console.

### 1.2. Iniciar o Servidor Backend

1. Inicie o servidor backend:
   ```
   cd backend
   node server.js
   ```

2. Verifique se o servidor está respondendo corretamente acessando `http://localhost:3000/api/test` no navegador ou usando curl.

## 2. Validação da Integração

### 2.1. Testar Endpoints da API

1. Teste o endpoint de produtos com uma consulta simples:
   ```
   curl "http://localhost:3000/api/products?query=presente+tecnologia"
   ```

2. Verifique se a resposta contém os campos esperados pelo frontend:
   - `id`: Identificador único do produto
   - `nome` ou `titulo`: Título do produto
   - `preco`: Preço formatado ou null
   - `imagem`: URL da imagem ou null
   - `url`: Link para o produto
   - `descricao`: Descrição ou snippet
   - `marketplace`: Deve ser "Google"

### 2.2. Testar a Interface do Usuário

1. Abra `http://localhost:3000` no navegador.

2. Faça uma busca usando o formulário principal. Tente diferentes combinações:
   - Apenas texto: "presente tecnologia"
   - Com filtros: Idade, gênero, faixa de preço

3. Verifique se os resultados são exibidos corretamente no grid:
   - As imagens são carregadas (ou mostram placeholder quando ausentes)
   - Os preços são exibidos corretamente (ou mostram "Consultar" quando ausentes)
   - Os títulos são formatados adequadamente
   - Os badges de origem mostram "Google"

4. Teste o salvamento de favoritos:
   - Clique em "Favoritar" em alguns produtos
   - Navegue para a aba de Favoritos
   - Verifique se os produtos são exibidos corretamente
   - Teste a remoção de favoritos

## 3. Resolução de Problemas Comuns

### 3.1. Imagens Não Aparecem

**Problema**: Imagens não são exibidas nos cards de produtos.

**Soluções**:
1. Verifique o console do navegador para erros relacionados às URLs das imagens.
2. Confirme que a função `getBestImage` no backend está extraindo corretamente as URLs.
3. Verifique se a função `validarImagem` no frontend está tratando corretamente URLs inválidas.
4. Certifique-se de que a imagem placeholder está disponível no caminho especificado em `CONFIG.placeholderImage`.

### 3.2. Preços Não Aparecem

**Problema**: Preços estão ausentes ou mal formatados.

**Soluções**:
1. Verifique se a função `extractPrice` no backend está identificando preços nos resultados.
2. Confirme que a função `formatarPreco` no frontend está lidando corretamente com preços null ou inválidos.
3. Inspecione a resposta da API para verificar se o campo `preco` está sendo enviado corretamente.

### 3.3. Resultados Vazios

**Problema**: Nenhum resultado é exibido após a busca.

**Soluções**:
1. Verifique o console do navegador para erros durante a chamada da API.
2. Examine os logs do servidor para erros na API do Google.
3. Teste o endpoint diretamente usando curl para verificar se retorna dados.
4. Verifique se as chaves da API estão configuradas corretamente no `.env`.
5. Confirme se o limite diário da API gratuita (100 consultas) não foi excedido.

### 3.4. Erros de CORS

**Problema**: Erros de Cross-Origin Resource Sharing no console do navegador.

**Soluções**:
1. Verifique se o middleware CORS está configurado corretamente no backend.
2. Confirme que a URL da API no frontend corresponde ao host do backend.
3. Se estiver usando localhost, certifique-se de que o protocolo (http vs https) corresponde.

### 3.5. Incompatibilidade de Formatos

**Problema**: Erros no frontend relacionados a propriedades indefinidas.

**Soluções**:
1. Verifique se o formato da resposta da API corresponde ao esperado pelo frontend.
2. Adicione verificações de null/undefined no frontend para propriedades que podem estar ausentes.
3. Use operadores de coalescência nula (`??`) para fornecer valores padrão.

## 4. Otimizações e Melhorias

### 4.1. Melhorar o Tempo de Carregamento

1. Implemente lazy loading para imagens.
2. Adicione skeleton loaders durante o carregamento dos resultados.
3. Melhore a estratégia de cache para reduzir chamadas à API.

### 4.2. Melhorar a Exibição de Resultados

1. Adicione filtros interativos para refinar resultados já carregados.
2. Implemente ordenação por preço, relevância ou popularidade.
3. Adicione visualização em lista como alternativa ao grid.

### 4.3. Melhorar a Experiência do Usuário

1. Adicione sugestões de busca baseadas em consultas populares.
2. Implemente histórico de busca para o usuário.
3. Adicione feedback visual durante o processo de busca.
4. Melhore a responsividade para dispositivos móveis.

## 5. Verificação Final

Antes de considerar a integração concluída, realize as seguintes verificações:

1. **Teste em Diferentes Navegadores**:
   - Chrome, Firefox, Safari, Edge

2. **Teste em Diferentes Dispositivos**:
   - Desktop, tablet, smartphone

3. **Teste de Carga**:
   - Verifique o comportamento com muitos resultados
   - Teste o cache com consultas repetidas

4. **Monitoramento**:
   - Implemente logs detalhados para rastrear problemas
   - Configure alertas para erros críticos

5. **Feedback dos Usuários**:
   - Adicione um mecanismo para coletar feedback
   - Monitore métricas de uso para identificar problemas

## 6. Recursos Adicionais

- [Documentação da Google Custom Search API](https://developers.google.com/custom-search/v1/overview)
- [Guia de Implementação do Google Custom Search](./IMPLEMENTACAO_GOOGLE_CUSTOM_SEARCH.md)
- [Implementação de Cache](./IMPLEMENTACAO_CACHE_GOOGLE.md)
