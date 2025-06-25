# Configuração de Variáveis de Ambiente no Render

## ⚠️ IMPORTANTE: A API do Google não está funcionando em produção

O log do servidor mostra que a variável `USE_GOOGLE_SEARCH_API` está sendo lida como `false` em produção.

## Passo a Passo para Configurar Variáveis de Ambiente no Render

1. Acesse o [Dashboard do Render](https://dashboard.render.com/)
2. Selecione seu serviço "easy-gift-search"
3. Clique na aba "Environment"
4. Adicione as seguintes variáveis de ambiente:

```
USE_GOOGLE_SEARCH_API=true
GOOGLE_SEARCH_API_KEY=AIzaSyBs07nRYL0fYREou8gwDkS7fruBydwXfvI
GOOGLE_SEARCH_CX=e17d0e713876e4dca
```

5. Certifique-se de que a opção "Secret" esteja marcada para as chaves de API
6. Clique em "Save Changes"
7. Aguarde o redeploy automático ou clique em "Manual Deploy" > "Clear Build Cache & Deploy"

## Verificação

Após a aplicação da configuração, verifique os logs do servidor para confirmar que a API do Google está ativa:

```
⚙️ CONFIGURAÇÕES:
   USE_GOOGLE_SEARCH_API: true
🎉 STATUS GERAL: GOOGLE CUSTOM SEARCH API ATIVA
```

## Correção do Erro de Rate Limiting

Os logs mostram um erro relacionado à configuração `trust proxy` do Express:

```
ValidationError: The Express 'trust proxy' setting is true, which allows anyone to trivially bypass IP-based rate limiting.
```

Este erro foi corrigido na versão mais recente, substituindo:

```javascript
app.set('trust proxy', true)
```

Por uma configuração mais segura:

```javascript
app.set('trust proxy', '127.0.0.1, ::1')
```

## Solução de Problemas

Se após configurar as variáveis, a API ainda não estiver funcionando:

1. Verifique se as variáveis foram salvas corretamente no painel do Render
2. Confirme que o serviço foi reiniciado após as alterações
3. Verifique se há erros nos logs relacionados à API do Google
4. Teste a API diretamente com um cliente HTTP como Postman ou cURL
