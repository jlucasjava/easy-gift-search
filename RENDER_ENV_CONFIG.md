# Instruções para Configurar Variáveis de Ambiente no Render.com

## Problema Identificado

A API do Google Search não está funcionando corretamente porque as variáveis de ambiente não estão configuradas no servidor de produção (Render.com).

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente no Render.com:

```
USE_GOOGLE_SEARCH_API=true
GOOGLE_SEARCH_API_KEY=AIzaSyBs07nRYL0fYREou8gwDkS7fruBydwXfvI
GOOGLE_SEARCH_CX=e17d0e713876e4dca
```

## Como Configurar no Render.com

1. Acesse o [Dashboard do Render](https://dashboard.render.com)
2. Selecione o serviço "Easy Gift Search"
3. Clique na aba "Environment"
4. Role até a seção "Environment Variables"
5. Adicione cada uma das variáveis acima na forma de pares "key-value"
6. Clique em "Save Changes"
7. Reinicie o serviço clicando em "Manual Deploy" > "Clear build cache & deploy"

## Verificação

Após a configuração e reinicialização, verifique se a API está funcionando corretamente acessando:
```
https://easy-gift-search.onrender.com/api/system/status
```

Você deverá ver que o Google Custom Search está ativo:
```
GOOGLE CUSTOM SEARCH: ✅ ATIVA
```

## Importante

Esse erro ocorreu porque:

1. O código tinha um trecho solto fora de uma função que tentava acessar uma variável `domain` não definida
2. As variáveis de ambiente necessárias para a API do Google Search não estavam configuradas no ambiente de produção

Ambos os problemas foram corrigidos. A correção do código já foi enviada para o repositório, mas as variáveis de ambiente precisam ser configuradas manualmente no Render.com.
