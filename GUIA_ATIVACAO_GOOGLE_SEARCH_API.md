# Guia Completo: Ativando a Google Custom Search API

## Problema: API não está sendo reconhecida como ativa

Você está enfrentando o seguinte erro:
```
� GOOGLE CUSTOM SEARCH:
   ❌ INATIVA - Google Custom Search API não habilitada
```

Este guia irá ajudá-lo a resolver definitivamente este problema tanto no ambiente local quanto em produção.

## Solução

### 1. Verificar e Corrigir Variáveis de Ambiente Locais

As seguintes variáveis de ambiente são necessárias para a Google Custom Search API funcionar:

```
USE_GOOGLE_SEARCH_API=true
GOOGLE_SEARCH_API_KEY=AIzaSyBs07nRYL0fYREou8gwDkS7fruBydwXfvI
GOOGLE_SEARCH_CX=e17d0e713876e4dca
```

Estas variáveis devem estar presentes em:
- `backend/.env`
- `.env` (na raiz do projeto)
- `.vercel-env-values.local` (para referência local)

### 2. Execute o Script de Correção Automática

Foi criado um script para automatizar a correção:

```bash
# Windows
fixar-google-search.bat

# Ou diretamente via Node.js
node fixar-google-search-api.js
```

Este script:
- Verifica todas as variáveis de ambiente necessárias
- Corrige os arquivos de configuração local
- Cria um marcador para confirmar a correção
- Faz commit e push das alterações
- Testa a API para confirmar funcionamento

### 3. Configuração em Produção

Para garantir que a API esteja ativa em produção, você precisa:

#### Se estiver usando Vercel:

1. Acesse o dashboard da Vercel
2. Selecione seu projeto
3. Vá para "Settings" > "Environment Variables"
4. Adicione as seguintes variáveis:
   ```
   USE_GOOGLE_SEARCH_API=true
   GOOGLE_SEARCH_API_KEY=AIzaSyBs07nRYL0fYREou8gwDkS7fruBydwXfvI
   GOOGLE_SEARCH_CX=e17d0e713876e4dca
   ```
5. Clique em "Save"
6. Faça um novo deploy do projeto (ou use "Redeploy" na aba "Deployments")

#### Se estiver usando Render:

1. Acesse o dashboard da Render
2. Selecione seu serviço
3. Vá para "Environment"
4. Adicione as mesmas variáveis de ambiente mencionadas acima
5. Clique em "Save Changes"
6. O Render irá automaticamente fazer um novo deploy

### 4. Correção de Erros de Dependência Circular

Durante a análise, notamos avisos sobre dependências circulares:

```
Warning: Accessing non-existent property 'extractDomainFromUrl' of module exports inside circular dependency
Warning: Accessing non-existent property 'getMarketplaceImage' of module exports inside circular dependency
Warning: Accessing non-existent property 'detectMarketplace' of module exports inside circular dependency
```

Estas dependências circulares podem causar problemas em algumas situações. Elas já foram corrigidas no arquivo `googleSearchService.js` com a implementação da verificação adequada para a variável `domain` na função `getMarketplaceImage`.

### 5. Teste de Verificação

Após aplicar todas as correções, execute o seguinte teste para verificar se a API está funcionando corretamente:

```bash
cd backend
node teste-google-only.js
```

Você deverá ver a mensagem indicando que a API está ativa:

```
📋 VERIFICANDO CONFIGURAÇÃO:
🔑 GOOGLE_SEARCH_API_KEY: ✅ Configurada
🔑 GOOGLE_SEARCH_CX: ✅ Configurado
⚙️ USE_GOOGLE_SEARCH_API: ✅ Ativo
```

E um teste real de busca deve retornar resultados.

## Troubleshooting

Se a API ainda não estiver ativa após seguir todos os passos acima:

1. **Verifique os logs de produção** para identificar possíveis erros
2. **Confirme que a API do Google está ativa** - verifique no console do Google Cloud se a API Custom Search está habilitada
3. **Teste localmente com as mesmas variáveis de ambiente** para isolar o problema
4. **Verifique se há firewalls ou restrições de rede** no ambiente de produção que possam estar bloqueando requisições para a API do Google

## Referências

- [Google Custom Search JSON API Documentation](https://developers.google.com/custom-search/v1/overview)
- [Configuração de Variáveis de Ambiente na Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [Configuração de Variáveis de Ambiente no Render](https://render.com/docs/environment-variables)
