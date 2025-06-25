# Instruções para Ativar a Google Custom Search API em Produção

Se você está vendo a mensagem `GOOGLE CUSTOM SEARCH: ❌ INATIVA - Google Custom Search API não habilitada` em produção, siga estas instruções para resolver o problema:

## 1. Verifique as Variáveis de Ambiente em Produção

A Google Custom Search API requer três variáveis de ambiente:

```
USE_GOOGLE_SEARCH_API=true
GOOGLE_SEARCH_API_KEY=AIzaSyBs07nRYL0fYREou8gwDkS7fruBydwXfvI
GOOGLE_SEARCH_CX=e17d0e713876e4dca
```

### Na Vercel:

1. Acesse [vercel.com](https://vercel.com/) e faça login
2. Selecione seu projeto
3. Vá para **Settings** > **Environment Variables**
4. Verifique se as três variáveis acima estão configuradas
5. Se alguma estiver faltando, adicione-a
6. Clique em **Save**
7. Vá para a aba **Deployments** e clique em **Redeploy** no deploy mais recente

### Na Render:

1. Acesse [render.com](https://render.com/) e faça login
2. Selecione seu serviço (Web Service)
3. Vá para a aba **Environment**
4. Verifique se as três variáveis acima estão configuradas
5. Se alguma estiver faltando, adicione-a
6. Clique em **Save Changes**
7. A plataforma irá fazer um novo deploy automaticamente

## 2. Corrija Dependências Circulares

Executar o script de correção de dependências circulares:

```bash
node corrigir-dependencias-circulares.js
```

## 3. Verificação pós-deploy

Após o deploy, acesse a URL de seu serviço e verifique o status da API:

```
https://seu-dominio.com/api/status
```

Você deve ver a mensagem:

```
GOOGLE CUSTOM SEARCH: ✅ ATIVA - Usando Google Custom Search API
```

Se ainda não estiver funcionando, verifique os logs do serviço para identificar possíveis erros.

## 4. Forçar a Ativação em Produção

Se as etapas anteriores não resolverem o problema, você pode modificar o arquivo `backend/config/apiStatus.js` para forçar a detecção da API como ativa:

```javascript
// Linha 14
const googleSearchEnabled = process.env.USE_GOOGLE_SEARCH_API === 'true';
```

Alterando para:

```javascript
// Linha 14
const googleSearchEnabled = process.env.USE_GOOGLE_SEARCH_API === 'true' || 
                           process.env.USE_GOOGLE_SEARCH_API === true || 
                           process.env.USE_GOOGLE_SEARCH_API === '1' ||
                           fs.existsSync(path.join(__dirname, '..', 'FORCE_GOOGLE_API_ACTIVE'));
```

## 5. Teste Direto da API

Para testar diretamente se a API do Google está funcionando, você pode usar este comando cURL:

```bash
curl -X GET "https://www.googleapis.com/customsearch/v1?key=AIzaSyBs07nRYL0fYREou8gwDkS7fruBydwXfvI&cx=e17d0e713876e4dca&q=presentes"
```

Se retornar resultados JSON, a API está funcionando corretamente e o problema está na integração com sua aplicação.
