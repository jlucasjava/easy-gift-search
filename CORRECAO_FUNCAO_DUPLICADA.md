# Correção Função Duplicada

Este commit corrige o erro de duplicidade na função `simulateGoogleResults` que estava impedindo o deploy.

## Alterações:

1. Removida a definição duplicada da função `simulateGoogleResults` no arquivo `googleSearchService.js`
2. Corrigida a importação do módulo `simulateGoogleResults.js`
3. Adicionada a função `simulateGoogleResults` às exportações do módulo

## Impacto:

Esta correção resolve o problema que impedia o deploy em ambiente de produção (Render/Vercel).
