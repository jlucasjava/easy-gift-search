# Instruções para Configuração da Vercel

## Variáveis de Ambiente Necessárias

Para garantir o funcionamento correto da API de busca do Google, configure as seguintes variáveis de ambiente no projeto Vercel:

```
USE_GOOGLE_SEARCH_API=true
GOOGLE_SEARCH_API_KEY=AIzaSyBs07nRYL0fYREou8gwDkS7fruBydwXfvI
GOOGLE_SEARCH_CX=e17d0e713876e4dca
```

## Como Configurar

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Selecione o projeto "Easy Gift Search"
3. Clique na aba "Settings"
4. Navegue até "Environment Variables" 
5. Adicione as variáveis acima uma a uma
6. Certifique-se de que estão marcadas para os ambientes "Production", "Preview" e "Development"
7. Clique em "Save" para salvar as configurações
8. Redeploy o projeto para aplicar as novas variáveis de ambiente

## Verificação

Após o deploy, verifique se a API está funcionando corretamente acessando:
`https://seu-projeto.vercel.app/api/system/status`

Você deve ver uma mensagem indicando que o Google Custom Search está ativo.
